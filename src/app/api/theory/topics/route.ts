import { requireUser, unauthorized, UnauthorizedError } from "@/server/auth"
import { listTopics } from "@/server/theory/queries"

export async function GET() {
  try {
    await requireUser()
    return Response.json({ ok: true, data: { topics: await listTopics() } })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorized()
    throw error
  }
}
