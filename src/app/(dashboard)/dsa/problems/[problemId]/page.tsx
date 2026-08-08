import Link from "next/link"
import { Bookmark, BookOpen, Bot, Code2, Play, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function DSAProblemDetailPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Two Sum"
        description="Arrays • Hashing • Easy"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Bookmark</Button>
            <Button render={<Link href="/dsa/problems" />}>Back to list</Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(420px,0.95fr)_minmax(520px,1.05fr)]">
        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Two Sum</CardTitle>
                  <CardDescription className="mt-2">Given an array of integers and a target, return indices of the two numbers that add up to the target.</CardDescription>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">Easy</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Problem Description</span>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  You are given an integer array <code className="rounded bg-background px-1 py-0.5 text-foreground">nums</code> and an integer <code className="rounded bg-background px-1 py-0.5 text-foreground">target</code>.
                  Return the indices of the two numbers whose sum equals the target. You may assume exactly one valid answer.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Topic</p>
                  <p className="mt-1 text-sm font-semibold">Arrays</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Pattern</p>
                  <p className="mt-1 text-sm font-semibold">Hashing</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-primary/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="size-4 text-primary" />
                    <span className="text-sm font-semibold">Hint panel</span>
                  </div>
                  <Button variant="outline" size="sm">Reveal hint</Button>
                </div>
                <p className="text-sm text-muted-foreground">Think about storing seen numbers and their indices as you scan the array.</p>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>Your latest attempts and accepted runtime.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm">Accepted</span>
                  <span className="text-xs text-success">O(n) hashmap</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm">Previous attempt</span>
                  <span className="text-xs text-muted-foreground">Wrong answer</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-6">
          <Card glass>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>JavaScript • Starter snippet loaded</CardDescription>
              </div>
              <div className="flex gap-2">
                <select aria-label="Select programming language" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option>JavaScript</option>
                  <option>Java</option>
                  <option>Python</option>
                  <option>C++</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="min-h-[280px] overflow-auto rounded-xl border border-border bg-[#10151f] p-4 text-xs leading-6 text-slate-100">
{`function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
}
`}
              </pre>

              <div className="flex flex-wrap gap-2">
                <Button>
                  <Play className="size-4" />
                  Run
                </Button>
                <Button variant="outline">Submit</Button>
                <Button variant="outline">AI Explanation</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  )
}
