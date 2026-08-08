import Link from "next/link"
import { BarChart3, FileSearch, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

export default function JDAnalyzerPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="JD Analyzer"
        description="Compare your resume against a target job description."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/resume/resume-01" />}>Back to editor</Button>
            <Button>Analyze</Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card glass>
          <CardHeader>
            <CardTitle>Paste job description</CardTitle>
            <CardDescription>Upload a JD or paste text to start the ATS analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea className="min-h-[260px] w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-primary" placeholder="Paste the JD here..." />
            <div className="flex flex-wrap gap-2">
              <Button>
                <FileSearch className="size-4" />
                Analyze Resume
              </Button>
              <Button variant="outline">
                <Upload className="size-4" />
                Upload JD
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>ATS match summary</CardDescription>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success">ATS 91</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <span className="text-sm font-semibold">Missing skills</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs">Distributed Systems</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">Kafka</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">Cloud Security</span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Weak bullet points</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Improve bullet describing system design responsibilities.</li>
                <li>Add a measurable reliability and performance outcome.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Keyword gap</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs">REST APIs</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs">Microservices</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs">AWS</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
