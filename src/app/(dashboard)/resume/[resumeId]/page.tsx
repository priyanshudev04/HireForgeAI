import Link from "next/link"
import { BarChart3, FileText, Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function ResumeEditorPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Resume Editor"
        description="SDE - Core Profile • latest version"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/resume/resume-01/preview" />}>Preview</Button>
            <Button variant="outline" render={<Link href="/resume/resume-01/jd-analyzer" />}>Analyze against JD</Button>
            <Button render={<Link href="/resume" />}>Save Version</Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(480px,1fr)_minmax(420px,0.88fr)]">
        <section className="space-y-4">
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Experience</CardTitle>
                  <CardDescription>Professional background and impact statements</CardDescription>
                </div>
                <Button variant="outline" size="sm">Add experience</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-base font-bold text-foreground">Software Engineer Intern</p>
                    <p className="mt-1 text-xs text-muted-foreground">Acme Systems • 2024</p>
                  </div>
                  <span className="rounded-full border border-border px-2 py-1 text-[10px]">Edit</span>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Built API observability dashboards reducing incident triage time by 38%.</li>
                  <li>Improved backend response speed through caching and batching.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Algorithmic and product-aware work samples</CardDescription>
                </div>
                <Button variant="outline" size="sm">Add project</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="font-heading text-base font-bold text-foreground">HireForge AI Career OS</p>
                <p className="mt-2 text-sm text-muted-foreground">Built a platform for placement preparation workflows, analytics, and daily learning loops.</p>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Targeted role skill inventory</CardDescription>
                </div>
                <Button variant="outline" size="sm">Add skill</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">JavaScript</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">React</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Node.js</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">System Design</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card glass>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>ATS alignment and role readability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading text-xl font-bold text-foreground">Alex Chen</p>
                    <p className="text-xs text-muted-foreground">Full Stack Engineer</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success">ATS 91</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile</p>
                    <p className="mt-1 text-sm text-muted-foreground">Motivated engineer with experience building product-oriented backend and frontend systems.</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
                    <p className="mt-1 text-sm text-muted-foreground">HireForge AI Career OS • API observability dashboard</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <Save className="size-4" />
                  Save Version
                </Button>
                <Button variant="outline">
                  <Upload className="size-4" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <BarChart3 className="size-4" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
