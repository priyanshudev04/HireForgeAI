import "server-only"

import type { AgentType, MessageRole } from "@prisma/client"

export interface MentorTurn {
  role: MessageRole
  content: string
}

export interface MentorReply {
  content: string
  agentUsed: AgentType
  tokensUsed: number
}

/**
 * Placeholder for the AI Orchestrator (Architecture §7). It is the only
 * function the persistence layer calls, so swapping in a real model later
 * means replacing this body and nothing else.
 */
export async function generateMentorReply(history: MentorTurn[]): Promise<MentorReply> {
  const last = history.at(-1)?.content ?? ""
  return {
    content: `I can help you work through: ${last}`,
    agentUsed: "THEORY_MENTOR",
    tokensUsed: 0,
  }
}
