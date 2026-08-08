import type { IconComponent } from "@/types/ui"

export interface NavItem {
  title: string
  href: string
  icon: IconComponent
  badge?: string | number
  isExternal?: boolean
  disabled?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export interface NavigationConfig {
  mainNav: NavGroup[]
  secondaryNav: NavGroup[]
  userNav: NavItem[]
}
