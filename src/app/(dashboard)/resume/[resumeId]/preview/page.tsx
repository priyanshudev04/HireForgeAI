import Link from "next/link"
import { FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function ResumePreviewPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Resume Preview"
        description="Version history and print-ready layout."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/resume/resume-01" />}>Back to Editor</Button>
            <Button>
              <Printer className="size-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alex Chen</CardTitle>
              <CardDescription>Full Stack Engineer • Resume V4</CardDescription>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success">ATS 91</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Builder of scalable frontend and backend systems with a product mindset and strong platform focus.</p>
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience</p>
            <div className="mt-2 rounded-lg border border-border p-4">
              <p className="font-heading text-sm font-bold text-foreground">Software Engineer Intern</p>
              <p className="mt-1 text-xs text-muted-foreground">Acme Systems • 2024</p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                <li>Built internal dashboards and API tooling.</li>
                <li>Improved platform observability and delivery speed.</li>
              </ul>
            </div>
          </section>
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">React</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Node.js</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">System Design</span>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
