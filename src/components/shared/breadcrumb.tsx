import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-muted-foreground", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              <span className="sr-only">Dashboard Home</span>
            </Link>
            {items.length > 0 && <ChevronRight className="size-3 text-muted-foreground/60" />}
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && "font-medium text-foreground")}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3 text-muted-foreground/60" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
