import { Activity, ChartNoAxesCombined, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const timelineEvents = [
  { title: "Solved Two Sum", subtitle: "DSA • Arrays", date: "Aug 08, 2026", type: "Solved problem" },
  { title: "Completed Resume Review", subtitle: "Resume • ATS", date: "Aug 07, 2026", type: "Resume" },
  { title: "Interview Session", subtitle: "Mock interview • Technical", date: "Aug 07, 2026", type: "Interview" },
  { title: "HireScore improved", subtitle: "Hiring readiness", date: "Aug 04, 2026", type: "Score" },
]

export default function AnalyticsTimelinePage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Learning Timeline"
        description="A chronological record of your preparation events."
        actions={<span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">History</span>}
      />

      <section className="space-y-4">
        {timelineEvents.map((event, index) => (
          <Card key={event.title} glass>
            <CardHeader className="flex-row items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                {index % 2 === 0 ? <Activity className="size-5" /> : <Clock className="size-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.subtitle}</CardDescription>
                  </div>
                  <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{event.type}</span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{event.date}</p>
              </div>
            </CardHeader>
          </Card>
        ))}

        <Card glass>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <ChartNoAxesCombined className="size-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Load earlier</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
