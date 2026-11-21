import { QUIZ_PASS_PERCENT, type QuizAttemptRequest, type QuizGrade } from "./types"

/**
 * Grades a quiz attempt. Pure and deterministic so it can run on the server
 * (authoritative) and be unit-tested without the AI layer.
 */
export function gradeQuiz({ questions, answers }: Pick<QuizAttemptRequest, "questions" | "answers">): QuizGrade {
  const results = questions.map((question, index) => {
    const selected = answers[index]
    const selectedIndex = typeof selected === "number" && selected >= 0 && selected < question.options.length ? selected : null
    return {
      questionId: question.id,
      selectedIndex,
      correctIndex: question.correctIndex,
      correct: selectedIndex === question.correctIndex,
      concept: question.concept,
      explanation: question.explanation,
    }
  })

  const correctCount = results.filter((result) => result.correct).length
  const total = results.length
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100)

  const weakConcepts: string[] = []
  for (const result of results) {
    const concept = result.concept.trim()
    if (!result.correct && concept && !weakConcepts.some((c) => c.toLowerCase() === concept.toLowerCase())) {
      weakConcepts.push(concept)
    }
  }

  return { score, correctCount, total, passed: score >= QUIZ_PASS_PERCENT, results, weakConcepts }
}
