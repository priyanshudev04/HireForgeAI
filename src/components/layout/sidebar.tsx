"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react"

import { navigationConfig } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function Sidebar({
  collapsed = false,
  onCollapseChange,
  mobileOpen = false,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname()

  const navContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed

    return (
      <div className="flex h-full flex-col justify-between py-4 select-none">
        {/* Brand / Logo Header */}
        <div className="px-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md font-bold tracking-tight">
              <Zap className="size-5 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold tracking-tight text-sidebar-foreground">
                  HireForge<span className="text-primary">.ai</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  Career OS
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation items scroll area */}
        <div className="flex-1 overflow-y-auto space-y-6 px-3">
          {/* Main Navigation Groups */}
          {navigationConfig.mainNav.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.label && (
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))

                  const linkEl = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && onMobileOpenChange?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive && "text-current")} />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} content={item.title} side="right">
                        {linkEl}
                      </Tooltip>
                    )
                  }

                  return linkEl
                })}
              </div>
            </div>
          ))}

          {/* Secondary Navigation (Personal Queue) */}
          {navigationConfig.secondaryNav.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1 pt-2 border-t border-sidebar-border">
              {!isCollapsed && group.label && (
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)

                  const linkEl = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && onMobileOpenChange?.(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} content={item.title} side="right">
                        {linkEl}
                      </Tooltip>
                    )
                  }

                  return linkEl
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User / Settings Nav + Streak Widget */}
        <div className="px-3 pt-4 space-y-3 border-t border-sidebar-border">
          {/* Streak indicator badge (PRD Part 4 Dashboard spec) */}
          {!isCollapsed && (
            <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 px-3 py-2 text-xs font-medium text-sidebar-foreground border border-sidebar-border/50">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-orange-500 fill-orange-500/20 animate-pulse" />
                <span>Daily Streak</span>
              </div>
              <span className="font-bold text-orange-500">7 Days</span>
            </div>
          )}

          <div className="space-y-0.5">
            {navigationConfig.userNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              const linkEl = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && onMobileOpenChange?.(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href} content={item.title} side="right">
                    {linkEl}
                  </Tooltip>
                )
              }

              return linkEl
            })}
          </div>

          {/* Desktop Collapse toggle button */}
          {!isMobile && onCollapseChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapseChange(!collapsed)}
              className="w-full justify-between px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              {!collapsed && <span>Collapse Sidebar</span>}
              {collapsed ? (
                <ChevronRight className="size-4 mx-auto" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shrink-0 sticky top-0 z-20",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {onMobileOpenChange && (
        <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange} side="left">
          {navContent(true)}
        </Sheet>
      )}
    </>
  )
}
