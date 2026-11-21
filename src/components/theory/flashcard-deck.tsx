"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState } from "@/components/shared/error-state"
import { formatDue, type RecallRating } from "@/lib/revision/schedule"
import { getRevisionSnapshot, getTopicItem, rateFlashcard, saveDeck, useRevisionState, type TopicRef } from "@/lib/revision/store"
import { ApiRequestError, generateFlashcards } from "@/lib/theory/api"
import type { Flashcard } from "@/lib/theory/types"

export const RATINGS: Array<{ rating: RecallRating; label: string; hint: string }> = [
  { rating: "again", label: "Again", hint: "Forgot it" },
  { rating: "hard", label: "Hard", hint: "Barely" },
  { rating: "good", label: "Good", hint: "Got it" },
  { rating: "easy", label: "Easy", hint: "Instant" },
]

export function FlashcardDeck({ topic }: { topic: TopicRef }) {
  const revision = useRevisionState()
  const deck = revision.decks[topic.topicSlug]
  const [status, setStatus] = useState<{ name: "ready" } | { name: "generating" } | { name: "error"; message: string }>({ name: "ready" })
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const autoStarted = useRef(false)

  async function generate() {
    setStatus({ name: "generating" })
    try {
      const weakConcepts = getTopicItem(getRevisionSnapshot(), topic.topicSlug)?.weakConcepts
      const { flashcards } = await generateFlashcards(topic.topicSlug, { count: 8, focusConcepts: weakConcepts })
      saveDeck(topic.topicSlug, flashcards)
      setIndex(0)
      setFlipped(false)
      setStatus({ name: "ready" })
    } catch (error) {
      setStatus({ name: "error", message: error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again." })
    }
  }

  // Generate a deck the first time someone opens a topic with no saved deck.
  useEffect(() => {
    if (autoStarted.current) return
    const timer = window.setTimeout(() => {
      autoStarted.current = true
      if (!getRevisionSnapshot().decks[topic.topicSlug]) void generate()
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status.name === "generating") {
    return (
      <Card glass className="min-h-105">
        <CardContent className="flex min-h-105 flex-col items-center justify-center gap-3 p-8 text-center">
          <Spinner />
          <p className="text-sm font-medium text-foreground">Generating flashcards for {topic.topicTitle}…</p>
          <p className="text-xs text-muted-foreground">This usually takes 10 to 30 seconds.</p>
        </CardContent>
      </Card>
    )
  }

  if (status.name === "error") {
    return <ErrorState title="Couldn't generate flashcards" description={status.message} onRetry={generate} retryLabel="Try again" />
  }

  if (!deck || deck.flashcards.length === 0) {
    return (
      <Card glass className="min-h-105">
        <CardContent className="flex min-h-105 flex-col items-center justify-center gap-4 p-8 text-center">
          <Sparkles className="size-6 text-primary" />
          <p className="text-sm text-muted-foreground">No flashcards for this topic yet.</p>
          <Button onClick={generate}>Generate flashcards</Button>
        </CardContent>
      </Card>
    )
  }

  const cards = deck.flashcards
  const done = index >= cards.length
  const card: Flashcard | undefined = cards[index]

  const rate = (rating: RecallRating) => {
    if (!card) return
    rateFlashcard(topic, card, rating)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="space-y-4">
      <Card glass className="min-h-105">
        <CardContent className="grid min-h-105 place-items-center p-4 sm:p-8">
          {done ? (
            <div className="w-full max-w-xl space-y-4 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground">Deck complete</h2>
              <p className="text-sm text-muted-foreground">
                Every card is scheduled in your revision queue based on how well you recalled it.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setIndex(0)}>Go through again</Button>
                <Button variant="outline" render={<Link href="/revision" />}>
                  Open revision queue
                </Button>
                <Button variant="outline" render={<Link href={`/theory/${topic.subjectSlug}/${topic.topicSlug}/quiz`} />}>
                  Take the quiz
                </Button>
              </div>
            </div>
          ) : (
            card && (
              <FlashcardFace
                card={card}
                label={`Card ${index + 1} of ${cards.length}`}
                flipped={flipped}
                onFlip={() => setFlipped(true)}
                onRate={rate}
                scheduleNote={scheduleNote(revision.items[`card:${topic.topicSlug}:${card.id}`]?.dueAt)}
                footer={
                  <Button variant="ghost" size="icon-sm" aria-label="Previous card" disabled={index === 0} onClick={() => { setFlipped(false); setIndex((i) => i - 1) }}>
                    <ArrowLeft className="size-4" />
                  </Button>
                }
              />
            )
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Generated {new Date(deck.generatedAt).toLocaleDateString()} · {cards.length} cards</span>
        <Button variant="ghost" size="sm" onClick={generate}>
          <RefreshCw className="size-3.5" />
          New deck
        </Button>
      </div>
    </div>
  )
}

function scheduleNote(dueAt: number | undefined) {
  return dueAt ? `Scheduled: ${formatDue(dueAt).toLowerCase()}` : undefined
}

export function FlashcardFace({
  card,
  label,
  flipped,
  onFlip,
  onRate,
  scheduleNote,
  footer,
}: {
  card: Flashcard
  label: string
  flipped: boolean
  onFlip: () => void
  onRate: (rating: RecallRating) => void
  scheduleNote?: string
  footer?: React.ReactNode
}) {
  return (
    <div className="w-full max-w-xl rounded-3xl border border-border bg-background p-6 text-center shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>

      <div className="space-y-6">
        <p className="text-xs font-medium text-primary">{card.concept}</p>
        <h2 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">{card.front}</h2>

        {flipped ? (
          <>
            <p className="text-sm leading-7 text-muted-foreground">{card.back}</p>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">How well did you recall it?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {RATINGS.map(({ rating, label: ratingLabel, hint }) => (
                  <Button key={rating} variant="outline" onClick={() => onRate(rating)} title={hint}>
                    {ratingLabel}
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Button onClick={onFlip}>Show answer</Button>
        )}

        <div className="flex items-center justify-center gap-3">
          {footer}
          {scheduleNote && <span className="text-xs text-muted-foreground">{scheduleNote}</span>}
        </div>
      </div>
    </div>
  )
}
