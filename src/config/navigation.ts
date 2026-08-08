import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Map,
  FileText,
  FolderGit2,
  Video,
  Bot,
  BarChart3,
  Building2,
  Users,
  Bookmark,
  Repeat,
  Bell,
  User,
  Settings,
  Trophy,
} from "lucide-react"

import type { NavigationConfig } from "@/types/navigation"

/**
 * Configuration-driven Navigation Tree
 * Sourced directly from Frozen Frontend PRD Part 4 & Part 6.
 * Do NOT invent routes outside of this tree.
 */
export const navigationConfig: NavigationConfig = {
  mainNav: [
    {
      label: "Core Platform",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "DSA Practice",
          href: "/dsa",
          icon: Code2,
        },
        {
          title: "Theory & Concepts",
          href: "/theory",
          icon: BookOpen,
        },
        {
          title: "Learning Roadmap",
          href: "/roadmap",
          icon: Map,
        },
      ],
    },
    {
      label: "Career Tools",
      items: [
        {
          title: "Resume Builder",
          href: "/resume",
          icon: FileText,
        },
        {
          title: "AI Projects",
          href: "/projects",
          icon: FolderGit2,
        },
        {
          title: "Mock Interview",
          href: "/interview",
          icon: Video,
        },
        {
          title: "AI Mentor",
          href: "/mentor",
          icon: Bot,
        },
      ],
    },
    {
      label: "Insights & Market",
      items: [
        {
          title: "Analytics & HireScore",
          href: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Company Mode",
          href: "/companies",
          icon: Building2,
        },
        {
          title: "Contest Tracker",
          href: "/contests",
          icon: Trophy,
        },
        {
          title: "Community",
          href: "/community",
          icon: Users,
        },
      ],
    },
  ],
  secondaryNav: [
    {
      label: "Personal Queue",
      items: [
        {
          title: "Revision Queue",
          href: "/revision",
          icon: Repeat,
        },
        {
          title: "Bookmarks",
          href: "/bookmarks",
          icon: Bookmark,
        },
        {
          title: "Notifications",
          href: "/notifications",
          icon: Bell,
        },
      ],
    },
  ],
  userNav: [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
}
