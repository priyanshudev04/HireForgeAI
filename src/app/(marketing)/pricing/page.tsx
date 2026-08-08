import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PricingTable } from "@/components/marketing/pricing-table"
import { FaqAccordion } from "@/components/marketing/faq-accordion"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing Plans — HireForge AI",
  description: "Flexible, transparent pricing plans for individual job seekers and campus placement cells.",
}

export default function PricingPage() {
  return (
    <div className="py-12 md:py-16 space-y-16">
      <div className="container-app">
        <PageHeader
          title="Pricing Plans & Packages"
          description="Simple, transparent pricing. Choose the plan that fits your preparation timeline."
          actions={
            <Button size="sm" render={<Link href="/sign-up" />}>
                Start Free Trial <ArrowRight className="ml-1 size-3.5" />
            </Button>
          }
        />
      </div>

      <PricingTable />
      <FaqAccordion />
    </div>
  )
}
