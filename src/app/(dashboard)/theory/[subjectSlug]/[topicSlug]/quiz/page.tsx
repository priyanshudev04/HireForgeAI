import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { QuizRunner } from "@/components/theory/quiz-runner"
import { getTheoryTopic } from "@/lib/theory/catalog"

export default async function TheoryQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectSlug: string; topicSlug: string }>
  searchParams: Promise<{ focus?: string }>
}) {
  const { subjectSlug, topicSlug } = await params
  const { focus } = await searchParams
  const topic = getTheoryTopic(topicSlug)
  if (!topic) notFound()

  return (
    <div className="mx-auto w-full max-w-225 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${topic.title} Quiz`}
        description={`${topic.subject} • Check your understanding with AI-generated questions.`}
        actions={
          <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>
            Back to topic
          </Button>
        }
      />

      <QuizRunner topic={{ subjectSlug, topicSlug, topicTitle: topic.title }} initialFocus={focus === "weak"} />
    </div>
  )
}
