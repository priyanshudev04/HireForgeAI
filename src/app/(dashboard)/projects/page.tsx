import Link from "next/link"
import { FolderOpen, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

const projectCards = [
  {
    title: "Job Tracker Intelligence",
    progress: 45,
    status: "In progress",
    description: "Track applications, optimize resume alignment, and keep decisions visible.",
    tags: ["Dashboard", "APIs", "Full-stack"],
  },
  {
    title: "System Design Studio",
    progress: 12,
    status: "Draft",
    description: "Plan and communicate architecture decisions for an interview-ready system.",
    tags: ["Design", "Architecture"],
  },
  {
    title: "Learning Synthesis Engine",
    progress: 76,
    status: "High momentum",
    description: "Turn theory topics and DSA patterns into a personalized learning flow.",
    tags: ["AI", "Learning"],
  },
]

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Projects"
        description="Keep manually-added and AI-generated projects organized across milestones."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="size-4" />
              Add manually
            </Button>
            <Button render={<Link href="/projects/generate" />}>
              <Sparkles className="size-4" />
              Generate with AI
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projectCards.map((project) => (
          <Link key={project.title} href="/projects/project-01" className="block">
            <Card glass hover className="h-full">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FolderOpen className="size-4" />
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{project.status}</span>
                </div>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Milestone progress</span>
                    <span className="text-xs font-semibold text-primary">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">{tag}</span>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Open project
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {projectCards.length === 0 && (
        <Card glass className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Sparkles className="size-10 text-primary" />
            <div>
              <h2 className="font-heading text-xl font-bold">No projects yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Generate one based on your skills.</p>
            </div>
            <Button render={<Link href="/projects/generate" />}>Generate with AI</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

