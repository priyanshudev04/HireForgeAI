/**
 * (auth) route group layout
 *
 * Wraps: /sign-in, /sign-up, /forgot-password, /verify-email
 *
 * Auth pages use a centered single-column layout with a subtle
 * branded background (PRD Part 5 Authentication spec).
 * No Sidebar, no marketing Footer.
 *
 * Phase 3 will implement the actual auth shell/background.
 * This layout stub preserves the route group structure now.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
