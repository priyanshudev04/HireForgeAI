import Link from "next/link"
import { Zap, Globe, Share2, MessageSquare } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 text-foreground py-12 md:py-16">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4 fill-current" />
              </div>
              <span>HireForge<span className="text-primary">.ai</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your AI-powered Career Operating System. Master DSA, ace mock interviews, build ATS resumes, and track placement readiness — all in one platform.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href="#"
                className="hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                aria-label="Community"
              >
                <MessageSquare className="size-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground font-heading">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-foreground transition-colors">
                  DSA Practice
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground font-heading">
              Career Tools
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/coming-soon" className="hover:text-foreground transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-foreground transition-colors">
                  AI Mock Interview
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-foreground transition-colors">
                  Theory Flashcards
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="hover:text-foreground transition-colors">
                  HireScore Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground font-heading">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-70">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-70">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-70">Security</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} HireForge AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with precision for career success.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
