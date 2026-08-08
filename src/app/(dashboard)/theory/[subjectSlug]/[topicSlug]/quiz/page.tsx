import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const quizData = {
  question: "Which OS concept is responsible for selecting the next process to execute?",
  options: ["Memory paging", "CPU scheduling", "Disk partitioning", "Socket multiplexing"],
  answer: "CPU scheduling",
}

export default async function TheoryQuizPage({ params }: { params: Promise<{ subjectSlug: string; topicSlug: string }> }) {
  const { subjectSlug, topicSlug } = await params

  return (
    <div className="mx-auto w-full max-w-225 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Theory Quiz"
        description="Check your understanding of the selected topic."
        actions={
          <Button variant="outline" render={<Link href={`/theory/${subjectSlug}/${topicSlug}`} />}>Back to topic</Button>
        }
      />

      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Question 1 of 3</CardTitle>
              <CardDescription>Progress: 33%</CardDescription>
            </div>
            <div className="h-2 w-40 rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">{quizData.question}</h2>
          </section>

          <section className="grid gap-3">
            {quizData.options.map((option) => (
              <button key={option} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5">
                <span className="text-sm font-medium text-foreground">{option}</span>
                <span className="text-xs text-muted-foreground">Option</span>
              </button>
            ))}
          </section>

          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-4">
            <Button variant="outline">Previous</Button>
            <Button>Next Question</Button>
          </div>
        </CardContent>
      </Card>

      <section className="rounded-xl border border-border bg-success/5 p-4">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="size-4" />
          <span className="text-sm font-semibold">Results are generated at the end of the quiz.</span>
        </div>
      </section>
    </div>
  )
}
