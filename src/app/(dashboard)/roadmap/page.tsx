import { Calendar, CheckCircle2, Flag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const roadmap = [
  { title: "Foundation Sprint", period: "Week 1-2", status: "Completed" },
  { title: "Core DSA", period: "Week 3-6", status: "In progress" },
  { title: "Resume & Projects", period: "Week 7-8", status: "Next" },
  { title: "Interview Readiness", period: "Week 9-10", status: "Next" },
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Learning Roadmap" description="A clear path from fundamentals to interview readiness." actions={<Button>Generate roadmap</Button>} />

      <section className="space-y-4">
        {roadmap.map((item, index) => (
          <Card key={item.title} glass>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  {index % 2 === 0 ? <Calendar className="size-5" /> : <Flag className="size-5" />}
                </div>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.period}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success">{item.status}</span>
                <CheckCircle2 className="size-4 text-success" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}

