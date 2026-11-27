import Link from "next/link"
import { Bot, MessageSquare, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MentorComposer } from "@/components/mentor/mentor-composer"
import { requireUser } from "@/server/auth"
import { getConversation, listConversations, NotFoundError } from "@/server/mentor/conversations"

const timeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

function relativeTime(date: Date | null) {
  if (!date) return ""
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 60) return timeFormat.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return timeFormat.format(hours, "hour")
  return timeFormat.format(Math.round(hours / 24), "day")
}

export default async function MentorPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams
  const user = await requireUser()
  const { conversations } = await listConversations(user.id)

  let active: Awaited<ReturnType<typeof getConversation>> | null = null
  if (c) {
    try {
      active = await getConversation(user.id, c)
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Mentor"
        description="Ask questions, unblock your preparation, and plan your next step."
        actions={
          <Button render={<Link href="/mentor" />}>
            <Sparkles className="size-4" />
            New conversation
          </Button>
        }
      />

      <section className="grid min-h-[720px] gap-4 overflow-hidden rounded-2xl border border-border xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-card xl:border-b-0 xl:border-r">
          <div className="border-b border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your conversations</p>
          </div>
          <div className="space-y-2 p-3">
            {conversations.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No conversations yet. Ask your first question to start one.</p>
            ) : (
              conversations.map((conversation) => (
                <Link key={conversation.id} href={`/mentor?c=${conversation.id}`} className="block">
                  <div
                    className={`rounded-xl p-3 transition ${
                      conversation.id === active?.id ? "border border-primary/50 bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">{conversation.title ?? "Untitled"}</span>
                      <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
                        {relativeTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    {conversation.lastMessage ? (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{conversation.lastMessage.content}</p>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        <main className="flex flex-col bg-background">
          <div className="border-b border-border p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Conversation</p>
            <h2 className="font-heading text-xl font-bold text-foreground">{active?.title ?? "New conversation"}</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-6">
            {!active || active.messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                <div className="space-y-2">
                  <MessageSquare className="mx-auto size-6" />
                  <p>Ask anything you are studying. Your chat is saved to your account.</p>
                </div>
              </div>
            ) : (
              active.messages.map((message) =>
                message.role === "USER" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
                      <div className="mb-1 font-bold text-primary">You</div>
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <Bot className="size-4 text-primary" />
                        <span className="font-bold text-primary">Mentor</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-6 text-foreground">{message.content}</p>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <MentorComposer conversationId={active?.id ?? null} />
        </main>
      </section>
    </div>
  )
}
