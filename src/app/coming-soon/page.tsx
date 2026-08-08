import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-20">
      <section className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <p className="text-sm font-semibold text-primary">HireForge AI</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This feature is coming soon
        </h1>
        <p className="mt-4 text-muted-foreground">
          We are still building this part of HireForge AI. Explore the available features or contact us to learn more.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/" />}>
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <Button variant="outline" render={<Link href="/contact" />}>
            Contact us
          </Button>
        </div>
      </section>
    </main>
  )
}
