import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

/**
 * (marketing) route group layout
 *
 * Wraps all marketing pages: /, /features, /pricing, /contact
 * Uses Marketing Header + Footer shell. Full width, no Sidebar.
 *
 * Per PRD Part 5 & Part 14.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header variant="marketing" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
