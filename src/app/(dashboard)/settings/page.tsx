import Link from "next/link"
import { Bell, CreditCard, ShieldCheck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Settings" description="Account, preferences, and subscription controls." />

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-4">
          <nav className="space-y-2">
            <Link href="/settings" className="block rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary">Account</Link>
            <Link href="/settings/preferences" className="block rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">Preferences</Link>
            <Link href="/settings/subscription" className="block rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">Subscription</Link>
          </nav>
        </aside>

        <section className="space-y-4">
          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>Profile and authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</p>
                <p className="mt-2 font-semibold text-foreground">Alex Chen</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="mt-2 font-semibold text-foreground">alex@example.com</p>
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Connected via Clerk authentication</p>
              <Button variant="destructive" className="mt-4">Delete account</Button>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  )
}

