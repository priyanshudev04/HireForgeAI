"use client"

import * as React from "react"

import type { MentorTurn } from "@/lib/contracts/mentor"

export interface ChatMessage extends MentorTurn {
  id: string
  error?: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

// Conversations live in this browser until server-side persistence exists.
const STORAGE_KEY = "hireforge.mentor.conversations.v1"
const MAX_CONVERSATIONS = 50

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

function load(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Conversation[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(conversations: Conversation[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)))
  } catch {
    // Storage full or blocked: the chat still works, it just won't be remembered.
  }
}

export function titleFrom(messages: ChatMessage[]) {
  const first = messages.find((m) => m.role === "user")?.content.trim()
  if (!first) return "New conversation"
  return first.length > 60 ? `${first.slice(0, 57)}…` : first
}

export function useConversations() {
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser storage once after mount
    setConversations(load())
    setLoaded(true)
  }, [])

  React.useEffect(() => {
    if (loaded) save(conversations)
  }, [conversations, loaded])

  const upsert = React.useCallback((id: string, messages: ChatMessage[]) => {
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== id)
      if (messages.length === 0) return rest
      return [{ id, title: titleFrom(messages), messages, updatedAt: Date.now() }, ...rest]
    })
  }, [])

  const remove = React.useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { conversations, loaded, upsert, remove }
}

export function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return "now"
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
