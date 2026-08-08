import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const subjects = [
  { slug: "os", title: "Operating Systems", topicCount: 4, completion: 46, description: "Processes, memory, scheduling, and concurrency." },
  { slug: "dbms", title: "DBMS", topicCount: 3, completion: 58, description: "Schemas, transactions, normalization, and indexes." },
  { slug: "cn", title: "Computer Networks", topicCount: 3, completion: 30, description: "Protocols, routing, transport, and the web stack." },
  { slug: "oop", title: "Object-Oriented Programming", topicCount: 3, completion: 72, description: "Classes, inheritance, abstraction, and design patterns." },
]

export default function TheorySubjectListPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Theory"
        description="A structured knowledge graph for conceptual depth and interview confidence."
        actions={
          <Button render={<Link href="/theory/os/processes-and-threads" />}>Continue learning</Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subjects.map((subject) => (
          <Link key={subject.slug} href={`/theory/${subject.slug}`} className="block">
            <Card glass hover className="h-full">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{subject.topicCount} topics</span>
                </div>
                <CardTitle>{subject.title}</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6">{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Completion {subject.completion}%</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${subject.completion}%` }} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}

