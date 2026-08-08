import Link from "next/link"
import { CheckCircle2, LineChart, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function CompanyDetailPage() {
  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Microsoft"
        description="Cloud platform, full-stack engineering, and distributed systems readiness."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Set as target</Button>
            <Button>Start company mock interview</Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card glass>
            <CardHeader>
              <CardTitle>Readiness Score</CardTitle>
              <CardDescription>Company-specific fit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid place-items-center">
                <div className="grid size-44 place-items-center rounded-full border-[12px] border-primary/50 text-center">
                  <div>
                    <p className="font-heading text-4xl font-bold">88</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MS ready</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Search className="size-4 text-primary" />
              <span className="font-heading text-lg font-bold text-foreground">Roadmap</span>
            </div>
            <div className="space-y-3">
              {[
                "Graph algorithms and system design",
                "Azure/cloud integration patterns",
                "Behavioral leadership narrative",
              ].map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart className="size-4 text-primary" />
                <CardTitle>Most Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="rounded-lg border border-border p-3 text-sm">Design a distributed cache.</li>
                <li className="rounded-lg border border-border p-3 text-sm">Explain consistency trade-offs.</li>
                <li className="rounded-lg border border-border p-3 text-sm">Discuss a past production incident.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  )
}
