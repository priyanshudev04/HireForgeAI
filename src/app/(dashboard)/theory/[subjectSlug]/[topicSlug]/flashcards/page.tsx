import Link from "next/link"
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const flashcards = [
  { front: "What is a process in an operating system?", back: "A process is an instance of a running program with its own lifecycle, memory, and execution context." },
  { front: "What is the difference between a thread and a process?", back: "A thread is a lightweight execution unit that shares process memory; a process owns its own memory space." },
  { front: "What is context switching?", back: "The OS stores and restores CPU state to move execution between processes or threads." },
]

export default async function TheoryFlashcardsPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params

  return (
    <div className="mx-auto w-full max-w-275 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Flashcards"
        description="Fast recall for the selected theory topic."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>Back to topic</Button>
            <Button render={<Link href={`/theory/${subjectSlug}/${topicSlug}/quiz`} />}>Open quiz</Button>
          </div>
        }
      />

      <section className="grid gap-6">
        <Card glass className="min-h-105">
          <CardContent className="grid min-h-105 place-items-center p-8">
            <div className="w-full max-w-xl rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
              <div className="mb-6 flex items-center justify-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Card 1 of {flashcards.length}</span>
              </div>

              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold leading-tight text-foreground">{flashcards[0].front}</h2>
                <p className="text-sm leading-7 text-muted-foreground">{flashcards[0].back}</p>

                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline">Again</Button>
                  <Button variant="outline">Hard</Button>
                  <Button variant="outline">Good</Button>
                  <Button variant="outline">Easy</Button>
                </div>

                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="icon-sm" aria-label="Previous card">
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Refresh">
                    <RotateCcw className="size-4" />
                  </Button>
                  <Button variant="outline">Flip card</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
