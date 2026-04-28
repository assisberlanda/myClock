import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-action-primary text-text-on-brand hover:bg-action-primary-hover",
        secondary:
          "border-transparent bg-surface-subtle text-text-primary hover:bg-surface-subtle/80",
        outline: "text-text-primary border-border-default",
        success:
          "border-transparent bg-status-success text-text-on-dark hover:bg-status-success/80",
        warning:
          "border-transparent bg-status-warning text-text-primary hover:bg-status-warning/80",
        error:
          "border-transparent bg-status-error text-text-on-dark hover:bg-status-error/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
