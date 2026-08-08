import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
