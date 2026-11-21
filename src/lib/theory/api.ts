import type { ApiResult, Flashcard, QuizAttemptRequest, QuizGrade, QuizQuestion } from "./types"

export class ApiRequestError extends Error {
  constructor(message: string, readonly code: string) {
    super(message)
    this.name = "ApiRequestError"
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  } catch {
    throw new ApiRequestError("Couldn't reach the server. Check your connection and try again.", "NETWORK_ERROR")
  }
  const json = (await response.json().catch(() => null)) as ApiResult<T> | null
  if (!json) throw new ApiRequestError(`The server returned an unexpected response (${response.status}).`, "BAD_RESPONSE")
  if (!json.ok) throw new ApiRequestError(json.error.message, json.error.code)
  return json.data
}

export function generateQuiz(topicSlug: string, options: { count?: number; focusConcepts?: string[] } = {}) {
  return post<{ topicSlug: string; title: string; questions: QuizQuestion[] }>(
    `/api/theory/topics/${encodeURIComponent(topicSlug)}/quiz`,
    options,
  )
}

export function generateFlashcards(topicSlug: string, options: { count?: number; focusConcepts?: string[] } = {}) {
  return post<{ topicSlug: string; flashcards: Flashcard[] }>(
    `/api/theory/topics/${encodeURIComponent(topicSlug)}/flashcards`,
    options,
  )
}

export function submitQuizAttempt(body: QuizAttemptRequest) {
  return post<QuizGrade & { attemptId: string; topicSlug: string }>("/api/theory/quiz-attempts", body)
}
