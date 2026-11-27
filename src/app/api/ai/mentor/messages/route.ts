import { z } from "zod"

import { requireUser, unauthorized, UnauthorizedError } from "@/server/auth"
import { NotFoundError, sendMentorMessage } from "@/server/mentor/conversations"

const bodySchema = z.object({
  conversationId: z.uuid().nullish(),
  message: z.string().trim().min(1).max(4000),
})

/** POST /api/ai/mentor/messages — API contract Part H. */
export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
        { status: 400 }
      )
    }
    const result = await sendMentorMessage(user.id, parsed.data.conversationId ?? null, parsed.data.message)
    return Response.json({ ok: true, data: result })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized()
    if (error instanceof NotFoundError) {
      return Response.json({ ok: false, error: { code: "NOT_FOUND", message: error.message } }, { status: 404 })
    }
    throw error
  }
}
