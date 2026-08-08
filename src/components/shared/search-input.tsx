import * as React from "react"
import { Search, X } from "lucide-react"
import { Input, type InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends InputProps {
  onClear?: () => void
  shortcutKey?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, shortcutKey = "K", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={cn("pl-9 pr-12", className)}
          {...props}
        />
        <div className="absolute right-3 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-sm focus:outline-none"
            >
              <X className="size-3.5" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
          {shortcutKey && !value && (
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none">
              <span className="text-[9px]">⌘</span>{shortcutKey}
            </kbd>
          )}
        </div>
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
