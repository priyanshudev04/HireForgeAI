export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface StreamTextRequest {
  system: string
  messages: ChatMessage[]
  signal?: AbortSignal
}

/**
 * Provider-agnostic interface (Architecture §7.1). Agents and the orchestrator
 * depend on this, never on a provider SDK.
 */
export interface LlmProvider {
  readonly name: string
  streamText(request: StreamTextRequest): AsyncIterable<string>
}

/** Error the API layer can map to a JSON response with a stable code. */
export class AiError extends Error {
  constructor(
    public readonly code: "AI_NOT_CONFIGURED" | "AI_RATE_LIMITED" | "AI_QUOTA_EXCEEDED" | "AI_PROVIDER_ERROR",
    message: string,
    public readonly status = 502,
  ) {
    super(message)
    this.name = "AiError"
  }
}
