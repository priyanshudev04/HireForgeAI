import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Free Candidate",
    price: "$0",
    period: "forever",
    description: "Essential tools to start your placement preparation journey.",
    features: [
      "Access to 50+ Core DSA Problems",
      "Basic Theory Flashcards (OS & DBMS)",
      "1 ATS Resume Scan / month",
      "Standard Community Access",
      "HireScore™ Basic Tracker",
    ],
    highlighted: false,
    cta: "Get Started Free",
    href: "/sign-up",
  },
  {
    name: "Pro Placement Pass",
    price: "$19",
    period: "per month",
    description: "Unrestricted access to all AI features, interviews, and company archives.",
    features: [
      "Unlimited DSA Problems (Striver & Blind 75)",
      "Full Theory & System Design Flashcards",
      "Unlimited ATS Resume Reviews & Scans",
      "5 Voice AI Mock Interviews / month",
      "Detailed HireScore™ Performance Breakdown",
      "Company-Specific Question Archives",
      "Priority AI Mentor Responses",
    ],
    highlighted: true,
    badge: "Most Popular",
    cta: "Start 7-Day Free Trial",
    href: "/sign-up",
  },
  {
    name: "Campus & College",
    price: "Custom",
    period: "institutional plan",
    description: "Designed for universities and placement cells tracking cohort readiness.",
    features: [
      "Everything in Pro Plan for all students",
      "Placement Cell Admin Dashboard",
      "Cohort HireScore™ Analytics",
      "Custom Mock Interview Blueprints",
      "Dedicated Institution Support",
      "SSO & Bulk Student Onboarding",
    ],
    highlighted: false,
    cta: "Contact Sales",
    href: "/contact",
  },
]

export function PricingTable() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/10 border-b border-border/40">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3">
            Simple Pricing
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Invest in Your Placement Success
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Transparent plans with no hidden fees. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              glass={plan.highlighted}
              className={`relative flex flex-col justify-between p-6 transition-all duration-200 ${
                plan.highlighted
                  ? "border-2 border-primary shadow-xl shadow-primary/10 -translate-y-2"
                  : "border-border/70"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                    <Zap className="size-3 mr-1 fill-current" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold font-heading">{plan.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground font-heading">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      /{plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-3 mb-8">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Included Features
                  </div>
                  <ul className="space-y-2.5 text-sm text-foreground">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <CardFooter className="p-0">
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full h-11"
                  render={<Link href={plan.href} />}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
