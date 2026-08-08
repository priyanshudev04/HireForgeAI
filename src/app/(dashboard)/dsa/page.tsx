import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const topicCards = [
  { title: "Arrays & Hashing", count: 24, progress: 72, description: "Hash maps, frequency counting, two-pointer patterns." },
  { title: "Stacks & Queues", count: 12, progress: 38, description: "Monotonic structures and queue-driven state." },
  { title: "Strings", count: 18, progress: 50, description: "Substrings, character manipulations, anagrams." },
  { title: "Graphs", count: 21, progress: 12, description: "BFS, DFS, shortest paths, topological order." },
  { title: "Trees", count: 20, progress: 61, description: "DFS, BFS, recursion, traversals." },
  { title: "Dynamic Programming", count: 16, progress: 18, description: "Memoization and tabulation patterns." },
]

export default function DSATopicBrowsePage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="DSA Practice"
        description="Browse by topic or pattern and move into a guided problem flow."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">By Topic</Button>
            <Button variant="outline">By Pattern</Button>
            <Button render={<Link href="/dsa/problems" />}>Browse problems</Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topicCards.map((topic) => (
          <Link key={topic.title} href="/dsa/problems" className="block">
            <Card glass hover className="h-full">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{topic.count} problems</span>
                </div>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Completion {topic.progress}%</span>
                  <span className="text-xs text-primary">Open topic →</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${topic.progress}%` }} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}

