"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { reviewFlashcard } from "@/server/theory/actions"
import type { RecallQuality } from "@/server/theory/spaced-repetition"

export interface DeckCard {
  id: string
  question: string
  answer: string
  isDue: boolean
  dueAt: Date | null
}

const QUALITIES: { value: RecallQuality; label: string }[] = [
  { value: "again", label: "Again" },
  { value: "hard", label: "Hard" },
  { value: "good", label: "Good" },
  { value: "easy", label: "Easy" },
]

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })

export function FlashcardDeck({ cards }: { cards: DeckCard[] }) {
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [nextDue, setNextDue] = React.useState<Record<string, string>>({})
  const [pending, startTransition] = React.useTransition()

  const card = cards[index]
  const scheduled = nextDue[card.id] ?? (card.isDue || !card.dueAt ? null : card.dueAt.toISOString())

  function go(delta: number) {
    setIndex((i) => (i + delta + cards.length) % cards.length)
    setFlipped(false)
  }

  function rate(quality: RecallQuality) {
    startTransition(async () => {
      try {
        const { dueAt } = await reviewFlashcard({ flashcardId: card.id, quality })
        setNextDue((prev) => ({ ...prev, [card.id]: dueAt }))
        if (index < cards.length - 1) go(1)
        else toast.success("Deck reviewed. Your next reviews are scheduled.")
      } catch {
        toast.error("Could not save this review. Try again.")
      }
    })
  }

  return (
    <Card glass className="min-h-105">
      <CardContent className="grid min-h-105 place-items-center p-8">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Card {index + 1} of {cards.length}
              {scheduled ? ` · next review ${dateFormat.format(new Date(scheduled))}` : card.isDue ? " · due now" : ""}
            </span>
          </div>

          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold leading-tight text-foreground">{card.question}</h2>
            {flipped ? (
              <>
                <p className="text-sm leading-7 text-muted-foreground">{card.answer}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUALITIES.map((q) => (
                    <Button key={q.value} variant="outline" disabled={pending} onClick={() => rate(q.value)}>
                      {q.label}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <Button onClick={() => setFlipped(true)}>Show answer</Button>
            )}

            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="icon-sm" aria-label="Previous card" onClick={() => go(-1)}>
                <ArrowLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Next card" onClick={() => go(1)}>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
