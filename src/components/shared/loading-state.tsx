import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  variant?: "spinner" | "skeleton"
  label?: string
  count?: number
  className?: string
}

export function LoadingState({
  variant = "spinner",
  label = "Loading content...",
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4 w-full", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton variant="circular" className="size-10 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-muted-foreground",
        className
      )}
    >
      <Spinner size="lg" />
      {label && <p className="mt-3 text-sm font-medium">{label}</p>}
    </div>
  )
}
