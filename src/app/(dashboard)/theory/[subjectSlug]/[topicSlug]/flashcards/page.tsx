import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { FlashcardDeck } from "@/components/theory/flashcard-deck"
import { getTheoryTopic } from "@/lib/theory/catalog"

export default async function TheoryFlashcardsPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params
  const topic = getTheoryTopic(topicSlug)
  if (!topic) notFound()

  return (
    <div className="mx-auto w-full max-w-275 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${topic.title} Flashcards`}
        description={`${topic.subject} • AI-generated cards, scheduled with spaced repetition.`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>
              Back to topic
            </Button>
            <Button render={<Link href={`/theory/${subjectSlug}/${topicSlug}/quiz`} />}>Open quiz</Button>
          </div>
        }
      />

      <FlashcardDeck topic={{ subjectSlug, topicSlug, topicTitle: topic.title }} />
    </div>
  )
}
