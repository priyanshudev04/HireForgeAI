/**
 * Foundational UI types
 *
 * Domain-independent utility types used across the entire codebase.
 * These are framework/infrastructure types — NOT business domain models.
 *
 * Business domain models (Problem, User, Roadmap, Resume, etc.) will be
 * defined in Phase 4–14 as each module is implemented, strictly following
 * the frozen API Contract (PRD Part 5 / Part 15).
 *
 * PRD Part 19: "Every component's prop shape is an explicit, exported
 * interface/type" and "no any, no implicit loose typing."
 */

/* ── Loading / async state ────────────────────────────────── */

/** Generic async resource state — used by hooks wrapping TanStack Query */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

/* ── Pagination ───────────────────────────────────────────── */

/**
 * Cursor-based pagination cursor — matches API Contract (PRD Part 5
 * Problem List spec: "cursor-based 'Load more', never numbered pages").
 */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasNextPage: boolean
}

/* ── API response envelope ───────────────────────────────── */

/** Standard API success response shape */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Standard API error response shape */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/* ── Shared UI prop types ────────────────────────────────── */

/** Components that accept a Lucide-react icon reference (PRD Part 24) */
export type IconComponent = React.ComponentType<{
  className?: string
  size?: number | string
  strokeWidth?: number
}>

/** Size scale shared across all sized components (PRD Part 24) */
export type ComponentSize = "xs" | "sm" | "md" | "lg"

/** Difficulty levels — used platform-wide for Problems, Badges, Filters */
export type Difficulty = "easy" | "medium" | "hard"

/**
 * Notification types matching the backend's NotificationType enum.
 * Used by the Notifications page filter (PRD Part 5).
 * Exact values reconciled against the Prisma schema at Phase 14.
 */
export type NotificationType =
  | "revision_due"
  | "interview_reminder"
  | "hirescore_update"
  | "streak_milestone"
  | "roadmap_generated"
  | "system"

/** Theme values — dark-first, light deferred (PRD Part 7 / Part 25) */
export type Theme = "dark" | "light" | "system"
