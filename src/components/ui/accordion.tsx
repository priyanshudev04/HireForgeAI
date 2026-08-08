"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AccordionItemProps {
  value: string
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
  className,
}: AccordionItemProps) {
  return (
    <div className={cn("border-b border-border py-3 transition-colors", className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-2 text-left font-heading text-base font-semibold text-foreground transition-all hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      {isOpen && (
        <div className="pt-2 pb-3 text-sm text-muted-foreground leading-relaxed animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export interface AccordionProps {
  items: Array<{ value: string; title: string; content: React.ReactNode }>
  defaultValue?: string
  className?: string
}

export function Accordion({ items, defaultValue, className }: AccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(defaultValue || null)

  const handleToggle = (value: string) => {
    setOpenItem((prev) => (prev === value ? null : value))
  }

  return (
    <div className={cn("w-full divide-y divide-border/60", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          title={item.title}
          isOpen={openItem === item.value}
          onToggle={() => handleToggle(item.value)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
