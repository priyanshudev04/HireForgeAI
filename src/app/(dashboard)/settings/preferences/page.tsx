import { Bell, Mail, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function SettingsPreferencesPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Preferences" description="Notification channels and revision reminders." />

      <section className="grid gap-6">
        <Card glass>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <CardTitle>Notification preferences</CardTitle>
            </div>
            <CardDescription>Delivery channels and nudges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Career updates and reports</p>
                </div>
              </div>
              <input type="checkbox" className="size-4" checked readOnly />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Revision and daily reminders</p>
                </div>
              </div>
              <input type="checkbox" className="size-4" checked readOnly />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold text-foreground">Revision reminder</p>
                <p className="text-xs text-muted-foreground">Daily due-queue nudges</p>
              </div>
              <input type="checkbox" className="size-4" checked readOnly />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
