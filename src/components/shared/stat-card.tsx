import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { IconComponent } from "@/types/ui"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: IconComponent
  trend?: {
    value: number
    label?: string
    isPositive?: boolean
  }
  progress?: number
  glass?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  glass = true,
  className,
}: StatCardProps) {
  return (
    <Card glass={glass} className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                trend.isPositive === true
                  ? "text-success"
                  : trend.isPositive === false
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trend.isPositive === true && <TrendingUp className="size-3.5" />}
              {trend.isPositive === false && <TrendingDown className="size-3.5" />}
              {trend.isPositive === undefined && <Minus className="size-3.5" />}
              <span>{trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}</span>
            </div>
          )}
        </div>

        {(description || trend?.label) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description || trend?.label}
          </p>
        )}

        {typeof progress === "number" && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
