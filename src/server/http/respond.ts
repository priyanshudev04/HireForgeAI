import { AiGenerationError, AiNotConfiguredError } from "@/server/ai/errors"

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init)
}

export function fail(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status })
}

/** Maps AI layer errors to the API contract's status codes (503 for provider issues). */
export function aiErrorResponse(error: unknown) {
  if (error instanceof AiNotConfiguredError) return fail(503, "AI_NOT_CONFIGURED", error.message)
  if (error instanceof AiGenerationError) return fail(error.retryable ? 503 : 422, "AI_GENERATION_FAILED", error.message)
  console.error("[theory] unexpected AI error", error)
  return fail(500, "INTERNAL_ERROR", "Something went wrong while generating content.")
}
