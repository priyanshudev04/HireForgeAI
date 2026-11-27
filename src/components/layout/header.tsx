"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, useUser } from "@clerk/nextjs"
import {
  Menu,
  Bell,
  Bot,
  Search,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserAvatar } from "@/components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { navigationConfig } from "@/config/navigation"
import { cn } from "@/lib/utils"

export interface HeaderProps {
  variant?: "app" | "marketing"
  onMenuClick?: () => void
  onOpenCommandPalette?: () => void
  className?: string
}

export function Header({
  variant = "app",
  onMenuClick,
  onOpenCommandPalette,
  className,
}: HeaderProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const displayName = user?.fullName || user?.username || email || "Student"

  // Derive current page title from current route for App Header
  const currentPageTitle = React.useMemo(() => {
    let match = "Dashboard"
    navigationConfig.mainNav.forEach((group) => {
      group.items.forEach((item) => {
        if (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) {
          match = item.title
        }
      })
    })
    navigationConfig.secondaryNav.forEach((group) => {
      group.items.forEach((item) => {
        if (pathname.startsWith(item.href)) match = item.title
      })
    })
    navigationConfig.userNav.forEach((item) => {
      if (pathname.startsWith(item.href)) match = item.title
    })
    return match
  }, [pathname])

  if (variant === "marketing") {
    return (
      <header className={cn("sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md", className)}>
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Zap className="size-4 fill-current" />
            </div>
            <span>HireForge<span className="text-primary">.ai</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/coming-soon" className="hover:text-foreground transition-colors">
              DSA Practice
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
              Sign In
            </Button>
            <Button size="sm" render={<Link href="/sign-up" />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>
    )
  }

  // App Header variant
  return (
    <header className={cn("sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 sm:px-6 backdrop-blur-md", className)}>
      {/* Left section: Mobile menu toggle + page breadcrumb title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-heading text-base font-semibold text-foreground">
            {currentPageTitle}
          </span>
        </div>
      </div>

      {/* Center: Global Search trigger button */}
      <div className="hidden sm:flex flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-muted/40 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/70 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5" />
            <span>Search or jump to...</span>
          </div>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium select-none">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right section: AI Mentor shortcut, Notifications, ThemeToggle, User profile dropdown */}
      <div className="flex items-center gap-2">
        {/* Search button for small mobile screens */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenCommandPalette}
          className="sm:hidden text-muted-foreground"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* AI Mentor trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-primary"
          render={<Link href="/coming-soon" aria-label="Ask AI Mentor" />}
        >
          <Bot className="size-4" />
        </Button>

        {/* Notifications trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground relative"
          render={<Link href="/coming-soon" aria-label="Notifications" />}
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User profile avatar dropdown menu */}
        <DropdownMenu
          trigger={
            <div className="ml-1 cursor-pointer">
              <UserAvatar name={displayName} avatarUrl={user?.imageUrl} size="sm" />
            </div>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              {email ? <p className="text-xs text-muted-foreground">{email}</p> : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile" className="w-full">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="w-full">Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem destructive>
            <SignOutButton redirectUrl="/">
              <button type="button" className="w-full text-left">Sign Out</button>
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  )
}
