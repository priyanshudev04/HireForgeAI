import "server-only"

import type { z } from "zod"

import { AiNotConfiguredError } from "./errors"
import type { StreamTextRequest } from "./types"
import { geminiProvider } from "./providers/gemini"

export { AiGenerationError, AiNotConfiguredError } from "./errors"

/**
 * Provider-agnostic LLM interface (docs/HireForge_Phase2_Architecture_1.md §7).
 * Nothing outside src/server/ai/ talks to a provider SDK directly.
 */
export interface StructuredRequest<Schema extends z.ZodType> {
  system: string
  prompt: string
  schema: Schema
  /** Example of the JSON shape to return, for providers without native structured outputs. */
  jsonShape: string
  maxTokens?: number
}

export interface LlmProvider {
  isConfigured(): boolean
  generateStructured<Schema extends z.ZodType>(request: StructuredRequest<Schema>): Promise<z.infer<Schema>>
  /** Streams a chat reply as text chunks. Throws AiError (from ./types) with a stable code. */
  streamText(request: StreamTextRequest): AsyncIterable<string>
}

const provider: LlmProvider = geminiProvider

export const llm = {
  async generateStructured<Schema extends z.ZodType>(request: StructuredRequest<Schema>): Promise<z.infer<Schema>> {
    if (!provider.isConfigured()) throw new AiNotConfiguredError()
    return provider.generateStructured(request)
  },
  streamText(request: StreamTextRequest): AsyncIterable<string> {
    return provider.streamText(request)
  },
}
