import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "left" | "right"
  children: React.ReactNode
  className?: string
}

export function Sheet({
  open,
  onOpenChange,
  side = "left",
  children,
  className,
}: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  const sideClasses = {
    left: "left-0 top-0 bottom-0 h-full w-3/4 max-w-sm border-r animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 bottom-0 h-full w-3/4 max-w-sm border-l animate-in slide-in-from-right duration-300",
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 bg-sidebar p-6 text-sidebar-foreground shadow-xl transition ease-in-out border-border",
          sideClasses[side],
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}
