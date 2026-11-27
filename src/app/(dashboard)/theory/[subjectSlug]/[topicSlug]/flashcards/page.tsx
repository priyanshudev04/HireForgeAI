import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { FlashcardDeck } from "@/components/theory/flashcard-deck"
import { requireUser } from "@/server/auth"
import { getFlashcardsForStudent, getTopic } from "@/server/theory/queries"

export default async function TheoryFlashcardsPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params
  const user = await requireUser()
  const topic = await getTopic(subjectSlug, topicSlug)
  if (!topic) notFound()
  const cards = await getFlashcardsForStudent(user.id, topic.id)
  const dueCount = cards.filter((c) => c.isDue).length

  return (
    <div className="mx-auto w-full max-w-275 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${topic.name} flashcards`}
        description={
          cards.length ? `${dueCount} of ${cards.length} cards due. Rate each card to schedule its next review.` : "Fast recall for the selected theory topic."
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>Back to topic</Button>
            <Button render={<Link href={`/theory/${subjectSlug}/${topicSlug}/quiz`} />}>Open quiz</Button>
          </div>
        }
      />

      {cards.length === 0 ? (
        <EmptyState title="No flashcards yet" description="There are no flashcards for this topic yet." />
      ) : (
        <FlashcardDeck cards={cards} />
      )}
    </div>
  )
}
