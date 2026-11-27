import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { QuizRunner } from "@/components/theory/quiz-runner"
import { requireUser } from "@/server/auth"
import { getQuizForStudent, getTopic } from "@/server/theory/queries"

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

export default async function TheoryQuizPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params
  const user = await requireUser()
  const topic = await getTopic(subjectSlug, topicSlug)
  if (!topic) notFound()
  const quiz = await getQuizForStudent(user.id, topic.id)

  return (
    <div className="mx-auto w-full max-w-225 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={quiz?.title ?? `${topic.name} quiz`}
        description="Check your understanding of the selected topic. Every attempt is saved to your progress."
        actions={
          <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>Back to topic</Button>
        }
      />

      {!quiz || quiz.questions.length === 0 ? (
        <EmptyState title="No quiz yet" description="There is no quiz for this topic yet." />
      ) : (
        <>
          <QuizRunner quizId={quiz.id} questions={quiz.questions} />
          {quiz.attempts.length > 0 ? (
            <section className="rounded-xl border border-border p-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Your recent attempts</h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {quiz.attempts.map((attempt) => (
                  <li key={attempt.id} className="flex justify-between">
                    <span>{dateFormat.format(attempt.createdAt)}</span>
                    <span className="font-medium text-foreground">{attempt.score}%</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
