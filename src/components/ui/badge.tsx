
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-br from-primary to-primary/90 text-primary-foreground hover:shadow-md hover:shadow-primary/30 hover:scale-105",
        secondary:
          "border-transparent bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:shadow-md hover:scale-105",
        destructive:
          "border-transparent bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground hover:shadow-md hover:shadow-destructive/30 hover:scale-105",
        outline: "text-foreground border-border/60 bg-background/80 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/40 hover:shadow-md",
        premium: "border-transparent bg-gradient-to-r from-accent via-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-accent/40 hover:scale-105 animate-gradient-x",
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
