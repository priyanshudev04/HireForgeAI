import Anthropic from "@anthropic-ai/sdk"

import { AiError, type LlmProvider, type StreamTextRequest } from "../types"

// The only file allowed to import the Anthropic SDK (Architecture §7, providers/).

const DEFAULT_MODEL = "claude-opus-5-5"

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiError("AI_NOT_CONFIGURED", "ANTHROPIC_API_KEY is not set on the server.", 503)
  }
  client ??= new Anthropic()
  return client
}

function toAiError(error: unknown): unknown {
  if (error instanceof AiError) return error
  if (error instanceof Anthropic.AuthenticationError) {
    return new AiError("AI_NOT_CONFIGURED", "The Anthropic API key was rejected.", 503)
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError("AI_RATE_LIMITED", "The AI provider is rate limiting requests. Try again shortly.", 429)
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError("AI_PROVIDER_ERROR", `AI provider error (${error.status ?? "network"}).`, 502)
  }
  return error
}

export const anthropicProvider: LlmProvider = {
  name: "anthropic",

  async *streamText({ system, messages, signal }: StreamTextRequest) {
    try {
      const stream = getClient().beta.messages.stream(
        {
          model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
          max_tokens: 64000,
          system,
          messages,
          output_config: { effort: "medium" },
          // On a safety decline, the API retries on a fallback model in the same call.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        },
        { signal },
      )

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text
        }
      }

      const final = await stream.finalMessage()
      if (final.stop_reason === "refusal") {
        throw new AiError("AI_REFUSED", "The mentor can't help with that request.", 422)
      }
    } catch (error) {
      throw toAiError(error)
    }
  },
}
