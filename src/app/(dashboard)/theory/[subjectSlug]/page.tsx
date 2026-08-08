import Link from "next/link"
import { BookOpen, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"

const theorySubjects: Record<string, {
  title: string
  description: string
  topics: Array<{
    slug: string
    title: string
    status: "Completed" | "In progress" | "Due today" | "Locked"
    completion: number
    duration: string
    revisionDue: string
  }>
}> = {
  os: {
    title: "Operating Systems",
    description: "Processes, memory, scheduling, concurrency, and system fundamentals.",
    topics: [
      { slug: "processes-and-threads", title: "Processes and Threads", status: "Completed", completion: 100, duration: "8 min read", revisionDue: "Due in 2 days" },
      { slug: "cpu-scheduling", title: "CPU Scheduling", status: "In progress", completion: 52, duration: "11 min read", revisionDue: "Due today" },
      { slug: "memory-management", title: "Memory Management", status: "Due today", completion: 8, duration: "14 min read", revisionDue: "Due today" },
      { slug: "deadlocks", title: "Deadlocks", status: "Locked", completion: 0, duration: "9 min read", revisionDue: "Locked" },
    ],
  },
  dbms: {
    title: "DBMS",
    description: "Schemas, normalization, transactions, indexing, and data modeling.",
    topics: [
      { slug: "normalization", title: "Normalization", status: "Completed", completion: 100, duration: "12 min read", revisionDue: "Reviewed" },
      { slug: "transaction-management", title: "Transaction Management", status: "In progress", completion: 65, duration: "10 min read", revisionDue: "Due tomorrow" },
      { slug: "indexing", title: "Indexing", status: "Due today", completion: 12, duration: "7 min read", revisionDue: "Due today" },
    ],
  },
  cn: {
    title: "Computer Networks",
    description: "Protocols, routing, transport, HTTP, TCP/IP, and distributed systems basics.",
    topics: [
      { slug: "tcp-ip-stack", title: "TCP/IP Stack", status: "In progress", completion: 40, duration: "15 min read", revisionDue: "Due in 3 days" },
      { slug: "http-and-web", title: "HTTP and Web Fundamentals", status: "Due today", completion: 18, duration: "11 min read", revisionDue: "Due today" },
      { slug: "routing", title: "Routing and Switching", status: "Locked", completion: 0, duration: "13 min read", revisionDue: "Locked" },
    ],
  },
  oop: {
    title: "Object-Oriented Programming",
    description: "Classes, inheritance, abstraction, polymorphism, and design patterns.",
    topics: [
      { slug: "oop-basics", title: "OOP Basics", status: "Completed", completion: 100, duration: "9 min read", revisionDue: "Reviewed" },
      { slug: "inheritance", title: "Inheritance and Composition", status: "In progress", completion: 68, duration: "13 min read", revisionDue: "Due tomorrow" },
      { slug: "design-patterns", title: "Design Patterns", status: "Due today", completion: 9, duration: "14 min read", revisionDue: "Due today" },
    ],
  },
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ subjectSlug: string }> }) {
  const { subjectSlug } = await params
  const subject = theorySubjects[subjectSlug]

  if (!subject) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <PageHeader title="Unknown Subject" description="The requested theory subject could not be found." />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={subject.title}
        description={subject.description}
        actions={
          <Button render={<Link href="/theory" />}>Back to subjects</Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theory scope</p>
              <h2 className="font-heading text-xl font-bold text-foreground">{subject.title}</h2>
            </div>
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="space-y-3">
            <SearchInput placeholder="Search topics..." />
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Completion</span>
                <span className="text-xs text-muted-foreground">{Math.round(subject.topics.reduce((acc, item) => acc + item.completion, 0) / subject.topics.length)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(subject.topics.reduce((acc, item) => acc + item.completion, 0) / subject.topics.length)}%` }} />
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {subject.topics.map((topic) => (
            <Link key={topic.title} href={`/theory/${subjectSlug}/${topic.slug}`} className="block">
              <Card glass hover>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{topic.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs">{topic.duration}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{topic.revisionDue}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{topic.completion}%</span>
                      <div className="h-2 w-20 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-success" style={{ width: `${topic.completion}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">{topic.status}</span>
                    <span className="text-xs text-primary">Read topic →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </section>
    </div>
  )
}
