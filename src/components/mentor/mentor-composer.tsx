"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/**
 * Sends a message to the mentor. The page itself is a Server Component that
 * reads history from the database, so after a send we only navigate to the
 * conversation and refresh; the saved messages come back from the server.
 */
export function MentorComposer({ conversationId }: { conversationId: string | null }) {
  const router = useRouter()
  const [message, setMessage] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function send() {
    const text = message.trim()
    if (!text || pending) return
    setPending(true)
    try {
      const res = await fetch("/api/ai/mentor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error?.message ?? "Could not send message")
      setMessage("")
      const id = json.data.conversation.id as string
      if (id !== conversationId) router.push(`/mentor?c=${id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send message")
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="border-t border-border p-4"
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          maxLength={4000}
          className="min-h-[52px] flex-1 resize-none border-0 bg-transparent text-sm outline-none"
          placeholder="Ask your mentor..."
          aria-label="Message"
        />
        <Button type="submit" disabled={pending || !message.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Send
        </Button>
      </div>
    </form>
  )
}
