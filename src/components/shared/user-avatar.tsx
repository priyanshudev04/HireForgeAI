import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserAvatarProps {
  name: string
  email?: string
  avatarUrl?: string | null
  subtext?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  subtext,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar src={avatarUrl} alt={name} size={size} />
      <div className="flex flex-col overflow-hidden text-left">
        <span className="truncate text-sm font-medium leading-none text-foreground">
          {name}
        </span>
        {(email || subtext) && (
          <span className="mt-1 truncate text-xs text-muted-foreground">
            {subtext || email}
          </span>
        )}
      </div>
    </div>
  )
}
