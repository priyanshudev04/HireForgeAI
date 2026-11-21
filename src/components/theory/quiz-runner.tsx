"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, ListRestart, Sparkles, Target, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState } from "@/components/shared/error-state"
import { getTopicItem, recordQuizAttempt, useRevisionState, type TopicRef } from "@/lib/revision/store"
import { ApiRequestError, generateQuiz, submitQuizAttempt } from "@/lib/theory/api"
import { QUIZ_PASS_PERCENT, type QuizGrade, type QuizQuestion } from "@/lib/theory/types"
import { cn } from "@/lib/utils"

type Phase =
  | { name: "idle" }
  | { name: "generating" }
  | { name: "answering"; questions: QuizQuestion[]; answers: Array<number | null>; current: number }
  | { name: "grading"; questions: QuizQuestion[]; answers: Array<number | null> }
  | { name: "results"; questions: QuizQuestion[]; grade: QuizGrade }
  | { name: "error"; message: string; retry: () => void }

const QUESTION_COUNT = 5

export function QuizRunner({ topic, initialFocus = false }: { topic: TopicRef; initialFocus?: boolean }) {
  const revision = useRevisionState()
  const weakConcepts = getTopicItem(revision, topic.topicSlug)?.weakConcepts ?? []
  const [focus, setFocus] = useState(initialFocus)
  const [phase, setPhase] = useState<Phase>({ name: "idle" })

  const useFocus = focus && weakConcepts.length > 0

  async function start() {
    setPhase({ name: "generating" })
    try {
      const { questions } = await generateQuiz(topic.topicSlug, {
        count: QUESTION_COUNT,
        focusConcepts: useFocus ? weakConcepts : undefined,
      })
      setPhase({ name: "answering", questions, answers: questions.map(() => null), current: 0 })
    } catch (error) {
      setPhase({ name: "error", message: messageFor(error), retry: start })
    }
  }

  async function submit(questions: QuizQuestion[], answers: Array<number | null>) {
    setPhase({ name: "grading", questions, answers })
    try {
      const { attemptId, ...grade } = await submitQuizAttempt({ topicSlug: topic.topicSlug, questions, answers })
      recordQuizAttempt(topic, attemptId, grade)
      setPhase({ name: "results", questions, grade })
    } catch (error) {
      setPhase({ name: "error", message: messageFor(error), retry: () => submit(questions, answers) })
    }
  }

  if (phase.name === "idle") {
    return (
      <Card glass>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle>{topic.topicTitle}</CardTitle>
          </div>
          <CardDescription>
            {QUESTION_COUNT} fresh AI-generated questions. Score below {QUIZ_PASS_PERCENT}% and the topic goes into your revision queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weakConcepts.length > 0 && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <input type="checkbox" className="mt-1 accent-primary" checked={focus} onChange={(event) => setFocus(event.target.checked)} />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">Focus on my weak spots</span>
                <span className="block text-xs text-muted-foreground">Last time you missed: {weakConcepts.join(", ")}</span>
              </span>
            </label>
          )}
          <Button onClick={start}>
            <Target className="size-4" />
            Start quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase.name === "generating" || phase.name === "grading") {
    return (
      <Card glass>
        <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 p-8 text-center">
          <Spinner />
          <p className="text-sm font-medium text-foreground">{phase.name === "generating" ? "Writing your questions…" : "Scoring your answers…"}</p>
          {phase.name === "generating" && <p className="text-xs text-muted-foreground">This usually takes 10 to 30 seconds.</p>}
        </CardContent>
      </Card>
    )
  }

  if (phase.name === "error") {
    return <ErrorState title="Couldn't load the quiz" description={phase.message} onRetry={phase.retry} retryLabel="Try again" />
  }

  if (phase.name === "results") {
    return <QuizResults topic={topic} questions={phase.questions} grade={phase.grade} onRestart={() => setPhase({ name: "idle" })} />
  }

  const { questions, answers, current } = phase
  const question = questions[current]
  const selected = answers[current]
  const isLast = current === questions.length - 1
  const answeredCount = answers.filter((answer) => answer !== null).length

  const choose = (index: number) => {
    const next = [...answers]
    next[current] = index
    setPhase({ ...phase, answers: next })
  }

  return (
    <Card glass>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>
              Question {current + 1} of {questions.length}
            </CardTitle>
            <CardDescription>{answeredCount} answered</CardDescription>
          </div>
          <Progress value={current + 1} max={questions.length} className="w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{question.question}</h2>

        <div className="grid gap-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={selected === index}
              onClick={() => choose(index)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                selected === index ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                  selected === index ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium text-foreground">{option}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-4">
          <Button variant="outline" disabled={current === 0} onClick={() => setPhase({ ...phase, current: current - 1 })}>
            Previous
          </Button>
          {isLast ? (
            <Button disabled={answeredCount === 0} onClick={() => submit(questions, answers)}>
              Submit quiz
            </Button>
          ) : (
            <Button onClick={() => setPhase({ ...phase, current: current + 1 })}>{selected === null ? "Skip" : "Next question"}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuizResults({ topic, questions, grade, onRestart }: { topic: TopicRef; questions: QuizQuestion[]; grade: QuizGrade; onRestart: () => void }) {
  return (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="text-3xl">{grade.score}%</CardTitle>
          <CardDescription>
            {grade.correctCount} of {grade.total} correct · {grade.passed ? "Passed" : `Below the ${QUIZ_PASS_PERCENT}% pass mark`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "rounded-xl border p-4 text-sm",
              grade.passed ? "border-success/30 bg-success/5 text-foreground" : "border-warning/30 bg-warning/5 text-foreground",
            )}
          >
            {!grade.passed
              ? `${topic.topicTitle} is now in your revision queue, due today${grade.weakConcepts.length ? `, with a focus on ${grade.weakConcepts.join(", ")}` : ""}.`
              : grade.weakConcepts.length > 0
                ? `Nice work. A light review of ${grade.weakConcepts.join(", ")} is scheduled in your revision queue.`
                : "Perfect score. Any pending review for this topic has been pushed further out."}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onRestart}>
              <ListRestart className="size-4" />
              New quiz
            </Button>
            <Button variant="outline" render={<Link href="/revision" />}>
              Open revision queue
            </Button>
            <Button variant="outline" render={<Link href={`/theory/${topic.subjectSlug}/${topic.topicSlug}/flashcards`} />}>
              Review flashcards
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-foreground">Review your answers</h2>
        {questions.map((question, index) => {
          const result = grade.results[index]
          return (
            <Card key={question.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-2">
                  {result.correct ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                  <p className="text-sm font-semibold text-foreground">{question.question}</p>
                </div>
                <ul className="space-y-1 pl-6 text-sm">
                  {question.options.map((option, optionIndex) => (
                    <li
                      key={optionIndex}
                      className={cn(
                        optionIndex === result.correctIndex && "font-semibold text-success",
                        optionIndex === result.selectedIndex && !result.correct && "text-destructive line-through",
                        optionIndex !== result.correctIndex && optionIndex !== result.selectedIndex && "text-muted-foreground",
                      )}
                    >
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </li>
                  ))}
                </ul>
                {result.selectedIndex === null && <p className="pl-6 text-xs text-muted-foreground">Skipped</p>}
                <p className="pl-6 text-xs leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">{result.concept}.</span> {result.explanation}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}

function messageFor(error: unknown) {
  return error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again."
}
