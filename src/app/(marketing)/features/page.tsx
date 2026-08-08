import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { ProductPreview } from "@/components/marketing/product-preview"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Platform Features — HireForge AI",
  description: "Explore all capabilities of HireForge AI: DSA problem sheets, voice AI mock interviews, theory flashcards, ATS resume scoring, and HireScore™ analytics.",
}

export default function FeaturesPage() {
  return (
    <div className="py-12 md:py-16 space-y-16">
      <div className="container-app">
        <PageHeader
          title="Platform Capabilities & Features"
          description="Everything you need to master DSA, ace technical interviews, optimize your resume, and track your placement readiness."
          actions={
            <Button size="sm" render={<Link href="/sign-up" />}>
                Try Free <ArrowRight className="ml-1 size-3.5" />
            </Button>
          }
        />
      </div>

      <FeaturesGrid />
      <ProductPreview />
    </div>
  )
}
