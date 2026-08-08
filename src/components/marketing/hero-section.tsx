import Link from "next/link"
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 border-b border-border/40">
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container-app relative z-10 text-center">
        {/* Badge header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <Sparkles className="size-3.5" />
          <span>AI Career Operating System v2.0</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Master Placement Prep with Your Personal{" "}
          <span className="bg-gradient-to-r from-primary via-cyan-400 to-accent bg-clip-text text-transparent">
            AI Career OS
          </span>
        </h1>

        {/* Subhead Description */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From DSA problem solving and theory flashcards to AI mock interviews and ATS resume optimization. Everything you need to get hired at top tech companies.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20"
            render={<Link href="/sign-up" />}
          >
            Start Free Trial
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base"
            render={<Link href="/features" />}
          >
            Explore Features
          </Button>
        </div>

        {/* Key USPs list */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-success" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            <span>ATS Resume Optimizer Included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-accent" />
            <span>Real-time AI Interview Feedback</span>
          </div>
        </div>
      </div>
    </section>
  )
}
