import type { LlmProvider } from "../types"
import { geminiProvider } from "./gemini"

// Switching providers is a one-line change here (Architecture §7.1).
export const llm: LlmProvider = geminiProvider
