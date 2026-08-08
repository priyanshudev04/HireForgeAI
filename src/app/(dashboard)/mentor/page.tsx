import Link from "next/link"
import { Bot, Search, Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const conversations = [
  { title: "Resume review", last: "Can you add measurable impact...", time: "2m ago", active: false },
  { title: "Graph theory", last: "Let's reason through BFS vs DFS", time: "12m ago", active: true },
  { title: "Project planning", last: "You can start with an API layer", time: "Thu", active: false },
]

export default function MentorPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Mentor"
        description="Ask questions, unblock your preparation, and plan your next step."
        actions={
          <Button>
            <Sparkles className="size-4" />
            New conversation
          </Button>
        }
      />

      <section className="grid min-h-[720px] gap-4 overflow-hidden rounded-2xl border border-border xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-card xl:border-b-0 xl:border-r">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Search conversations</span>
            </div>
          </div>
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => (
              <Link key={conversation.title} href="/mentor" className="block">
                <div className={`rounded-xl p-3 transition ${conversation.active ? "bg-primary/10 border border-primary/50" : "hover:bg-muted"}` }>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{conversation.title}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{conversation.last}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <main className="flex flex-col bg-background">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Conversation</p>
                <h2 className="font-heading text-xl font-bold text-foreground">Graph theory</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Regenerate response</Button>
                <Button variant="outline" size="sm">Ask follow-up</Button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-6">
            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <Bot className="size-4 text-primary" />
                  <span className="font-bold text-primary">Mentor</span>
                </div>
                <p className="leading-6 text-foreground">For graph problems, start by identifying whether the constraint is reachability, shortest path, or cycle detection.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
                <div className="mb-1 font-bold text-primary">You</div>
                <p className="leading-6">I’m confused about DFS vs BFS for graph traversal.</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <Bot className="size-4 text-primary" />
                  <span className="font-bold text-primary">Mentor</span>
                </div>
                <p className="leading-6 text-foreground">Use BFS when the shortest edge count matters. Use DFS when you need to explore all reachable nodes or detect cycles.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
              <textarea className="min-h-[52px] flex-1 resize-none border-0 bg-transparent text-sm outline-none" placeholder="Ask your mentor..." />
              <Button>
                <Send className="size-4" />
                Send
              </Button>
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

