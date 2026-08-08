import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Video, BarChart3, Bot } from "lucide-react"

export function ProductPreview() {
  return (
    <section className="py-16 md:py-24 bg-muted/20 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3">
            Interactive Product Preview
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            All Your Placement Prep in One Unified Workspace
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            No more switching between 5 different platforms. HireForge AI unifies practice, feedback, and tracking.
          </p>
        </div>

        {/* Abstract Product UI Showcase Window */}
        <Card glass className="p-4 sm:p-6 rounded-2xl shadow-2xl border-border/80 max-w-5xl mx-auto">
          {/* Top Browser Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">app.hireforge.ai/dashboard</span>
            </div>
            <Badge variant="success" className="text-[10px]">
              AI Mentor Online
            </Badge>
          </div>

          {/* Product UI Layout Mockup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget 1: HireScore Gauge */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">HireScore™ Readiness</span>
                <BarChart3 className="size-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">842</span>
                <span className="text-xs font-bold text-success">+18 pts this week</span>
              </div>
              <p className="text-xs text-muted-foreground">Top 5% candidate pool for SDE-1 roles.</p>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%]" />
              </div>
            </div>

            {/* Widget 2: DSA Practice Spotlight */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">DSA Target Queue</span>
                <Code2 className="size-4 text-accent" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="font-mono text-foreground">LRU Cache</span>
                  <Badge variant="hard" className="text-[10px]">Hard</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="font-mono text-foreground">Binary Tree Zigzag</span>
                  <Badge variant="medium" className="text-[10px]">Medium</Badge>
                </div>
              </div>
            </div>

            {/* Widget 3: AI Interview Summary */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">AI Mock Interview</span>
                <Video className="size-4 text-purple-400" />
              </div>
              <div className="p-3 rounded bg-primary/10 border border-primary/20 text-xs">
                <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                  <Bot className="size-3.5" />
                  <span>AI Feedback</span>
                </div>
                <p className="text-muted-foreground">
                  &quot;Great explanation of time complexity in Question 2. Work on system design trade-offs.&quot;
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
