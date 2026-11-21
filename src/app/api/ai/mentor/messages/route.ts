import { mentorMessageRequestSchema, type MentorStreamEvent } from "@/lib/contracts/mentor"
import { streamMentorReply } from "@/server/ai/orchestrator"
import { AiError } from "@/server/ai/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function jsonError(status: number, code: string, message: string, details?: unknown) {
  return Response.json({ ok: false, error: { code, message, details } }, { status })
}

function sse(event: MentorStreamEvent | "[DONE]") {
  return `data: ${event === "[DONE]" ? event : JSON.stringify(event)}\n\n`
}

/**
 * POST /api/ai/mentor/messages
 * Streams the mentor's reply as SSE: `data: {"delta": "..."}` chunks, then `data: [DONE]`.
 * Errors before the first chunk come back as plain JSON.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Request body must be JSON.")
  }

  const parsed = mentorMessageRequestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Invalid request body.", parsed.error.issues)
  }

  const { message, history } = parsed.data
  const iterator = streamMentorReply({ message, history, signal: request.signal })[Symbol.asyncIterator]()

  // Wait for the first chunk so setup failures (missing key, rate limit) return a real status code.
  let first: IteratorResult<string>
  try {
    first = await iterator.next()
  } catch (error) {
    if (error instanceof AiError) return jsonError(error.status, error.code, error.message)
    console.error("[mentor] stream failed to start", error)
    return jsonError(502, "AI_PROVIDER_ERROR", "The mentor could not start a reply.")
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: MentorStreamEvent | "[DONE]") => controller.enqueue(encoder.encode(sse(event)))
      try {
        if (!first.done) send({ delta: first.value })
        if (!first.done) {
          for (let next = await iterator.next(); !next.done; next = await iterator.next()) {
            send({ delta: next.value })
          }
        }
      } catch (error) {
        if (request.signal.aborted) return controller.close()
        console.error("[mentor] stream failed mid-reply", error)
        const { code, message } =
          error instanceof AiError ? error : { code: "AI_PROVIDER_ERROR", message: "The reply was interrupted." }
        send({ error: { code, message } })
      }
      send("[DONE]")
      controller.close()
    },
    async cancel() {
      await iterator.return?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  })
}
