"use client"

import * as React from "react"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * AppProviders — root provider tree.
 *
 * Order matters:
 * 1. ThemeProvider  — outermost, sets the .dark / .light class on <html>
 * 2. QueryProvider  — TanStack Query singleton client
 * 3. Toaster        — Sonner toast host, z-index: var(--z-toast) = 60 (PRD Part 21)
 *
 * Per PRD Part 19: "Reusable providers … live once at the root and wrap
 * the whole app — never re-instantiated per page."
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}

        {/*
         * Sonner Toaster — PRD Part 6 Toast component.
         * Variants: success (auto-dismiss), error (manual-dismiss).
         * richColors maps to the PRD semantic colour tokens.
         * position: bottom-right per common SaaS pattern.
         */}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            classNames: {
              toast: "font-sans text-sm",
              error: "!duration-[999999ms]", // manual-dismiss for errors (PRD Part 6)
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  )
}
