"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Command, ArrowRight } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { navigationConfig } from "@/config/navigation"

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  // Global Cmd+K keyboard listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  // Flatten all navigation items for search
  const allItems = React.useMemo(() => {
    const items: Array<{ title: string; href: string; category: string; icon: React.ComponentType<{ className?: string }> }> = []
    navigationConfig.mainNav.forEach((group) => {
      group.items.forEach((item) => {
        items.push({
          title: item.title,
          href: item.href,
          category: group.label || "Navigation",
          icon: item.icon,
        })
      })
    })
    navigationConfig.secondaryNav.forEach((group) => {
      group.items.forEach((item) => {
        items.push({
          title: item.title,
          href: item.href,
          category: group.label || "Personal",
          icon: item.icon,
        })
      })
    })
    navigationConfig.userNav.forEach((item) => {
      items.push({
        title: item.title,
        href: item.href,
        category: "Account",
        icon: item.icon,
      })
    })
    return items
  }, [])

  const filteredItems = React.useMemo(() => {
    if (!query) return allItems
    const q = query.toLowerCase()
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    )
  }, [allItems, query])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div
        role="dialog"
        aria-label="Command Palette"
        className="relative z-50 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95"
      >
        {/* Search header */}
        <div className="flex items-center border-b border-border px-3.5 py-3">
          <Search className="size-4 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search platform..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No matching commands or pages found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium leading-none">{item.title}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3.5 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Command className="size-3" />
            <span>Command Palette</span>
          </div>
          <span>Use ↑↓ to navigate, Enter to select</span>
        </div>
      </div>
    </Dialog>
  )
}
