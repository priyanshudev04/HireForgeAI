import "server-only"

import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import type { z } from "zod"

import { AiGenerationError } from "../errors"
import type { LlmProvider, StructuredRequest } from "../llm"

const DEFAULT_MODEL = "claude-opus-5-5"

let client: Anthropic | null = null
function getClient() {
  client ??= new Anthropic()
  return client
}

export const anthropicProvider: LlmProvider = {
  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
  },

  async generateStructured<Schema extends z.ZodType>({ system, prompt, schema, maxTokens = 16000 }: StructuredRequest<Schema>) {
    try {
      const response = await getClient().beta.messages.parse({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens,
        // Retry on a fallback model if the primary declines for policy reasons.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
        messages: [{ role: "user", content: prompt }],
        output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
      })

      if (response.stop_reason === "refusal") {
        throw new AiGenerationError("The AI declined to generate this content.")
      }
      if (response.stop_reason === "max_tokens") {
        throw new AiGenerationError("The AI response was cut off. Try again with fewer items.", true)
      }
      if (response.parsed_output == null) {
        throw new AiGenerationError("The AI returned content in an unexpected format.", true)
      }
      return response.parsed_output as z.infer<Schema>
    } catch (error) {
      if (error instanceof AiGenerationError) throw error
      if (error instanceof Anthropic.AuthenticationError) {
        throw new AiGenerationError("The AI provider rejected the API key. Check ANTHROPIC_API_KEY.")
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new AiGenerationError("The AI is busy right now. Wait a moment and try again.", true)
      }
      if (error instanceof Anthropic.APIError) {
        throw new AiGenerationError(`The AI provider returned an error (${error.status ?? "network"}).`, true)
      }
      throw error
    }
  },
}
