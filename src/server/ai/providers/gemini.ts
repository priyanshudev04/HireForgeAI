import "server-only"

import type { z } from "zod"

import { AiGenerationError } from "../errors"
import type { LlmProvider, StructuredRequest } from "../llm"
import { AiError, type StreamTextRequest } from "../types"

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

interface ChatCompletionChunk {
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[]
  error?: { message?: string } | string
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

async function toAiError(response: Response): Promise<AiError> {
  const text = await response.text().catch(() => "")
  let detail = text.slice(0, 300)
  try {
    // Gemini sometimes wraps the error object in an array.
    const raw = JSON.parse(text)
    const body = Array.isArray(raw) ? raw[0] : raw
    detail = typeof body?.error === "string" ? body.error : (body?.error?.message ?? detail)
  } catch {}

  if (response.status === 401 || response.status === 403 || /api key/i.test(detail)) {
    return new AiError("AI_NOT_CONFIGURED", "The Gemini API key was rejected. Check GEMINI_API_KEY.", 503)
  }
  if (response.status === 429) {
    return /quota|per day|daily/i.test(detail)
      ? new AiError("AI_QUOTA_EXCEEDED", "Today's free Gemini quota is used up. It resets at midnight Pacific time.", 429)
      : new AiError("AI_RATE_LIMITED", "Too many messages at once on the free tier. Wait a minute and try again.", 429)
  }
  if (response.status === 400 || response.status === 404) {
    return new AiError("AI_PROVIDER_ERROR", `Gemini couldn't handle the request: ${detail || response.status}. Check GEMINI_MODEL.`, 502)
  }
  return new AiError("AI_PROVIDER_ERROR", `Gemini error ${response.status}. Try again shortly.`, 502)
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

  async *streamText({ system, messages, signal }: StreamTextRequest) {
    const token = process.env.GEMINI_API_KEY
    if (!token) {
      throw new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not set on the server.", 503)
    }

    let response: Response
    try {
      response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
          messages: [{ role: "system", content: system }, ...messages],
          max_tokens: 8192,
          stream: true,
        }),
        signal,
      })
    } catch (error) {
      if (signal?.aborted) throw error
      throw new AiError("AI_PROVIDER_ERROR", "Couldn't reach Gemini.", 502)
    }

    if (!response.ok || !response.body) throw await toAiError(response)

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ""
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) return
        buffer += value
        let newline: number
        while ((newline = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newline).trim()
          buffer = buffer.slice(newline + 1)
          if (!line.startsWith("data:")) continue
          const data = line.slice(5).trim()
          if (data === "[DONE]") return
          let chunk: ChatCompletionChunk
          try {
            chunk = JSON.parse(data)
          } catch {
            continue
          }
          if (chunk.error) {
            const message = typeof chunk.error === "string" ? chunk.error : chunk.error.message
            throw new AiError("AI_PROVIDER_ERROR", message || "The model stopped with an error.", 502)
          }
          const text = chunk.choices?.[0]?.delta?.content
          if (text) yield text
        }
      }
    } finally {
      reader.releaseLock()
    }
  },

}
