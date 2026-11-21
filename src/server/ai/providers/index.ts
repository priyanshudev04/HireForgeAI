import type { LlmProvider } from "../types"
import { anthropicProvider } from "./anthropic"

// Switching providers is a one-line change here (Architecture §7.1).
export const llm: LlmProvider = anthropicProvider
