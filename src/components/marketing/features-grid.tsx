import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Code2,
  BookOpen,
  FileText,
  Video,
  Bot,
  BarChart3,
  Building2,
  FolderGit2,
} from "lucide-react"

const featuresList = [
  {
    icon: Code2,
    title: "DSA Preparation",
    description: "Curated problem sheets (Striver, Blind 75) with interactive code editor, test runner, and complexity analysis.",
    badge: "Interactive",
  },
  {
    icon: BookOpen,
    title: "Theory Learning",
    description: "OS, DBMS, Computer Networks, and System Design concepts delivered via interactive flashcards and quiz modes.",
    badge: "Flashcards",
  },
  {
    icon: FileText,
    title: "ATS Resume Builder",
    description: "Build ATS-compliant resumes with real-time scoring, keyword optimization, and targeted role tailoring.",
    badge: "AI Scored",
  },
  {
    icon: Video,
    title: "AI Mock Interviews",
    description: "Voice-assisted mock technical and HR interviews with instant transcript evaluation and performance breakdown.",
    badge: "Voice AI",
  },
  {
    icon: Bot,
    title: "24/7 AI Career Mentor",
    description: "Get personalized study plans, instant code debugging guidance, and placement roadmap recommendations.",
    badge: "Always On",
  },
  {
    icon: BarChart3,
    title: "HireScore™ Analytics",
    description: "Comprehensive readiness scoring combining DSA accuracy, interview confidence, and core theory knowledge.",
    badge: "Analytics",
  },
  {
    icon: Building2,
    title: "Company Preparation",
    description: "Company-specific interview archives, recent question patterns, and salary insights for tier-1 tech firms.",
    badge: "Company Archives",
  },
  {
    icon: FolderGit2,
    title: "Project Showcase",
    description: "Standout portfolio project blueprints with architecture diagrams, code walkthroughs, and deployment guides.",
    badge: "Portfolio Ready",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Comprehensive Suite
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Everything Required for Placement Success
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Built from the ground up to solve the real challenges candidates face during campus and off-campus placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card
                key={idx}
                glass
                className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
