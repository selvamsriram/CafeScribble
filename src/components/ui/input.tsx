import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "px-4 py-2 text-base text-[var(--color-text)]",
          "placeholder:text-[var(--color-text-muted)]",
          "shadow-sm shadow-[var(--color-shadow)]",
          "transition-all duration-200",
          "hover:border-[var(--color-primary)]/50",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
