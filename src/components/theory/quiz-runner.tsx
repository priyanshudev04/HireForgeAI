"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, ListRestart, Sparkles, Target, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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
      <Card glass aria-busy="true">
        <CardHeader>
          <CardTitle>{phase.name === "generating" ? "Writing your questions…" : "Scoring your answers…"}</CardTitle>
          <CardDescription>
            {phase.name === "generating" ? "Free AI models can take 10 to 40 seconds. Hang tight." : "Just a moment."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-7 w-4/5" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
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

  return (
    <QuizQuestions
      questions={phase.questions}
      answers={phase.answers}
      current={phase.current}
      onChange={(answers, current) => setPhase({ ...phase, answers, current })}
      onSubmit={() => submit(phase.questions, phase.answers)}
    />
  )
}

function QuizQuestions({
  questions,
  answers,
  current,
  onChange,
  onSubmit,
}: {
  questions: QuizQuestion[]
  answers: Array<number | null>
  current: number
  onChange: (answers: Array<number | null>, current: number) => void
  onSubmit: () => void
}) {
  const question = questions[current]
  const selected = answers[current]
  const isLast = current === questions.length - 1
  const answeredCount = answers.filter((answer) => answer !== null).length
  const unanswered = questions.length - answeredCount

  const choose = (index: number) => {
    const next = [...answers]
    next[current] = index
    onChange(next, current)
  }
  const goTo = (index: number) => onChange(answers, Math.max(0, Math.min(questions.length - 1, index)))

  // Keyboard: 1-4 or A-D to answer, arrows to move, Enter to continue.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return
      const key = event.key.toLowerCase()
      const numeric = Number(key)
      if (numeric >= 1 && numeric <= question.options.length) return choose(numeric - 1)
      const letter = key.length === 1 ? key.charCodeAt(0) - 97 : -1
      if (letter >= 0 && letter < question.options.length) return choose(letter)
      if (key === "arrowright") return goTo(current + 1)
      if (key === "arrowleft") return goTo(current - 1)
      if (key === "enter" && selected !== null) {
        event.preventDefault()
        if (isLast) onSubmit()
        else goTo(current + 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <Card glass>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>
              Question {current + 1} of {questions.length}
            </CardTitle>
            <CardDescription>
              {answeredCount} of {questions.length} answered
            </CardDescription>
          </div>
          <nav aria-label="Jump to question" className="flex gap-1.5">
            {questions.map((q, index) => (
              <button
                key={q.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Question ${index + 1}${answers[index] !== null ? ", answered" : ""}`}
                aria-current={index === current ? "step" : undefined}
                className={cn(
                  "size-7 rounded-full border text-xs font-semibold transition",
                  index === current
                    ? "border-primary bg-primary text-primary-foreground"
                    : answers[index] !== null
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
        <Progress value={answeredCount} max={questions.length} className="mt-3" />
      </CardHeader>
      <CardContent className="space-y-8">
        <h2 className="font-heading text-xl font-bold leading-snug text-foreground sm:text-2xl">{question.question}</h2>

        <div className="grid gap-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, index) => (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={selected === index}
              onClick={() => choose(index)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected === index ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                  selected === index ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium text-foreground">{option}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 border-t border-border/40 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" disabled={current === 0} onClick={() => goTo(current - 1)}>
              Previous
            </Button>
            {isLast ? (
              <Button disabled={answeredCount === 0} onClick={onSubmit}>
                Submit quiz
              </Button>
            ) : (
              <Button onClick={() => goTo(current + 1)}>{selected === null ? "Skip" : "Next question"}</Button>
            )}
          </div>
          <p className="hidden text-center text-xs text-muted-foreground sm:block">
            {isLast && unanswered > 0
              ? `${unanswered} unanswered ${unanswered === 1 ? "question counts" : "questions count"} as wrong.`
              : "Tip: press 1 to 4 to answer and Enter to continue."}
          </p>
          {isLast && unanswered > 0 && (
            <p className="text-center text-xs text-muted-foreground sm:hidden">
              {unanswered} unanswered {unanswered === 1 ? "question counts" : "questions count"} as wrong.
            </p>
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
          <div className="flex items-center gap-5">
            <ScoreRing score={grade.score} passed={grade.passed} />
            <div>
              <CardTitle className="text-2xl">{grade.passed ? (grade.score === 100 ? "Perfect score" : "Passed") : "Keep practising"}</CardTitle>
              <CardDescription>
                {grade.correctCount} of {grade.total} correct · pass mark {QUIZ_PASS_PERCENT}%
              </CardDescription>
            </div>
          </div>
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

function ScoreRing({ score, passed }: { score: number; passed: boolean }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative grid size-20 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={cn("transition-[stroke-dashoffset] duration-700", passed ? "stroke-success" : "stroke-warning")}
        />
      </svg>
      <span className="font-heading text-xl font-bold text-foreground">{score}%</span>
    </div>
  )
}

function messageFor(error: unknown) {
  return error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again."
}
