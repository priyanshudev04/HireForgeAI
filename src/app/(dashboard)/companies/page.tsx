import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const companies = [
  { name: "Microsoft", industry: "Cloud", readiness: 88, slug: "microsoft" },
  { name: "Amazon", industry: "Commerce", readiness: 81, slug: "amazon" },
  { name: "Google", industry: "Search", readiness: 90, slug: "google" },
  { name: "TCS", industry: "Consulting", readiness: 73, slug: "tcs" },
]

export default function CompaniesPage() {
  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Company Mode"
        description="Discover targets, company signals, and interview patterns."
        actions={<Button variant="outline">Industry filter</Button>}
      />

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search companies</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {companies.map((company) => (
          <Link key={company.name} href={`/companies/${company.slug}`} className="block">
            <Card glass hover className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">{company.name.slice(0, 2)}</div>
                  <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{company.readiness}% ready</span>
                </div>
                <CardTitle className="mt-4">{company.name}</CardTitle>
                <CardDescription>{company.industry}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${company.readiness}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Difficulty distribution</span>
                  <span>{company.readiness}%</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}

