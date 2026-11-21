import { requireUser, unauthorized, UnauthorizedError } from "@/server/auth"
import { getConversation, NotFoundError } from "@/server/mentor/conversations"

/** GET /api/ai/mentor/conversations/:id — full message history. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params
    return Response.json({ ok: true, data: { conversation: await getConversation(user.id, id) } })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized()
    if (error instanceof NotFoundError) {
      return Response.json({ ok: false, error: { code: "NOT_FOUND", message: error.message } }, { status: 404 })
    }
    throw error
  }
}
