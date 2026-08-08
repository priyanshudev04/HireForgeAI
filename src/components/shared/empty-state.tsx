import * as React from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IconComponent } from "@/types/ui"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: IconComponent
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center animate-in fade-in-0 duration-300",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
        <Icon className="size-6" />
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
      {actionLabel && (onAction || actionHref) && (
        <div className="mt-4">
          {actionHref ? (
            <Button size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
