import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Root page wrapper enforcing standard vertical padding and container alignment */
export function PageContainer({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn("w-full space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in-0 duration-200", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/** Content container with max reading width (68ch) per PRD Part 21 */
export function ContentContainer({ className, children, ...props }: ContainerProps) {
  return (
    <div className={cn("container-reading space-y-4", className)} {...props}>
      {children}
    </div>
  )
}

/** Section container for distinct page sections */
export function SectionContainer({ className, children, ...props }: ContainerProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {children}
    </section>
  )
}

/** Dashboard container layout for grid of cards */
export function DashboardContainer({ className, children, ...props }: ContainerProps) {
  return (
    <div className={cn("grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {children}
    </div>
  )
}
