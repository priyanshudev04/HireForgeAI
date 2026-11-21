import "server-only"

import type { z } from "zod"

import { AiNotConfiguredError } from "./errors"
import { anthropicProvider } from "./providers/anthropic"

export { AiGenerationError, AiNotConfiguredError } from "./errors"

/**
 * Provider-agnostic LLM interface (docs/HireForge_Phase2_Architecture_1.md §7).
 * Nothing outside src/server/ai/ talks to a provider SDK directly.
 */
export interface StructuredRequest<Schema extends z.ZodType> {
  system: string
  prompt: string
  schema: Schema
  maxTokens?: number
}

export interface LlmProvider {
  isConfigured(): boolean
  generateStructured<Schema extends z.ZodType>(request: StructuredRequest<Schema>): Promise<z.infer<Schema>>
}

const provider: LlmProvider = anthropicProvider

export const llm = {
  async generateStructured<Schema extends z.ZodType>(request: StructuredRequest<Schema>): Promise<z.infer<Schema>> {
    if (!provider.isConfigured()) throw new AiNotConfiguredError()
    return provider.generateStructured(request)
  },
}
