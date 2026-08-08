import Link from "next/link"
import { Check, CheckCircle2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const milestones = [
  { title: "Set up project skeleton", done: true, owner: "Frontend" },
  { title: "Create dashboard layout", done: true, owner: "UI" },
  { title: "Connect API layer", done: false, owner: "Backend" },
  { title: "Deploy to preview", done: false, owner: "DevOps" },
]

export default function ProjectDetailPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Job Tracker Intelligence"
        description="A portfolio dashboard to discover, track, and optimize job applications."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/projects" />}>All projects</Button>
            <Button>
              <Plus className="size-4" />
              Add milestone
            </Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Ordered delivery checkpoints</CardDescription>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">45% complete</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={milestone.title} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full border border-border text-xs font-bold">{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">Owner: {milestone.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {milestone.done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
                        <Check className="size-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                        <CheckCircle2 className="size-3" /> Pending
                      </span>
                    )}
                    <input aria-label="Mark milestone complete" type="checkbox" className="size-4" checked={milestone.done} readOnly />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card glass>
            <CardHeader>
              <CardTitle>Project Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stack</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Next.js</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Node.js</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Postgres</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold text-foreground">In progress</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last updated</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Today, 10:24 AM</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
