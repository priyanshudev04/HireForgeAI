import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text" | "card"
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md bg-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-3/4 rounded",
        variant === "card" && "h-32 w-full rounded-xl",
        className
      )}
      {...props}
    />
  )
}
