import { requireUser, unauthorized, UnauthorizedError } from "@/server/auth"
import { listConversations } from "@/server/mentor/conversations"

/** GET /api/ai/mentor/conversations?cursor=… — cursor-paginated list. */
export async function GET(request: Request) {
  try {
    const user = await requireUser()
    const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined
    return Response.json({ ok: true, data: await listConversations(user.id, cursor) })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized()
    throw error
  }
}
