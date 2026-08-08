import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground border-border",
        destructive: "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
        success: "border-transparent bg-success/15 text-success dark:bg-success/20",
        warning: "border-transparent bg-warning/15 text-warning dark:bg-warning/20",
        info: "border-transparent bg-info/15 text-info dark:bg-info/20",
        // Difficulty semantic variants (PRD Part 7)
        easy: "border-transparent bg-[oklch(0.68_0.18_145_/0.15)] text-[oklch(0.68_0.18_145)]",
        medium: "border-transparent bg-[oklch(0.80_0.18_75_/0.15)] text-[oklch(0.80_0.18_75)]",
        hard: "border-transparent bg-[oklch(0.65_0.22_15_/0.15)] text-[oklch(0.65_0.22_15)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
