import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false)

  const sizeClasses = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-11 text-base",
    xl: "size-14 text-lg",
  }

  const getFallbackInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted font-medium items-center justify-center text-muted-foreground ring-1 ring-border",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{fallback || getFallbackInitials(alt)}</span>
      )}
    </div>
  )
}
