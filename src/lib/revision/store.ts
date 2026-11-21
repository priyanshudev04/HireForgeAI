"use client"

import { useSyncExternalStore } from "react"

import type { Flashcard, QuizGrade } from "@/lib/theory/types"

import { clampStage, dueAtForStage, nextStageForRating, type RecallRating } from "./schedule"

/**
 * Client-side revision state, kept in localStorage until auth and the
 * database exist (FlashcardRevisionSchedule / QuizAttempt in docs/schema.prisma).
 */

export interface TopicRef {
  subjectSlug: string
  topicSlug: string
  topicTitle: string
}

export interface TopicRevisionItem extends TopicRef {
  id: string
  kind: "topic"
  weakConcepts: string[]
  lastScore: number
  stage: number
  dueAt: number
  lastReviewedAt: number
}

export interface FlashcardRevisionItem extends TopicRef {
  id: string
  kind: "flashcard"
  card: Flashcard
  stage: number
  dueAt: number
  lastReviewedAt: number
  reviews: number
}

export type RevisionItem = TopicRevisionItem | FlashcardRevisionItem

export interface QuizAttemptRecord extends TopicRef {
  attemptId: string
  score: number
  correctCount: number
  total: number
  weakConcepts: string[]
  at: number
}

export interface StoredDeck {
  flashcards: Flashcard[]
  generatedAt: number
}

export interface RevisionState {
  version: 1
  items: Record<string, RevisionItem>
  attempts: QuizAttemptRecord[]
  decks: Record<string, StoredDeck>
}

const STORAGE_KEY = "hireforge.revision.v1"
const MAX_ATTEMPTS = 50
const EMPTY_STATE: RevisionState = { version: 1, items: {}, attempts: [], decks: {} }

let cached: RevisionState | null = null
const listeners = new Set<() => void>()

function read(): RevisionState {
  if (cached) return cached
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<RevisionState>) : null
    cached =
      parsed && parsed.version === 1
        ? { version: 1, items: parsed.items ?? {}, attempts: parsed.attempts ?? [], decks: parsed.decks ?? {} }
        : EMPTY_STATE
  } catch {
    cached = EMPTY_STATE
  }
  return cached
}

function write(next: RevisionState) {
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or unavailable; keep the in-memory copy for this session.
  }
  listeners.forEach((listener) => listener())
}

function update(fn: (state: RevisionState) => RevisionState) {
  write(fn(read()))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null
      listener()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** Current state, read fresh (not the render-time snapshot). */
export function getRevisionSnapshot(): RevisionState {
  return read()
}

export function useRevisionState(): RevisionState {
  return useSyncExternalStore(subscribe, read, () => EMPTY_STATE)
}

const topicItemId = (topicSlug: string) => `topic:${topicSlug}`
const cardItemId = (topicSlug: string, cardId: string) => `card:${topicSlug}:${cardId}`

export function getTopicItem(state: RevisionState, topicSlug: string) {
  const item = state.items[topicItemId(topicSlug)]
  return item?.kind === "topic" ? item : undefined
}

/**
 * Records a graded quiz and feeds weak topics into the revision queue:
 * a failed quiz puts the topic up for review now; a passed quiz with misses
 * schedules a lighter review; a clean pass pushes an existing review back.
 */
export function recordQuizAttempt(topic: TopicRef, attemptId: string, grade: QuizGrade) {
  const now = Date.now()
  update((state) => {
    const attempts = [
      { ...topic, attemptId, score: grade.score, correctCount: grade.correctCount, total: grade.total, weakConcepts: grade.weakConcepts, at: now },
      ...state.attempts,
    ].slice(0, MAX_ATTEMPTS)

    const id = topicItemId(topic.topicSlug)
    const existing = getTopicItem(state, topic.topicSlug)
    const items = { ...state.items }

    if (!grade.passed) {
      items[id] = { ...topic, id, kind: "topic", weakConcepts: grade.weakConcepts, lastScore: grade.score, stage: 0, dueAt: now, lastReviewedAt: now }
    } else if (existing) {
      const stage = clampStage(existing.stage + (grade.weakConcepts.length === 0 ? 2 : 1))
      items[id] = { ...existing, ...topic, weakConcepts: grade.weakConcepts, lastScore: grade.score, stage, dueAt: dueAtForStage(stage, now), lastReviewedAt: now }
    } else if (grade.weakConcepts.length > 0) {
      items[id] = { ...topic, id, kind: "topic", weakConcepts: grade.weakConcepts, lastScore: grade.score, stage: 1, dueAt: dueAtForStage(1, now), lastReviewedAt: now }
    }

    return { ...state, attempts, items }
  })
}

export function removeRevisionItem(id: string) {
  update((state) => {
    const items = { ...state.items }
    delete items[id]
    return { ...state, items }
  })
}

/** Schedules a flashcard after the learner rates their recall. */
export function rateFlashcard(topic: TopicRef, card: Flashcard, rating: RecallRating) {
  const now = Date.now()
  update((state) => {
    const id = cardItemId(topic.topicSlug, card.id)
    const existing = state.items[id]
    const previous = existing?.kind === "flashcard" ? existing : undefined
    const stage = nextStageForRating(previous?.stage ?? 0, rating, !previous)
    const item: FlashcardRevisionItem = {
      ...topic,
      id,
      kind: "flashcard",
      card,
      stage,
      dueAt: dueAtForStage(stage, now),
      lastReviewedAt: now,
      reviews: (previous?.reviews ?? 0) + 1,
    }
    return { ...state, items: { ...state.items, [id]: item } }
  })
}

export function saveDeck(topicSlug: string, flashcards: Flashcard[]) {
  update((state) => {
    // A new deck replaces the old cards' schedules for this topic.
    const items = Object.fromEntries(
      Object.entries(state.items).filter(([, item]) => !(item.kind === "flashcard" && item.topicSlug === topicSlug)),
    )
    return { ...state, items, decks: { ...state.decks, [topicSlug]: { flashcards, generatedAt: Date.now() } } }
  })
}
