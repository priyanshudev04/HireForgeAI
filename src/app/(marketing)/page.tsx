import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { HeroSection } from "@/components/marketing/hero-section"
import { ProductPreview } from "@/components/marketing/product-preview"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { PlacementTimeline } from "@/components/marketing/placement-timeline"
import { PricingTable } from "@/components/marketing/pricing-table"
import { FaqAccordion } from "@/components/marketing/faq-accordion"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "HireForge AI — AI-Powered Career Operating System",
  description: "Prepare for placements with DSA sheets, theory flashcards, ATS resume scoring, voice AI mock interviews, and HireScore™ readiness analytics.",
}

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Product Preview UI Showcase */}
      <ProductPreview />

      {/* 3. Features Grid */}
      <FeaturesGrid />

      {/* 4. How It Works Workflow */}
      <HowItWorks />

      {/* 5. Placement Preparation Timeline */}
      <PlacementTimeline />

      {/* 6. Pricing Plans */}
      <PricingTable />

      {/* 7. Frequently Asked Questions */}
      <FaqAccordion />

      {/* 8. Bottom CTA Banner */}
      <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background border-t border-border/40 text-center">
        <div className="container-app max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6">
            <Sparkles className="size-3.5" />
            <span>Ready to Land Your Offer?</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Start Your Placement Preparation Today
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Join thousands of candidates preparing for tier-1 tech placements with HireForge AI.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-xl shadow-primary/20"
              render={<Link href="/sign-up" />}
            >
              Get Started Free
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
