import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DifficultyBadge } from "@/components/shared/difficulty-badge"
import { SectionHeader } from "@/components/shared/section-header"
import { StatCard } from "@/components/shared/stat-card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your daily HireForge AI placement preparation dashboard.",
}

const todayTasks = [
  { title: "Two Sum", topic: "Arrays · Blind 75", difficulty: "easy", duration: "20 min", complete: true },
  { title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "medium", duration: "35 min", complete: false },
  { title: "Revise DBMS Normalization", topic: "Theory flashcards", difficulty: "easy", duration: "15 min", complete: false },
]

const revisions = [
  { title: "Binary Search patterns", due: "Due today", count: 8 },
  { title: "Operating Systems · Deadlocks", due: "Tomorrow", count: 5 },
  { title: "React hooks", due: "Aug 11", count: 12 },
]

const activities = [
  { title: "Solved Valid Parentheses", detail: "DSA Practice · Easy", time: "2h ago", icon: CheckCircle2 },
  { title: "Completed Array revision", detail: "12 flashcards reviewed", time: "Yesterday", icon: BookOpen },
  { title: "HireScore improved", detail: "+4 points this week", time: "Yesterday", icon: TrendingUp },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Daily preparation plan
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Good morning, Alex</h1>
          <p className="mt-1 text-sm text-muted-foreground">You are one focused session away from a stronger placement profile.</p>
        </div>
        <Button render={<Link href="/coming-soon" />}>
          View full roadmap
          <ArrowRight className="size-4" />
        </Button>
      </header>

      <section aria-label="Progress overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card glass className="md:col-span-2 xl:col-span-1">
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className="grid size-24 shrink-0 place-items-center rounded-full p-2"
              style={{ background: "conic-gradient(var(--primary) 0 72%, var(--muted) 72% 100%)" }}
              role="img"
              aria-label="HireScore: 72 out of 100"
            >
              <div className="grid size-full place-items-center rounded-full bg-card">
                <span className="font-heading text-2xl font-bold">72</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">score</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">HireScore</p>
              <p className="mt-1 text-sm font-semibold text-success">+4 this week</p>
              <p className="mt-1 text-xs text-muted-foreground">Top 28% of candidates</p>
            </div>
          </CardContent>
        </Card>

        <StatCard title="Current streak" value="12 days" description="Your best is 18 days" icon={Flame} trend={{ value: 20, label: "vs. last week", isPositive: true }} />
        <StatCard title="Problems solved" value="84" description="16 of 20 weekly goal" icon={Target} progress={80} />
        <StatCard title="Study time" value="9.5h" description="This week" icon={Clock3} trend={{ value: 12, label: "vs. last week", isPositive: true }} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <Card glass>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-heading text-xl">Today&apos;s tasks</CardTitle>
              <CardDescription className="mt-1">A focused plan designed around your weak areas.</CardDescription>
            </div>
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">1 of 3 done</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task) => (
              <Link
                key={task.title}
                href="/coming-soon"
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {task.complete ? <CheckCircle2 className="size-5 shrink-0 text-success" /> : <Circle className="size-5 shrink-0 text-muted-foreground group-hover:text-primary" />}
                <div className="min-w-0 flex-1">
                  <p className={task.complete ? "text-sm font-medium text-muted-foreground line-through" : "text-sm font-semibold text-foreground"}>{task.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.topic}</p>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <DifficultyBadge difficulty={task.difficulty} />
                  <span className="text-xs text-muted-foreground">{task.duration}</span>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
            <Button variant="outline" className="mt-2 w-full" render={<Link href="/coming-soon" />}>
              <RotateCcw className="size-4" />
              Regenerate today&apos;s plan
            </Button>
          </CardContent>
        </Card>

        <aside className="space-y-6" aria-label="Dashboard updates">
          <Card glass>
            <CardHeader className="pb-3">
              <SectionHeader title="Upcoming revision" subtitle="Keep concepts fresh" actions={<Button variant="link" size="sm" render={<Link href="/coming-soon" />}>View all</Button>} />
            </CardHeader>
            <CardContent className="space-y-1">
              {revisions.map((revision) => (
                <Link key={revision.title} href="/coming-soon" className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted">
                  <div className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent"><GraduationCap className="size-4" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{revision.title}</p><p className="text-xs text-muted-foreground">{revision.count} cards</p></div>
                  <span className="text-xs text-muted-foreground">{revision.due}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader className="pb-3"><SectionHeader title="Recent activity" subtitle="Your latest wins" /></CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon
                return <div key={activity.title} className="flex gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></div><div className="min-w-0"><p className="text-sm font-medium">{activity.title}</p><p className="text-xs text-muted-foreground">{activity.detail} · {activity.time}</p></div></div>
              })}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
