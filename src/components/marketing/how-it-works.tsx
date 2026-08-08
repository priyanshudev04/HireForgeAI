import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

const workflowSteps = [
  {
    step: "01",
    title: "Assess Baseline",
    description: "Take an initial diagnostic assessment to determine your current DSA and theory readiness score.",
  },
  {
    step: "02",
    title: "Structured Learning",
    description: "Follow customized daily study paths with curated DSA sheets and high-yield theory flashcards.",
  },
  {
    step: "03",
    title: "Practice & Refine",
    description: "Solve targeted problems with AI guidance, real-time hints, and automated complexity feedback.",
  },
  {
    step: "04",
    title: "Build & Optimize",
    description: "Craft an ATS-optimized resume tailored to target job descriptions with instant scoring.",
  },
  {
    step: "05",
    title: "Simulate Interviews",
    description: "Conduct realistic voice AI mock interviews with company-specific question sets and actionable feedback.",
  },
  {
    step: "06",
    title: "Get Placement Ready",
    description: "Track your HireScore™ reach top percentile benchmarks and land your dream job offer.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-muted/10 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Systematic Process
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            How HireForge AI Guarantees Progress
          </h2>
          <p className="mt-3 text-muted-foreground text-base">
            A proven 6-step framework designed to take you from preparation to placement offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-extrabold text-primary/80">
                    {step.step}
                  </span>
                  <CheckCircle2 className="size-5 text-muted-foreground/40" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
