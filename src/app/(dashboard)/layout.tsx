import { AppShell } from "@/components/layout/app-shell"

/**
 * (dashboard) route group layout
 *
 * Wraps all authenticated app routes with the unified AppShell:
 * /dashboard, /dsa/*, /theory/*, /roadmap, /resume/*, /projects/*,
 * /interview/*, /mentor/*, /analytics/*, /companies/*, /contests,
 * /community/*, /bookmarks, /revision, /notifications, /profile,
 * /settings/*
 *
 * Per PRD Part 6 & Part 19: single source of the Sidebar+Header shell.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
