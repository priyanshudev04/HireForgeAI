"use client"

import * as React from "react"
import { Bot, RotateCcw, Send, Sparkles, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  MENTOR_HISTORY_MAX_TURNS,
  MENTOR_MESSAGE_MAX_CHARS,
  type MentorStreamEvent,
  type MentorTurn,
} from "@/lib/contracts/mentor"
import { cn } from "@/lib/utils"

interface ChatMessage extends MentorTurn {
  id: string
  error?: string
}

const STARTERS = [
  "Explain BFS vs DFS and when to use each",
  "Quiz me on DBMS normalization",
  "Give me a hint for Two Sum without the full solution",
]

let nextId = 0
const newId = () => `m${++nextId}`

/** Reads the SSE body of /api/ai/mentor/messages and yields each event. */
async function* readMentorStream(response: Response): AsyncGenerator<MentorStreamEvent> {
  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += value
    let boundary: number
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data: ")) continue
        const data = line.slice(6)
        if (data === "[DONE]") return
        yield JSON.parse(data) as MentorStreamEvent
      }
    }
  }
}

export function MentorChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  const abortRef = React.useRef<AbortController | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  React.useEffect(() => () => abortRef.current?.abort(), [])

  const patchMessage = (id: string, patch: (m: ChatMessage) => Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch(m) } : m)))

  async function send(text: string, prior: ChatMessage[]) {
    const message = text.trim()
    if (!message || streaming) return

    const history: MentorTurn[] = prior
      .filter((m) => !m.error && m.content)
      .slice(-MENTOR_HISTORY_MAX_TURNS)
      .map(({ role, content }) => ({ role, content }))

    const userMsg: ChatMessage = { id: newId(), role: "user", content: message }
    const reply: ChatMessage = { id: newId(), role: "assistant", content: "" }
    setMessages([...prior, userMsg, reply])
    setInput("")
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch("/api/ai/mentor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error?.message ?? `Request failed (${response.status})`)
      }

      for await (const event of readMentorStream(response)) {
        if ("delta" in event) {
          patchMessage(reply.id, (m) => ({ content: m.content + event.delta }))
        } else {
          patchMessage(reply.id, () => ({ error: event.error.message }))
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        patchMessage(reply.id, () => ({ error: error instanceof Error ? error.message : "Something went wrong." }))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function regenerate() {
    const lastUser = messages.findLastIndex((m) => m.role === "user")
    if (lastUser === -1) return
    send(messages[lastUser].content, messages.slice(0, lastUser))
  }

  function reset() {
    abortRef.current?.abort()
    setMessages([])
    setInput("")
  }

  const title = messages.find((m) => m.role === "user")?.content ?? "New conversation"
  const canRegenerate = !streaming && messages.some((m) => m.role === "assistant")

  return (
    <section className="grid min-h-[720px] gap-4 overflow-hidden rounded-2xl border border-border xl:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card xl:border-b-0 xl:border-r">
        <div className="border-b border-border p-4">
          <Button className="w-full" onClick={reset}>
            <Sparkles className="size-4" />
            New conversation
          </Button>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-xl border border-primary/50 bg-primary/10 p-3">
            <span className="line-clamp-1 font-semibold text-foreground">{title}</span>
            <p className="mt-2 text-xs text-muted-foreground">
              {messages.length ? `${messages.length} messages` : "Ask anything to get started"}
            </p>
          </div>
          <p className="px-1 pt-2 text-xs text-muted-foreground">
            Conversations aren&apos;t saved yet. Refreshing the page starts a new one.
          </p>
        </div>
      </aside>

      <main className="flex min-h-0 flex-col bg-background">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Conversation</p>
              <h2 className="truncate font-heading text-xl font-bold text-foreground">{title}</h2>
            </div>
            <Button variant="outline" size="sm" onClick={regenerate} disabled={!canRegenerate}>
              <RotateCcw className="size-4" />
              Regenerate response
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[560px] flex-1 space-y-4 overflow-auto p-6" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <Bot className="size-10 text-primary" />
              <p className="max-w-md text-sm text-muted-foreground">
                Your mentor explains concepts, gives step-by-step hints, and quizzes you. Try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((starter) => (
                  <Button key={starter} variant="outline" size="sm" onClick={() => send(starter, messages)}>
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
                  <div className="mb-1 font-bold text-primary">You</div>
                  <p className="whitespace-pre-wrap leading-6">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <Bot className="size-4 text-primary" />
                    <span className="font-bold text-primary">Mentor</span>
                  </div>
                  {m.content ? (
                    <p className="whitespace-pre-wrap leading-6 text-foreground">{m.content}</p>
                  ) : (
                    !m.error && <p className="animate-pulse leading-6 text-muted-foreground">Thinking…</p>
                  )}
                  {m.error && <p className="mt-1 leading-6 text-destructive">{m.error}</p>}
                </div>
              </div>
            ),
          )}
        </div>

        <form
          className="border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            send(input, messages)
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
            <textarea
              className="min-h-[52px] flex-1 resize-none border-0 bg-transparent text-sm outline-none"
              placeholder="Ask your mentor..."
              value={input}
              maxLength={MENTOR_MESSAGE_MAX_CHARS}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send(input, messages)
                }
              }}
            />
            {streaming ? (
              <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}>
                <Square className="size-4" />
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                <Send className="size-4" />
                Send
              </Button>
            )}
          </div>
          <p className={cn("mt-2 text-right text-[11px] text-muted-foreground", input.length < 3500 && "invisible")}>
            {input.length}/{MENTOR_MESSAGE_MAX_CHARS}
          </p>
        </form>
      </main>
    </section>
  )
}
