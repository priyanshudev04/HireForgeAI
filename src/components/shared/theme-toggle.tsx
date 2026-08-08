"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      }
    >
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="size-4 mr-2 text-muted-foreground" />
        <span>Light</span>
        {theme === "light" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Moon className="size-4 mr-2 text-muted-foreground" />
        <span>Dark (Default)</span>
        {theme === "dark" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <Laptop className="size-4 mr-2 text-muted-foreground" />
        <span>System</span>
        {theme === "system" && <span className="ml-auto text-xs text-primary">✓</span>}
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
