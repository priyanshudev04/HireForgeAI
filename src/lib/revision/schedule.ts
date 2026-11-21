/**
 * Spaced-repetition scheduling. Stage 0 is "relearn soon"; each later stage
 * roughly doubles the gap, mirroring FlashcardRevisionSchedule.intervalStage.
 */
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

export const STAGE_INTERVALS_MS = [10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY, 60 * DAY]
export const MAX_STAGE = STAGE_INTERVALS_MS.length - 1

export type RecallRating = "again" | "hard" | "good" | "easy"

export function clampStage(stage: number) {
  return Math.max(0, Math.min(MAX_STAGE, Math.round(stage)))
}

export function nextStageForRating(currentStage: number, rating: RecallRating, isNew: boolean) {
  switch (rating) {
    case "again":
      return 0
    case "hard":
      return clampStage(isNew ? 1 : Math.max(1, currentStage))
    case "good":
      return clampStage(isNew ? 2 : currentStage + 1)
    case "easy":
      return clampStage(isNew ? 3 : currentStage + 2)
  }
}

export function dueAtForStage(stage: number, now = Date.now()) {
  return now + STAGE_INTERVALS_MS[clampStage(stage)]
}

export function formatDue(dueAt: number, now = Date.now()) {
  const diff = dueAt - now
  if (diff <= 0) return "Due now"
  const minutes = Math.round(diff / MINUTE)
  if (minutes < 60) return `Due in ${minutes} min`
  const hours = Math.round(diff / (60 * MINUTE))
  if (hours < 24) return `Due in ${hours} h`
  const days = Math.round(diff / DAY)
  return days === 1 ? "Due tomorrow" : `Due in ${days} days`
}

/** Short label for the gap a rating would schedule, e.g. "10m", "3d". */
export function intervalLabel(stage: number) {
  const ms = STAGE_INTERVALS_MS[clampStage(stage)]
  if (ms < 60 * MINUTE) return `${Math.round(ms / MINUTE)}m`
  if (ms < DAY) return `${Math.round(ms / (60 * MINUTE))}h`
  return `${Math.round(ms / DAY)}d`
}
