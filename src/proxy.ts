import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

/**
 * Everything a student does after signing in lives behind Clerk.
 * Marketing pages, /sign-in, /sign-up and /coming-soon stay public.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/pricing",
  "/contact",
  "/coming-soon",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
