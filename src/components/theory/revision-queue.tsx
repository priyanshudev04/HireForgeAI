"use client"

import Link from "next/link"
import { useState, useSyncExternalStore } from "react"
import { BookOpen, CheckCircle2, Clock, Target, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { FlashcardFace } from "@/components/theory/flashcard-deck"
import { formatDue, type RecallRating } from "@/lib/revision/schedule"
import {
  rateFlashcard,
  removeRevisionItem,
  useRevisionState,
  type FlashcardRevisionItem,
  type TopicRevisionItem,
} from "@/lib/revision/store"

// Re-evaluate "due" once a minute so items surface without a reload.
function subscribeClock(callback: () => void) {
  const timer = window.setInterval(callback, 60_000)
  return () => window.clearInterval(timer)
}
// Rounded up so anything due within the current minute counts as due.
const minuteNow = () => Math.ceil(Date.now() / 60_000) * 60_000

export function RevisionQueue() {
  const state = useRevisionState()
  const now = useSyncExternalStore(subscribeClock, minuteNow, () => 0)

  const items = Object.values(state.items).sort((a, b) => a.dueAt - b.dueAt)
  const topics = items.filter((item): item is TopicRevisionItem => item.kind === "topic")
  const cards = items.filter((item): item is FlashcardRevisionItem => item.kind === "flashcard")
  const dueTopics = now ? topics.filter((item) => item.dueAt <= now) : []
  const dueCards = now ? cards.filter((item) => item.dueAt <= now) : []
  const upcoming = now ? items.filter((item) => item.dueAt > now).slice(0, 10) : []

  if (now && items.length === 0 && state.attempts.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Your revision queue is empty"
        description="Take a theory quiz or review some flashcards. Topics you score low on and cards you struggle with will show up here."
        actionLabel="Browse theory topics"
        actionHref="/theory"
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Weak topics due" value={dueTopics.length} />
        <Stat label="Flashcards due" value={dueCards.length} />
        <Stat label="Scheduled later" value={items.length - dueTopics.length - dueCards.length} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-foreground">Weak topics</h2>
        {dueTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weak topics due. Nice.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {dueTopics.map((item) => (
              <TopicCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-foreground">Flashcards due</h2>
        {dueCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flashcards due right now.</p>
        ) : (
          <FlashcardReview cards={dueCards} />
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">Coming up</h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {upcoming.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.kind === "topic" ? item.topicTitle : item.card.front}</p>
                    <p className="text-xs text-muted-foreground">{item.kind === "topic" ? "Topic review" : `Flashcard · ${item.topicTitle}`}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDue(item.dueAt, now)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {state.attempts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">Recent quiz scores</h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {state.attempts.slice(0, 8).map((attempt) => (
                <div key={attempt.attemptId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <Link href={`/theory/${attempt.subjectSlug}/${attempt.topicSlug}/quiz`} className="min-w-0 truncate font-medium text-foreground hover:underline">
                    {attempt.topicTitle}
                  </Link>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    {new Date(attempt.at).toLocaleDateString()}
                    <Badge variant={attempt.score >= 70 ? "secondary" : "destructive"}>{attempt.score}%</Badge>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card glass>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function TopicCard({ item }: { item: TopicRevisionItem }) {
  const base = `/theory/${item.subjectSlug}/${item.topicSlug}`
  return (
    <Card glass>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{item.topicTitle}</CardTitle>
            <CardDescription>Last quiz score {item.lastScore}%</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.topicTitle} from queue`} onClick={() => removeRevisionItem(item.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {item.weakConcepts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.weakConcepts.map((concept) => (
              <Badge key={concept} variant="outline">
                {concept}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link href={`${base}/quiz?focus=weak`} />}>
            <Target className="size-3.5" />
            Retake focused quiz
          </Button>
          <Button size="sm" variant="outline" render={<Link href={base} />}>
            Reread notes
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`${base}/flashcards`} />}>
            Flashcards
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FlashcardReview({ cards }: { cards: FlashcardRevisionItem[] }) {
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState(0)
  const item = cards[0]

  const rate = (rating: RecallRating) => {
    rateFlashcard(item, item.card, rating)
    setFlippedId(null)
    setReviewed((n) => n + 1)
  }

  return (
    <Card glass>
      <CardContent className="grid place-items-center gap-3 p-4 sm:p-8">
        <FlashcardFace
          card={item.card}
          label={`${item.topicTitle} · ${cards.length} due`}
          flipped={flippedId === item.id}
          onFlip={() => setFlippedId(item.id)}
          onRate={rate}
          stage={item.stage}
        />
        {reviewed > 0 && (
          <p className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="size-3.5" />
            {reviewed} reviewed this session
          </p>
        )}
      </CardContent>
    </Card>
  )
}
