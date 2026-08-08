import Link from "next/link"
import { Mic, Radio, Send, StopCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InterviewSessionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/60 bg-card/60">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Mock Interview</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Session #126</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-success">Live</span>
            <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Text Mode</span>
            <Button variant="destructive" size="sm">
              <StopCircle className="size-4" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-84px)] max-w-[1400px] gap-6 p-4 lg:grid-cols-[minmax(780px,1fr)_340px] lg:p-6">
        <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Question 3 of 6</p>
                <h2 className="mt-2 font-heading text-xl font-bold text-foreground">Design a rate limiter</h2>
              </div>
              <div className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">02:45</div>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-6">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm text-foreground">
                <p className="font-semibold text-primary">Interviewer</p>
                <p className="mt-1 leading-6">How would you design a rate limiter for a public API? What components would you keep?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                <p className="font-semibold text-primary">You</p>
                <p className="mt-1 leading-6">I would use a token bucket strategy...</p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thinking...</p>
                <span className="animate-pulse text-xs font-bold text-primary">Mentor is evaluating</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-6">
            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Your answer</label>
              <textarea className="min-h-[140px] w-full resize-none border-0 bg-transparent text-sm outline-none" placeholder="Describe your approach..." />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mic className="size-4" />
                    Voice mode
                  </Button>
                  <Button variant="outline">
                    <Radio className="size-4" />
                    Record
                  </Button>
                </div>
                <Button>
                  <Send className="size-4" />
                  Submit answer
                </Button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <Card glass>
            <CardHeader>
              <CardTitle>Session Control</CardTitle>
              <CardDescription>Active setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</p>
                <p className="mt-2 font-semibold text-foreground">Medium</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company flavor</p>
                <p className="mt-2 font-semibold text-foreground">Microsoft</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress</p>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: "50%" }} />
                </div>
              </div>
              <Button variant="outline" className="w-full" render={<Link href="/interview/sessions/session-126/feedback" />}>View feedback</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
