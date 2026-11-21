import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import type { User } from "@prisma/client"

import { db } from "@/server/db"

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in")
  }
}

/**
 * Returns the HireForge `User` row for the signed-in Clerk user, creating
 * it (with a Profile and the default STUDENT role) on first sight.
 *
 * This is the lazy half of `syncClerkUserToDb()` from the architecture doc:
 * it means a student's data is saved from their very first request even
 * before the Clerk webhook is configured. Throws UnauthorizedError when
 * nobody is signed in.
 */
export async function requireUser(): Promise<User> {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new UnauthorizedError()

  const existing = await db.user.findUnique({ where: { clerkId } })
  if (existing && !existing.deletedAt) return existing
  if (existing?.deletedAt) throw new UnauthorizedError()

  const clerkUser = await currentUser()
  if (!clerkUser) throw new UnauthorizedError()

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    // Phone-only sign-ups have no email; the column is required and unique.
    `${clerkId}@users.noreply.hireforge.ai`
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email.split("@")[0]

  const studentRole = await db.roleCatalog.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: { name: "STUDENT", description: "Default role for every learner" },
  })

  // upsert on clerkId so two concurrent first requests don't both insert.
  return db.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      profile: { create: { displayName, avatarUrl: clerkUser.imageUrl } },
      roles: { create: { roleId: studentRole.id } },
    },
  })
}

/** Wraps a route handler so a missing session becomes a 401 JSON response. */
export function unauthorized() {
  return Response.json(
    { ok: false, error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } },
    { status: 401 }
  )
}
