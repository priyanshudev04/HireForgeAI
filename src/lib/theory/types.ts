import { z } from "zod"

export const QUIZ_OPTION_COUNT = 4
export const QUIZ_PASS_PERCENT = 70

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
  explanation: z.string(),
  concept: z.string(),
})
export type QuizQuestion = z.infer<typeof quizQuestionSchema>

export const flashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  concept: z.string(),
})
export type Flashcard = z.infer<typeof flashcardSchema>

export const quizAttemptRequestSchema = z.object({
  topicSlug: z.string().min(1),
  questions: z.array(quizQuestionSchema).min(1).max(20),
  /** Selected option index per question, or null when skipped. Same order as `questions`. */
  answers: z.array(z.number().int().nullable()),
})
export type QuizAttemptRequest = z.infer<typeof quizAttemptRequestSchema>

export interface QuestionResult {
  questionId: string
  selectedIndex: number | null
  correctIndex: number
  correct: boolean
  concept: string
  explanation: string
}

export interface QuizGrade {
  score: number
  correctCount: number
  total: number
  passed: boolean
  results: QuestionResult[]
  /** Concepts the learner missed, deduplicated, in question order. */
  weakConcepts: string[]
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
