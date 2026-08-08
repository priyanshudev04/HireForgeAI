import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const faqData = [
  {
    value: "item-1",
    title: "What is HireForge AI and who is it for?",
    content:
      "HireForge AI is a unified Career Operating System designed specifically for college students and job seekers preparing for campus and off-campus tech placements (SDE, Frontend, Backend, Fullstack, and Data Engineering roles).",
  },
  {
    value: "item-2",
    title: "How does the HireScore™ readiness score work?",
    content:
      "HireScore™ is a composite score (0-1000) that aggregates your performance across DSA problem accuracy, theory flashcard mastery, ATS resume optimization, and voice AI mock interview evaluations.",
  },
  {
    value: "item-3",
    title: "How realistic are the Voice AI Mock Interviews?",
    content:
      "Our AI mock interview module simulates real technical and HR interview rounds. It listens to your spoken answers, evaluates technical depth, clarity, and pacing, and produces instant transcript analysis with actionable feedback.",
  },
  {
    value: "item-4",
    title: "Is the ATS Resume Builder compatible with recruiters' software?",
    content:
      "Yes! Resumes built on HireForge AI follow clean single-column ATS layouts, standard fonts, and parsable section headers guaranteed to pass ATS scanners used by top tech companies.",
  },
  {
    value: "item-5",
    title: "Can I try HireForge AI for free?",
    content:
      "Absolutely. Our Free plan lets you access 50+ DSA problems, basic theory flashcards, and an initial ATS resume scan with no credit card required.",
  },
  {
    value: "item-6",
    title: "Do you offer institutional plans for universities?",
    content:
      "Yes, we offer Campus & College plans with custom placement cell admin dashboards, cohort analytics, and bulk student onboarding. Contact us via the contact page for institutional inquiries.",
  },
]

export function FaqAccordion() {
  return (
    <section className="py-20 md:py-28 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Got Questions?
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground text-base">
            Everything you need to know about HireForge AI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-border/70 bg-card p-6 md:p-8 shadow-sm">
          <Accordion items={faqData} defaultValue="item-1" />
        </div>
      </div>
    </section>
  )
}
