import { getTheoryTopic } from "@/lib/theory/catalog"
import { generateFlashcards } from "@/server/ai/agents/theory-mentor"
import { readGenerateRequest } from "@/server/http/generate-request"
import { aiErrorResponse, fail, ok } from "@/server/http/respond"

export const maxDuration = 60

/** POST /api/theory/topics/:topicSlug/flashcards — generate an AI flashcard deck for a topic. */
export async function POST(request: Request, { params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = await params
  const topic = getTheoryTopic(topicSlug)
  if (!topic) return fail(404, "NOT_FOUND", "Topic not found.")

  const body = await readGenerateRequest(request)
  if (!body.success) return fail(400, "VALIDATION_ERROR", "Invalid request body.")

  try {
    const flashcards = await generateFlashcards(topic, { count: body.data.count ?? 8, focusConcepts: body.data.focusConcepts })
    return ok({ topicSlug, flashcards })
  } catch (error) {
    return aiErrorResponse(error)
  }
}
