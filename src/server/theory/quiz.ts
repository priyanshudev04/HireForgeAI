import { z } from "zod"

/**
 * Shape of `Quiz.questionsJson`. The column is JSON because quizzes can be
 * AI- or admin-authored with a variable number of questions (schema note),
 * so it is validated here on every read rather than trusted.
 */
export const quizQuestionsSchema = z.array(
  z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(2),
    answerIndex: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
)
export type QuizQuestion = z.infer<typeof quizQuestionsSchema>[number]

/** Questions as sent to the browser: no answers until the attempt is graded. */
export type PublicQuizQuestion = Omit<QuizQuestion, "answerIndex" | "explanation">

export function toPublicQuestions(questions: QuizQuestion[]): PublicQuizQuestion[] {
  return questions.map(({ id, question, options }) => ({ id, question, options }))
}

export function gradeQuiz(questions: QuizQuestion[], answers: (number | null)[]) {
  const results = questions.map((q, i) => ({
    questionId: q.id,
    selectedIndex: answers[i] ?? null,
    correctIndex: q.answerIndex,
    correct: answers[i] === q.answerIndex,
    explanation: q.explanation ?? null,
  }))
  const correct = results.filter((r) => r.correct).length
  const score = questions.length ? Math.round((correct / questions.length) * 1000) / 10 : 0
  return { score, correct, total: questions.length, results }
}
