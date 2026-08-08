import { BarChart3, LineChart, Target } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const scores = [
  { label: "DSA", value: 86 },
  { label: "Theory", value: 78 },
  { label: "Resume", value: 82 },
  { label: "Interview", value: 72 },
]

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Analytics & HireScore" description="Track your readiness and AI-derived skill momentum." actions={<span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">HireScore 86</span>} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card glass>
          <CardHeader>
            <CardTitle>HireScore</CardTitle>
            <CardDescription>Overall readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-heading text-5xl font-bold text-foreground">86</span>
              <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">+4% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>DSA Strength</CardTitle>
            <CardDescription>Question solving velocity</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-heading text-4xl font-bold text-foreground">91</span>
            <div className="mt-4 h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "91%" }} />
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Theory Recall</CardTitle>
            <CardDescription>Concept retention</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-heading text-4xl font-bold text-foreground">73</span>
            <div className="mt-4 h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: "73%" }} />
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Interview Readiness</CardTitle>
            <CardDescription>Feedback and confidence</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="font-heading text-4xl font-bold text-foreground">80</span>
            <div className="mt-4 h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-success" style={{ width: "80%" }} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="size-4 text-primary" />
              <CardTitle>HireScore trend</CardTitle>
            </div>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid min-h-[280px] place-items-center rounded-xl border border-dashed border-border bg-background/40">
              <div className="space-y-1 text-center">
                <LineChart className="mx-auto size-10 text-primary" />
                <p className="font-heading text-lg font-bold">86 → 89 → 86 → 90 → 88 → 92 → 86</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Score line</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <CardTitle>Sub-score breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scores.map((score) => (
              <div key={score.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>{score.label}</span>
                  <span>{score.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${score.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <CardTitle>Strong topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">Graphs</span>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">Arrays</span>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">OS</span>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <CardTitle>Weak topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">Dynamic Programming</span>
              <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">DBMS normalization</span>
              <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">System design trade-offs</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

