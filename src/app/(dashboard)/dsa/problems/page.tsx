import Link from "next/link"
import { Filter, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"

const problems = [
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays", pattern: "Hashing", company: "TCS", status: "Solved", acceptance: 83, duration: "25 min" },
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topic: "Stacks", pattern: "Stack", company: "Microsoft", status: "Unsolved", acceptance: 76, duration: "20 min" },
  { id: "longest-substring", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Strings", pattern: "Sliding Window", company: "Amazon", status: "Bookmarked", acceptance: 71, duration: "40 min" },
  { id: "merge-k-lists", title: "Merge k Sorted Lists", difficulty: "Hard", topic: "Heap", pattern: "Priority Queue", company: "Google", status: "Unsolved", acceptance: 61, duration: "60 min" },
]

export default function DSAProblemListPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="DSA Practice"
        description="Browse problems by topic, pattern, and company readiness."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">By Topic</Button>
            <Button variant="outline">By Pattern</Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">Filters</h2>
          </div>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-2 py-1 text-xs">Easy</span>
                <span className="rounded-full border border-border px-2 py-1 text-xs">Medium</span>
                <span className="rounded-full border border-border px-2 py-1 text-xs">Hard</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Arrays</option>
                <option>Stacks</option>
                <option>Strings</option>
                <option>Heap</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Pattern</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Hashing</option>
                <option>Stack</option>
                <option>Sliding Window</option>
                <option>Priority Queue</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Company</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>All companies</option>
                <option>Microsoft</option>
                <option>Amazon</option>
                <option>Google</option>
                <option>TCS</option>
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SearchInput placeholder="Search problems..." />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Solved</Button>
              <Button variant="outline" size="sm">Unsolved</Button>
              <Button variant="outline" size="sm">Bookmarked</Button>
            </div>
          </div>

          <div className="space-y-3">
            {problems.map((problem) => (
              <Link key={problem.title} href={`/dsa/problems/${problem.id}`} className="block">
                <Card glass hover>
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{problem.company}</span>
                        <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{problem.topic}</span>
                        <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{problem.pattern}</span>
                      </div>
                      <CardTitle className="text-base">{problem.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{problem.status}</span>
                      <span className="text-xs text-muted-foreground">{problem.acceptance}% acceptance</span>
                      <span className="text-xs text-muted-foreground">{problem.duration}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Difficulty: {problem.difficulty}</span>
                      <span className="text-xs text-primary">Open problem →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
