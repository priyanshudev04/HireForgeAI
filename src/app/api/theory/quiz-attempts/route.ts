import { randomUUID } from "node:crypto"

import { getTheoryTopic } from "@/lib/theory/catalog"
import { gradeQuiz } from "@/lib/theory/grading"
import { quizAttemptRequestSchema } from "@/lib/theory/types"
import { fail, ok } from "@/server/http/respond"

/**
 * POST /api/theory/quiz-attempts — grade a quiz attempt synchronously.
 *
 * There is no database or auth yet, so the client sends back the quiz it was
 * given and the attempt isn't persisted server-side. Once Prisma lands this
 * should load the stored Quiz by id and write a QuizAttempt row instead.
 */
export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return fail(400, "VALIDATION_ERROR", "Request body must be JSON.")
  }

  const parsed = quizAttemptRequestSchema.safeParse(json)
  if (!parsed.success) return fail(400, "VALIDATION_ERROR", "Invalid quiz attempt.")
  if (!getTheoryTopic(parsed.data.topicSlug)) return fail(404, "NOT_FOUND", "Topic not found.")
  if (parsed.data.answers.length !== parsed.data.questions.length) {
    return fail(400, "VALIDATION_ERROR", "Provide one answer (or null) per question.")
  }

  const grade = gradeQuiz(parsed.data)
  return ok({ attemptId: randomUUID(), topicSlug: parsed.data.topicSlug, ...grade })
}
