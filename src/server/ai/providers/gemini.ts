import { AiError, type LlmProvider, type StreamTextRequest } from "../types"

// Google Gemini through its OpenAI-compatible endpoint (https://ai.google.dev/gemini-api/docs/openai).
// Free key: https://aistudio.google.com/apikey

const ENDPOINT =
  process.env.GEMINI_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
const DEFAULT_MODEL = "gemini-3.8-flash"

interface ChatCompletionChunk {
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[]
  error?: { message?: string } | string
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
  name: "gemini",

  async *streamText({ system, messages, signal }: StreamTextRequest) {
    const token = process.env.GEMINI_API_KEY
    if (!token) {
      throw new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not set on the server.", 503)
    }

    let response: Response
    try {
      response = await fetch(ENDPOINT, {
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
