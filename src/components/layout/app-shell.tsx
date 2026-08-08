"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/shared/command-palette"

export interface AppShellProps {
  children: React.ReactNode
}

/**
 * AppShell — master application container shell.
 *
 * Combines:
 * - Responsive Sidebar (desktop collapsible + mobile drawer)
 * - Header (with breadcrumbs, global search, notifications, theme toggle, profile menu)
 * - Main content area
 * - CommandPalette (Cmd+K)
 *
 * Per PRD Part 6 & Part 19: "(dashboard) layout.tsx is the single source
 * of the Sidebar+Header shell — no page reimplements its own shell."
 */
export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          variant="app"
          onMenuClick={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  )
}
