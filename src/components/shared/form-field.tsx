import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  htmlFor?: string
}

export function FormField({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-0">
          {error}
        </p>
      )}
    </div>
  )
}
