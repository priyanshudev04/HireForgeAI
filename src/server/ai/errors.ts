export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI generation is not configured. Add a free Gemini API key (aistudio.google.com/apikey) as GEMINI_API_KEY in .env.local and restart the server.")
    this.name = "AiNotConfiguredError"
  }
}

export class AiGenerationError extends Error {
  constructor(message: string, readonly retryable = false) {
    super(message)
    this.name = "AiGenerationError"
  }
}
