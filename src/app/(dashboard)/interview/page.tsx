import Link from "next/link"
import { Calendar, FileCheck, Mic, Play, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const history = [
  { title: "System Design Practice", mode: "Text", date: "Today, 10:12 AM", score: 84 },
  { title: "DSA Round", mode: "Live Code", date: "Yesterday, 5:20 PM", score: 76 },
  { title: "Behavioral Interview", mode: "Text", date: "Aug 06, 9:50 PM", score: 90 },
]

export default function InterviewDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Mock Interview"
        description="Practice technical and behavioural interviews with structured scoring and feedback."
        actions={
          <Button render={<Link href="/interview/sessions/session-126" />}>Start new session</Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card glass className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="size-4 text-primary" />
              <CardTitle>Start New Session</CardTitle>
            </div>
            <CardDescription>Configure your next mock interview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-center">
                  <Mic className="size-4" />
                  Text
                </Button>
                <Button variant="outline" className="justify-center">
                  <Mic className="size-4" />
                  Voice
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Company flavor</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Microsoft</option>
                <option>Amazon</option>
                <option>Google</option>
                <option>General</option>
              </select>
            </div>
            <Button className="w-full">
              <Play className="size-4" />
              Start interview
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">History</p>
              <p className="text-sm text-muted-foreground">Your recent sessions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="size-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="size-4" />
                This week
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {history.map((item) => (
              <Link key={item.title} href="/interview/sessions/session-126/feedback" className="block">
                <Card glass hover>
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{item.mode}</span>
                        <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold text-muted-foreground">{item.date}</span>
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">Score {item.score}</span>
                      <FileCheck className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
