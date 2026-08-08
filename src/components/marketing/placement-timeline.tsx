import { Badge } from "@/components/ui/badge"
import { Check, Calendar, Target, Award, Rocket } from "lucide-react"

const timelineMilestones = [
  {
    phase: "Month 1",
    title: "Foundation & Core DSA",
    items: ["Arrays, Strings & Linked Lists", "OS & DBMS Core Concepts", "Initial Resume Draft"],
    icon: Calendar,
  },
  {
    phase: "Month 2",
    title: "Advanced Problem Solving",
    items: ["Trees, Graphs & Dynamic Programming", "System Design Basics", "ATS Resume Optimization"],
    icon: Target,
  },
  {
    phase: "Month 3",
    title: "Mock Interviews & Refinement",
    items: ["10+ Voice AI Technical Interviews", "HR & Behavioral Drills", "Company Specific Prep"],
    icon: Award,
  },
  {
    phase: "Placement Month",
    title: "Interview Execution & Offer",
    items: ["Live HireScore™ Monitoring", "Final Speed Drills", "Placement Offer Secured"],
    icon: Rocket,
  },
]

export function PlacementTimeline() {
  return (
    <section className="py-20 md:py-28 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Placement Roadmap
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Your 90-Day Placement Preparation Journey
          </h2>
          <p className="mt-3 text-muted-foreground text-base">
            Structured timeline taking you step-by-step to interview readiness.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line on desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border" />

          <div className="space-y-8 md:space-y-12">
            {timelineMilestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0
              const Icon = milestone.icon
              return (
                <div
                  key={idx}
                  className="relative flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 top-6 -translate-x-1/2 z-10 size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <Icon className="size-5" />
                  </div>

                  {/* Left or Right Content Box */}
                  <div
                    className={`w-full md:w-[45%] ${
                      isEven ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"
                    }`}
                  >
                    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
                      <Badge variant="secondary" className="mb-2">
                        {milestone.phase}
                      </Badge>
                      <h3 className="font-heading text-lg font-bold text-foreground mb-3">
                        {milestone.title}
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {milestone.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className={`flex items-center gap-2 ${
                              isEven ? "md:justify-end" : "md:justify-start"
                            }`}
                          >
                            <Check className="size-4 text-primary shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
