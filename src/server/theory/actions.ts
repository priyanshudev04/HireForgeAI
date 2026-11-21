"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/server/auth"
import { db } from "@/server/db"
import { gradeQuiz, quizQuestionsSchema } from "@/server/theory/quiz"
import { dueDateFor, nextStage } from "@/server/theory/spaced-repetition"

const submitSchema = z.object({
  quizId: z.uuid(),
  answers: z.array(z.number().int().nonnegative().nullable()).max(200),
})

/** Grades a quiz on the server and saves the attempt (API contract: graded synchronously). */
export async function submitQuizAttempt(input: z.input<typeof submitSchema>) {
  const user = await requireUser()
  const { quizId, answers } = submitSchema.parse(input)

  const quiz = await db.quiz.findFirst({ where: { id: quizId, deletedAt: null } })
  if (!quiz) throw new Error("Quiz not found")
  const questions = quizQuestionsSchema.parse(quiz.questionsJson)
  const graded = gradeQuiz(questions, answers)

  const attempt = await db.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score: graded.score,
      answersJson: graded.results.map(({ questionId, selectedIndex, correct }) => ({
        questionId,
        selectedIndex,
        correct,
      })),
    },
    select: { id: true, createdAt: true },
  })

  revalidatePath("/theory", "layout")
  return { attemptId: attempt.id, ...graded }
}

const reviewSchema = z.object({
  flashcardId: z.uuid(),
  quality: z.enum(["again", "hard", "good", "easy"]),
})

/** Records a flashcard review and schedules the next one for this student. */
export async function reviewFlashcard(input: z.input<typeof reviewSchema>) {
  const user = await requireUser()
  const { flashcardId, quality } = reviewSchema.parse(input)

  const card = await db.flashcard.findFirst({ where: { id: flashcardId, deletedAt: null }, select: { id: true } })
  if (!card) throw new Error("Flashcard not found")

  const existing = await db.flashcardRevisionSchedule.findUnique({
    where: { userId_flashcardId: { userId: user.id, flashcardId } },
    select: { intervalStage: true },
  })
  const now = new Date()
  const intervalStage = nextStage(existing?.intervalStage ?? null, quality)
  const dueAt = dueDateFor(intervalStage, now)

  await db.flashcardRevisionSchedule.upsert({
    where: { userId_flashcardId: { userId: user.id, flashcardId } },
    update: { intervalStage, dueAt, lastReviewedAt: now },
    create: { userId: user.id, flashcardId, intervalStage, dueAt, lastReviewedAt: now },
  })

  return { intervalStage, dueAt: dueAt.toISOString() }
}
