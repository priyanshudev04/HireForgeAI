import Link from "next/link"
import { BarChart3, CheckCircle2, Mic } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function InterviewFeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Session Feedback"
        description="Detailed review of your most recent mock interview."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/interview/sessions/session-126" />}>Back to session</Button>
            <Button>Retake interview</Button>
          </div>
        }
      />

      <section className="grid gap-6 md:grid-cols-4">
        <Card glass>
          <CardHeader>
            <CardTitle>Overall</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-bold text-foreground">84</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Rating</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold text-foreground">88</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Clarity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold text-foreground">79</p>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Technical Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-bold text-foreground">89</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <CardTitle>Question Review</CardTitle>
            </div>
            <CardDescription>Per-question breakdown and coaching notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Design a rate limiter</p>
                <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">Strong</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">You explained the request flow and tradeoffs clearly. Include a fallback for request bursts and share capacity.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Discuss tradeoffs</p>
                <span className="rounded-full bg-warning/15 px-2 py-1 text-[10px] font-bold text-warning">Improve</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Tie your answer more directly to operational constraints such as memory, state sync, and retry safety.</p>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-primary" />
              <CardTitle>Voice Replay</CardTitle>
            </div>
            <CardDescription>Session audio replay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interview audio</span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">00:45 / 02:40</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-[45%] rounded-full bg-primary" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm">Replay</Button>
                <Button variant="outline" size="sm">Download transcript</Button>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                <span className="text-sm font-semibold text-foreground">Recommendations</span>
              </div>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                <li>Add explicit examples around cache invalidation.</li>
                <li>Clarify the difference between application and infrastructure limits.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
