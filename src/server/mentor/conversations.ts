import "server-only"

import { db } from "@/server/db"
import { generateMentorReply } from "@/server/ai/mentor"

export class NotFoundError extends Error {}

/** How many earlier messages are handed to the model as context. */
const HISTORY_WINDOW = 20

export async function listConversations(userId: string, cursor?: string, limit = 20) {
  const rows = await db.conversation.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      createdAt: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, role: true } },
    },
  })
  const page = rows.slice(0, limit)
  return {
    conversations: page.map(({ messages, ...c }) => ({ ...c, lastMessage: messages[0] ?? null })),
    nextCursor: rows.length > limit ? page.at(-1)!.id : null,
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getConversation(userId: string, conversationId: string) {
  if (!UUID.test(conversationId)) throw new NotFoundError("Conversation not found")
  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, userId, deletedAt: null },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!conversation) throw new NotFoundError("Conversation not found")
  return conversation
}

/**
 * Saves the student's message, asks the mentor for a reply and saves that
 * too. Starts a new conversation when `conversationId` is null.
 */
export async function sendMentorMessage(
  userId: string,
  conversationId: string | null,
  message: string
) {
  let conversation = conversationId
    ? await db.conversation.findFirst({ where: { id: conversationId, userId, deletedAt: null } })
    : await db.conversation.create({ data: { userId, title: titleFrom(message) } })
  if (!conversation) throw new NotFoundError("Conversation not found")

  const userMessage = await db.message.create({
    data: { conversationId: conversation.id, role: "USER", content: message },
  })

  const recent = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_WINDOW,
    select: { role: true, content: true },
  })
  const reply = await generateMentorReply(recent.reverse())

  const [assistantMessage, updated] = await db.$transaction([
    db.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: reply.content,
        agentUsed: reply.agentUsed,
        tokensUsed: reply.tokensUsed,
      },
    }),
    db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    }),
  ])
  conversation = updated

  return { conversation, userMessage, assistantMessage }
}

function titleFrom(message: string) {
  const oneLine = message.replace(/\s+/g, " ").trim()
  return oneLine.length > 60 ? `${oneLine.slice(0, 57)}...` : oneLine
}
