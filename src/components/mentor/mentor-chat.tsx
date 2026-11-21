"use client"

import * as React from "react"
import {
  ArrowDown,
  BookOpen,
  Bot,
  Brain,
  Check,
  Code2,
  Copy,
  History,
  Lightbulb,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Send,
  Square,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  MENTOR_HISTORY_MAX_TURNS,
  MENTOR_MESSAGE_MAX_CHARS,
  type MentorStreamEvent,
  type MentorTurn,
} from "@/lib/contracts/mentor"
import { cn } from "@/lib/utils"

import { Markdown } from "./markdown"
import { newId, timeAgo, titleFrom, useConversations, type ChatMessage } from "./use-conversations"

const STARTERS = [
  { icon: Brain, title: "Explain a concept", prompt: "Explain BFS vs DFS with a small example, and when to use each." },
  { icon: Lightbulb, title: "Get a hint, not the answer", prompt: "Give me a first hint for Two Sum. Don't show the full solution yet." },
  { icon: BookOpen, title: "Quiz me", prompt: "Quiz me with 5 questions on DBMS normalization, one at a time." },
  { icon: Code2, title: "Review my approach", prompt: "I want to reverse a linked list. Walk me through the pointer changes step by step." },
]

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2" aria-label="Mentor is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export function MentorChat() {
  const { conversations, upsert, remove } = useConversations()
  const [activeId, setActiveId] = React.useState(() => newId())
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [atBottom, setAtBottom] = React.useState(true)

  const abortRef = React.useRef<AbortController | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = React.useCallback((smooth = false) => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" })
  }, [])

  // Follow the reply as it streams, unless the student scrolled up to read.
  React.useEffect(() => {
    if (atBottom) scrollToBottom()
  }, [messages, atBottom, scrollToBottom])

  // Grow the composer with its content, up to a cap.
  React.useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  React.useEffect(() => () => abortRef.current?.abort(), [])

  const patchReply = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  async function send(text: string, prior: ChatMessage[]) {
    const message = text.trim()
    if (!message || streaming) return

    const history: MentorTurn[] = prior
      .filter((m) => !m.error && m.content)
      .slice(-MENTOR_HISTORY_MAX_TURNS)
      .map(({ role, content }) => ({ role, content }))

    const conversationId = activeId
    const userMsg: ChatMessage = { id: newId(), role: "user", content: message }
    const reply: ChatMessage = { id: newId(), role: "assistant", content: "" }
    setMessages([...prior, userMsg, reply])
    upsert(conversationId, [...prior, userMsg])
    setInput("")
    setStreaming(true)
    setAtBottom(true)

    const controller = new AbortController()
    abortRef.current = controller
    let content = ""
    let error: string | undefined

    try {
      const response = await fetch("/api/ai/mentor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message, history }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error?.message ?? `Request failed (${response.status})`)
      }

      for await (const event of readMentorStream(response)) {
        if ("delta" in event) {
          content += event.delta
          patchReply(reply.id, { content })
        } else {
          error = event.error.message
          patchReply(reply.id, { error })
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        error = err instanceof Error ? err.message : "Something went wrong."
        patchReply(reply.id, { error })
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
      const finalReply = content || error ? [{ ...reply, content, error }] : []
      upsert(conversationId, [...prior, userMsg, ...finalReply])
      inputRef.current?.focus()
    }
  }

  function regenerate() {
    const lastUser = messages.findLastIndex((m) => m.role === "user")
    if (lastUser === -1) return
    send(messages[lastUser].content, messages.slice(0, lastUser))
  }

  function startNew() {
    abortRef.current?.abort()
    setActiveId(newId())
    setMessages([])
    setInput("")
    setHistoryOpen(false)
    inputRef.current?.focus()
  }

  function open(id: string) {
    const conversation = conversations.find((c) => c.id === id)
    if (!conversation) return
    abortRef.current?.abort()
    setActiveId(id)
    setMessages(conversation.messages)
    setHistoryOpen(false)
    setAtBottom(true)
  }

  function deleteConversation(id: string) {
    remove(id)
    if (id === activeId) startNew()
  }

  const title = titleFrom(messages)
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))

  const historyPanel = (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <Button className="w-full" onClick={startNew}>
          <MessageSquarePlus />
          New conversation
        </Button>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {conversations.length ? "No conversations match." : "Your conversations will show up here."}
          </p>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            className={cn(
              "group/item flex items-center gap-1 rounded-lg transition",
              c.id === activeId ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-muted",
            )}
          >
            <button type="button" onClick={() => open(c.id)} className="min-w-0 flex-1 px-3 py-2.5 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{c.title}</span>
                <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{timeAgo(c.updatedAt)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.messages.length} messages</p>
            </button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Delete ${c.title}`}
              className="mr-2 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100"
              onClick={() => deleteConversation(c.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <p className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
        Saved in this browser only, for now.
      </p>
    </div>
  )

  return (
    <section className="relative flex h-[calc(100dvh-13.5rem)] min-h-[560px] overflow-hidden rounded-2xl border border-border bg-background">
      <aside className="hidden w-[300px] shrink-0 border-r border-border bg-card xl:block">{historyPanel}</aside>

      {historyOpen && (
        <div className="absolute inset-0 z-20 flex xl:hidden">
          <div className="w-[85%] max-w-[320px] border-r border-border bg-card shadow-xl">{historyPanel}</div>
          <button type="button" aria-label="Close history" className="flex-1 bg-black/40" onClick={() => setHistoryOpen(false)} />
        </div>
      )}

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <Button variant="outline" size="icon-sm" className="xl:hidden" aria-label="Show history" onClick={() => setHistoryOpen(true)}>
            {historyOpen ? <X /> : <History />}
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-base font-bold text-foreground sm:text-lg">{title}</h2>
            <p className="text-xs text-muted-foreground">{streaming ? "Mentor is replying…" : "AI study mentor"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={startNew} disabled={messages.length === 0}>
            <MessageSquarePlus />
            <span className="hidden sm:inline">New</span>
          </Button>
        </header>

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget
            setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80)
          }}
          className="relative flex-1 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="size-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-2xl font-bold text-foreground">What are we studying today?</h3>
                <p className="text-sm text-muted-foreground">
                  Ask about DSA, CS theory or interviews. Your mentor explains, hints and quizzes you.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2">
                {STARTERS.map(({ icon: Icon, title, prompt }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => send(prompt, messages)}
                    className="group/starter rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="size-4 text-primary" />
                      {title}
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6" aria-live="polite">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      <p className="whitespace-pre-wrap leading-6">{m.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {m.content ? <Markdown>{m.content}</Markdown> : !m.error && <TypingDots />}
                      {m.error && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          <span className="flex-1">{m.error}</span>
                          {m.id === lastAssistantId && !streaming && (
                            <Button variant="outline" size="xs" onClick={regenerate}>
                              <RotateCcw />
                              Retry
                            </Button>
                          )}
                        </div>
                      )}
                      {m.content && !(streaming && m.id === lastAssistantId) && (
                        <div className="mt-1.5 flex gap-1 text-muted-foreground">
                          <CopyButton text={m.content} />
                          {m.id === lastAssistantId && (
                            <Button variant="ghost" size="xs" onClick={regenerate} disabled={streaming}>
                              <RotateCcw />
                              Regenerate
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {!atBottom && messages.length > 0 && (
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Scroll to latest"
            className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-md"
            onClick={() => {
              setAtBottom(true)
              scrollToBottom(true)
            }}
          >
            <ArrowDown />
          </Button>
        )}

        <form
          className="border-t border-border px-4 py-3 sm:px-5"
          onSubmit={(e) => {
            e.preventDefault()
            send(input, messages)
          }}
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={inputRef}
              rows={1}
              autoFocus
              className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground"
              placeholder="Ask your mentor anything…"
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
              <Button type="button" variant="outline" size="icon-lg" aria-label="Stop" onClick={() => abortRef.current?.abort()}>
                <Square className="fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon-lg" aria-label="Send" disabled={!input.trim()}>
                <Send />
              </Button>
            )}
          </div>
          <div className="mx-auto mt-1.5 flex max-w-3xl justify-between text-[11px] text-muted-foreground">
            <span className="hidden sm:inline">Enter to send, Shift + Enter for a new line</span>
            <span className={cn(input.length < MENTOR_MESSAGE_MAX_CHARS - 500 && "invisible")}>
              {input.length}/{MENTOR_MESSAGE_MAX_CHARS}
            </span>
          </div>
        </form>
      </main>
    </section>
  )
}
