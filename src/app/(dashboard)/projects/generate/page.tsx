import Link from "next/link"
import { Bot, CheckCircle2, RefreshCw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const promptSkills = ["React", "Node.js", "APIs", "SQL", "Design Systems"]

const projectIdeas = [
  {
    title: "Job Tracker Intelligence",
    summary: "A portfolio dashboard to discover, track, and optimize job applications.",
    fit: "High fit for full-stack growth",
    tags: ["Next.js", "Auth", "Dashboard"],
    milestones: ["Create job intake", "Build analytics", "Ship status automation"],
  },
  {
    title: "Realtime Learning Companion",
    summary: "An AI-style study workspace that maps learning questions to theory and DSA tasks.",
    fit: "High fit for learning workflow",
    tags: ["AI UI", "Theory", "Analytics"],
    milestones: ["Skill graph", "Question routing", "Session summary"],
  },
  {
    title: "API Reliability Console",
    summary: "A dashboard for service observability, operational health, and incident notes.",
    fit: "Strong systems project",
    tags: ["Node.js", "Observability", "APIs"],
    milestones: ["Health endpoints", "Alert rules", "Incident logs"],
  },
]

export default function ProjectGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Project Generator"
        description="Generate portfolio-ready project ideas from your current learning stack."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/projects" />}>Back to projects</Button>
            <Button>
              <Sparkles className="size-4" />
              Generate
            </Button>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">Skill Inputs</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary skills</label>
              <div className="flex flex-wrap gap-2">
                {promptSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-border px-3 py-1 text-xs font-medium">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Project outcome</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Portfolio-ready app</option>
                <option>System design project</option>
                <option>Full-stack product</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Beginner-friendly</option>
              </select>
            </div>
            <Button className="w-full">
              <Sparkles className="size-4" />
              Generate ideas
            </Button>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Generated ideas</p>
              <p className="text-sm text-muted-foreground">3 possible project directions</p>
            </div>
            <Button variant="outline">
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {projectIdeas.map((project) => (
              <Card key={project.title} glass hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="size-4" />
                    </div>
                    <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{project.fit}</span>
                  </div>
                  <CardTitle className="mt-4 text-base">{project.title}</CardTitle>
                  <CardDescription className="mt-2 text-xs leading-6">{project.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Milestones</p>
                    <ul className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <li key={milestone} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3 text-success" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Sparkles className="size-4" />
                      Add to my projects
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bot className="size-4" />
                      Expand
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
