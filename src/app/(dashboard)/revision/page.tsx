import { PageHeader } from "@/components/shared/page-header"
import { RevisionQueue } from "@/components/theory/revision-queue"

export default function RevisionPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Revision Queue"
        description="Weak topics from your quizzes and flashcards due today, scheduled with spaced repetition."
      />
      <RevisionQueue />
    </div>
  )
}
