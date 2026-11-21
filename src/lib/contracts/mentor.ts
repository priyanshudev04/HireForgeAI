import { z } from "zod"

/** Max characters in one message, per the API contract (Phase 2.5, Part G). */
export const MENTOR_MESSAGE_MAX_CHARS = 4000
/** How many earlier turns the client may send back as context. */
export const MENTOR_HISTORY_MAX_TURNS = 40

export const mentorTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MENTOR_MESSAGE_MAX_CHARS * 4),
})

export type MentorTurn = z.infer<typeof mentorTurnSchema>

/**
 * Body of `POST /api/ai/mentor/messages`.
 *
 * `history` is a stopgap until conversations are persisted server-side:
 * the client sends earlier turns so the mentor has context.
 */
export const mentorMessageRequestSchema = z.object({
  conversationId: z.string().nullish(),
  message: z.string().trim().min(1).max(MENTOR_MESSAGE_MAX_CHARS),
  history: z.array(mentorTurnSchema).max(MENTOR_HISTORY_MAX_TURNS).default([]),
})

export type MentorMessageRequest = z.input<typeof mentorMessageRequestSchema>

/** One SSE `data:` payload. The stream ends with `data: [DONE]`. */
export type MentorStreamEvent = { delta: string } | { error: { code: string; message: string } }
