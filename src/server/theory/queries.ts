import "server-only"

import { db } from "@/server/db"
import { quizQuestionsSchema, toPublicQuestions } from "@/server/theory/quiz"

export async function listTopics() {
  return db.theoryTopic.findMany({
    where: { deletedAt: null, subject: { deletedAt: null } },
    orderBy: [{ subject: { name: "asc" } }, { name: "asc" }],
    select: { id: true, slug: true, name: true, subject: { select: { slug: true, name: true } } },
  })
}

export async function getTopic(subjectSlug: string, topicSlug: string) {
  return db.theoryTopic.findFirst({
    where: { slug: topicSlug, deletedAt: null, subject: { slug: subjectSlug, deletedAt: null } },
    select: { id: true, name: true, slug: true },
  })
}

/** The topic's newest quiz (answers stripped) plus the student's past attempts on it. */
export async function getQuizForStudent(userId: string, theoryTopicId: string) {
  const quiz = await db.quiz.findFirst({
    where: { theoryTopicId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  })
  if (!quiz) return null
  const questions = quizQuestionsSchema.parse(quiz.questionsJson)
  const attempts = await db.quizAttempt.findMany({
    where: { userId, quizId: quiz.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, score: true, createdAt: true },
  })
  return { id: quiz.id, title: quiz.title, questions: toPublicQuestions(questions), attempts }
}

/** Flashcards for a topic, due ones first, each with the student's schedule. */
export async function getFlashcardsForStudent(userId: string, theoryTopicId: string) {
  const cards = await db.flashcard.findMany({
    where: { theoryTopicId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { revisionSchedules: { where: { userId }, take: 1 } },
  })
  const now = Date.now()
  return cards
    .map(({ revisionSchedules, ...card }) => {
      const schedule = revisionSchedules[0] ?? null
      return {
        id: card.id,
        question: card.question,
        answer: card.answer,
        intervalStage: schedule?.intervalStage ?? null,
        dueAt: schedule?.dueAt ?? null,
        isDue: !schedule || schedule.dueAt.getTime() <= now,
      }
    })
    .sort((a, b) => Number(b.isDue) - Number(a.isDue))
}
