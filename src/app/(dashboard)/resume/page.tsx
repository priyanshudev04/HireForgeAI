import Link from "next/link"
import { ArrowRight, FileText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const resumes = [
  { id: "resume-01", title: "SDE - Core Profile", score: 91, updated: "2h ago", version: "V4" },
  { id: "resume-02", title: "Full Stack Resume", score: 88, updated: "1d ago", version: "V2" },
]

export default function ResumeBuilderPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Resume Builder"
        description="Create, refine, and optimize ATS-ready resumes against target roles."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Create New Resume</Button>
            <Button render={<Link href="/resume/resume-01" />}>Open latest</Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Link key={resume.id} href={`/resume/${resume.id}`} className="block">
            <Card glass hover className="h-full">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success">ATS {resume.score}</span>
                </div>
                <CardTitle>{resume.title}</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6">Latest version: {resume.version}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Updated {resume.updated}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Card glass hover className="h-full">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <span className="rounded-full border border-primary/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">New</span>
            </div>
            <CardTitle>Build your first resume</CardTitle>
            <CardDescription className="mt-2 text-xs leading-6">Create a role-specific resume with structured experience and skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/resume/resume-01" />}>Start building</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

