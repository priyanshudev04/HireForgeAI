import { CreditCard, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function SettingsSubscriptionPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Subscription" description="Current plan and AI usage transparency." />

      <section className="grid gap-6 md:grid-cols-2">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <CardTitle>Current plan</CardTitle>
            </div>
            <CardDescription>Plan and entitlement summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <p className="font-heading text-2xl font-bold text-foreground">Pro Plan</p>
              <p className="mt-2 text-sm text-muted-foreground">Unlimited learning workspace</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI usage</span>
                <span className="text-xs font-bold text-primary">24 / 100</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "24%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <CardTitle>Upgrade path</CardTitle>
            </div>
            <CardDescription>Future billing integration skeleton</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold text-foreground">AI tier quota</p>
              <p className="mt-2 text-sm text-muted-foreground">Project generation and mentor responses are available within your current tier.</p>
            </div>
            <Button>Upgrade plan</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
