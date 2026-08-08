import type { Metadata } from "next"
import { ContactForm } from "@/components/marketing/contact-form"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = {
  title: "Contact Us — HireForge AI",
  description: "Get in touch with the HireForge AI team for support, feedback, or campus partnership inquiries.",
}

export default function ContactPage() {
  return (
    <div className="py-12 md:py-16 space-y-12">
      <div className="container-app text-center">
        <PageHeader
          title="Contact & Support"
          description="Have questions about HireForge AI or interested in campus partnerships? We'd love to hear from you."
          className="text-center justify-center border-none pb-0"
        />
      </div>

      <div className="container-app">
        <ContactForm />
      </div>
    </div>
  )
}
