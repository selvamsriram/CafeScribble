import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-[var(--font-body)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-shadow)] hover:shadow-lg hover:shadow-[var(--color-shadow-lg)] hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-600 shadow-md shadow-red-500/20 hover:shadow-lg",
        outline:
          "border-2 border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] text-[var(--color-text)]",
        secondary:
          "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] shadow-sm shadow-[var(--color-shadow)] hover:shadow-md",
        ghost: 
          "hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        link: 
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
        accent:
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-md shadow-[var(--color-shadow)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-11 px-5 py-2 rounded-xl",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
