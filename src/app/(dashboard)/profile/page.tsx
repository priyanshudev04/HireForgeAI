import { Award, Calendar, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Profile" description="Your public preparation profile and current mission summary." />

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card glass>
          <CardHeader>
            <div className="grid place-items-center">
              <div className="grid size-28 place-items-center rounded-full bg-primary/10 text-primary">
                <User className="size-10" />
              </div>
            </div>
            <CardTitle className="text-center">Alex Chen</CardTitle>
            <CardDescription className="text-center">Full Stack Engineer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">HireScore</span>
                <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">86</span>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Streak: 12 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 md:grid-cols-2">
          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="size-4 text-primary" />
                <CardTitle>Achievements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 24 DSA problems solved</li>
                <li>• 3 project milestones completed</li>
                <li>• 2 mock interview sessions finished</li>
              </ul>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Target Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-foreground">Full-stack software engineer</p>
              <p className="mt-2 text-sm text-muted-foreground">Primary focus: product engineering, APIs, performance, and front-end architecture.</p>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  )
}

