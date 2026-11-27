/** Days until the next review for each interval stage (stage 1 = tomorrow). */
export const INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const
export const MAX_STAGE = INTERVAL_DAYS.length

export type RecallQuality = "again" | "hard" | "good" | "easy"

/** Simple Leitner-style scheduler on top of FlashcardRevisionSchedule.intervalStage. */
export function nextStage(current: number | null, quality: RecallQuality) {
  const stage = current ?? 0
  switch (quality) {
    case "again":
      return 1
    case "hard":
      return Math.max(1, stage)
    case "good":
      return Math.min(MAX_STAGE, stage + 1)
    case "easy":
      return Math.min(MAX_STAGE, stage + 2)
  }
}

export function dueDateFor(stage: number, from = new Date()) {
  const days = INTERVAL_DAYS[Math.min(stage, MAX_STAGE) - 1]
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}
