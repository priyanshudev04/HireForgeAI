"use client"

import * as React from "react"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { submitQuizAttempt } from "@/server/theory/actions"
import type { PublicQuizQuestion } from "@/server/theory/quiz"

type Result = Awaited<ReturnType<typeof submitQuizAttempt>>

export function QuizRunner({ quizId, questions }: { quizId: string; questions: PublicQuizQuestion[] }) {
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<(number | null)[]>(() => questions.map(() => null))
  const [result, setResult] = React.useState<Result | null>(null)
  const [pending, startTransition] = React.useTransition()

  const question = questions[index]
  const isLast = index === questions.length - 1
  const progress = Math.round(((index + 1) / questions.length) * 100)
  const graded = result?.results[index]

  function choose(optionIndex: number) {
    if (result) return
    setAnswers((prev) => prev.map((a, i) => (i === index ? optionIndex : a)))
  }

  function submit() {
    startTransition(async () => {
      try {
        setResult(await submitQuizAttempt({ quizId, answers }))
        setIndex(0)
      } catch {
        toast.error("Could not save your attempt. Try again.")
      }
    })
  }

  function restart() {
    setAnswers(questions.map(() => null))
    setResult(null)
    setIndex(0)
  }

  return (
    <div className="space-y-6">
      {result ? (
        <section className="rounded-xl border border-border bg-success/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="size-4" />
              <span className="text-sm font-semibold">
                Saved: {result.correct} of {result.total} correct ({result.score}%). Review each answer below.
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={restart}>Try again</Button>
          </div>
        </section>
      ) : null}

      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Question {index + 1} of {questions.length}</CardTitle>
              <CardDescription>Progress: {progress}%</CardDescription>
            </div>
            <div className="h-2 w-40 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <h2 className="font-heading text-2xl font-bold text-foreground">{question.question}</h2>

          <section className="grid gap-3">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex
              const isCorrect = graded?.correctIndex === optionIndex
              const isWrongPick = graded && selected && !graded.correct
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(optionIndex)}
                  disabled={!!result}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-left transition",
                    !result && "hover:border-primary/40 hover:bg-primary/5",
                    selected && !result && "border-primary bg-primary/10",
                    isCorrect && "border-success bg-success/10",
                    isWrongPick && "border-destructive bg-destructive/10"
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{option}</span>
                  {isCorrect ? <CheckCircle2 className="size-4 text-success" /> : null}
                  {isWrongPick ? <XCircle className="size-4 text-destructive" /> : null}
                </button>
              )
            })}
          </section>

          {graded?.explanation ? <p className="text-sm text-muted-foreground">{graded.explanation}</p> : null}

          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-4">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              Previous
            </Button>
            {isLast && !result ? (
              <Button onClick={submit} disabled={pending || answers.some((a) => a === null)}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Submit quiz
              </Button>
            ) : (
              <Button disabled={isLast} onClick={() => setIndex((i) => i + 1)}>Next question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
