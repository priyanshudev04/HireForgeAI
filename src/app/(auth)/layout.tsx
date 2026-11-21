/**
 * (auth) route group layout
 *
 * Wraps: /sign-in, /sign-up (Clerk-hosted components, catch-all routes so
 * Clerk can run its multi-step flows such as OTP and SSO callbacks).
 *
 * Centered single-column layout with a subtle branded background
 * (PRD Part 5 Authentication spec). No Sidebar, no marketing Footer.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_28%)] px-4 py-10">
      {children}
    </main>
  )
}
