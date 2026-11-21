import "server-only"

import type { z } from "zod"

import { AiGenerationError } from "../errors"
import type { LlmProvider, StructuredRequest } from "../llm"

/**
 * Google Gemini through its OpenAI-compatible endpoint. Works with a free
 * API key from https://aistudio.google.com/apikey (free tier, rate limited).
 */
const ENDPOINT_URL = process.env.GEMINI_ENDPOINT_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
const DEFAULT_MODEL = "gemini-3.8-flash"
const REQUEST_TIMEOUT_MS = 55_000

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>
}

/** Pulls the first JSON object out of a model reply (models sometimes add prose or code fences). */
export function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end <= start) throw new SyntaxError("No JSON object in reply")
  return JSON.parse(candidate.slice(start, end + 1))
}

async function callGemini(token: string, body: unknown): Promise<string> {
  let response: Response
  try {
    response = await fetch(ENDPOINT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new AiGenerationError("Couldn't reach Gemini. Try again in a moment.", true)
  }

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    const detail = await response.text().catch(() => "")
    if (response.status !== 400 || /api key|API_KEY/i.test(detail)) {
      throw new AiGenerationError("Gemini rejected the API key. Check GEMINI_API_KEY (create one at aistudio.google.com/apikey).")
    }
    throw new AiGenerationError("Gemini couldn't process the request. Check GEMINI_MODEL is a valid model name.")
  }
  if (response.status === 404) {
    throw new AiGenerationError("Gemini doesn't recognise that model. Check GEMINI_MODEL.")
  }
  if (response.status === 429) {
    throw new AiGenerationError("You've hit Gemini's free-tier rate limit. Wait a minute and try again.", true)
  }
  if (!response.ok) {
    throw new AiGenerationError(`Gemini returned an error (${response.status}). Try again in a moment.`, true)
  }

  const json = (await response.json().catch(() => null)) as ChatCompletionResponse | null
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new AiGenerationError("Gemini returned an empty reply. Try again.", true)
  return content
}

export const geminiProvider: LlmProvider = {
  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY)
  },

  async generateStructured<Schema extends z.ZodType>({ system, prompt, schema, jsonShape, maxTokens = 8000 }: StructuredRequest<Schema>) {
    const token = process.env.GEMINI_API_KEY as string
    const messages = [
      {
        role: "system",
        content: `${system}\n\nReply with a single JSON object and nothing else: no Markdown, no code fences, no commentary. The JSON must have exactly this shape:\n${jsonShape}`,
      },
      { role: "user", content: prompt },
    ]

    let lastIssue = ""
    // Open models occasionally return malformed JSON, so allow one retry.
    for (let attempt = 0; attempt < 2; attempt++) {
      const content = await callGemini(token, {
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      })
      try {
        const parsed = schema.safeParse(extractJsonObject(content))
        if (parsed.success) return parsed.data as z.infer<Schema>
        lastIssue = parsed.error.issues[0]?.message ?? "schema mismatch"
      } catch (error) {
        lastIssue = error instanceof Error ? error.message : "invalid JSON"
      }
    }
    console.warn("[ai/gemini] unusable structured reply:", lastIssue)
    throw new AiGenerationError("The AI returned content in an unexpected format. Try again.", true)
  },
}
