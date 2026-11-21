import type { MentorTurn } from "@/lib/contracts/mentor"

import { MENTOR_SYSTEM_PROMPT } from "./agents/mentor"
import { llm } from "./providers"

export interface MentorReplyInput {
  message: string
  history: MentorTurn[]
  signal?: AbortSignal
}

/**
 * Entry point for the AI mentor chat. Today it routes every message to the
 * mentor agent; the router, memory and response builder (Architecture §7–8)
 * plug in here later.
 */
export function streamMentorReply({ message, history, signal }: MentorReplyInput): AsyncIterable<string> {
  return llm.streamText({
    system: MENTOR_SYSTEM_PROMPT,
    // User text only ever goes in user-role content, never the system prompt (§18).
    messages: [...history, { role: "user", content: message }],
    signal,
  })
}
