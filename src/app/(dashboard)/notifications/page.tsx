import { Bell, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const notifications = [
  { title: "Problem due for revision", body: "Arrays & hashing queue is ready for review", type: "Revision", unread: true },
  { title: "Resume insight updated", body: "Your resume now matches 88% of the selected JD", type: "Resume", unread: true },
  { title: "Interview feedback complete", body: "Your system design session has a report", type: "Interview", unread: false },
]

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Notifications" description="Your learning and product activity updates." actions={<Button variant="outline"><CheckCheck className="size-4" />Mark all as read</Button>} />

      <section className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.title} glass className={n.unread ? "border-primary/50 bg-primary/5" : undefined}>
            <CardHeader className="flex-row items-center gap-4">
              <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{n.title}</CardTitle>
                    <CardDescription>{n.body}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{n.type}</span>
                    {n.unread && <span className="size-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}

