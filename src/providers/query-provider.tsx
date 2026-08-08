"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * PRD Part 20 — Caching Strategy:
         * Frontend cache freshness mirrors backend cache freshness.
         * staleTime: 60s as a sensible default — individual hooks can
         * override this to match their specific backend TTL.
         */
        staleTime: 60 * 1000,

        /**
         * PRD Part 12 — Error States:
         * Every Server State fetch has a defined retry affordance.
         * Silent infinite-retry loops are explicitly disallowed.
         */
        retry: 1,

        /**
         * PRD Part 20 — Error Recovery:
         * Failures are always visible and actionable.
         * throwOnError: false so the Query Error state (not a thrown error)
         * is used, which maps cleanly to per-card/per-section error UI.
         */
        throwOnError: false,
      },
      mutations: {
        /**
         * PRD Part 20 — Streaming / Optimistic Updates:
         * Mutations do NOT retry silently — important for integrity-critical
         * actions (Resume save, Interview submit, Submission creation).
         */
        retry: false,
      },
    },
  })
}

/**
 * Singleton pattern for the browser. A new QueryClient is created per
 * request on the server to avoid cross-request data leaking.
 * Per TanStack Query's official Next.js App Router recommendation.
 */
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient()
  }

  // Browser: reuse the singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
