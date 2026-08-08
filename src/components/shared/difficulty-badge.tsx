import { Badge } from "@/components/ui/badge"
import type { Difficulty } from "@/types/ui"

export interface DifficultyBadgeProps {
  difficulty: Difficulty | string
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const norm = difficulty.toLowerCase() as Difficulty
  const variantMap: Record<Difficulty, "easy" | "medium" | "hard"> = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  }

  const labelMap: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  }

  const variant = variantMap[norm] || "outline"
  const label = labelMap[norm] || difficulty

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
