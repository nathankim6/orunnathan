import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_0_0_rgba(0,0,0,0.3)_inset,0_4px_12px_-2px_rgba(0,0,0,0.3)] hover:from-slate-700 hover:to-slate-800 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_-1px_0_0_rgba(0,0,0,0.3)_inset,0_6px_16px_-2px_rgba(0,0,0,0.35)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)_inset] active:translate-y-px",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_4px_12px_-2px_rgba(239,68,68,0.4)] hover:from-red-400 hover:to-red-500 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_6px_16px_-2px_rgba(239,68,68,0.5)] active:translate-y-px",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow active:bg-slate-100 active:translate-y-px",
        secondary:
          "bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset,0_-1px_0_0_rgba(0,0,0,0.05)_inset,0_2px_8px_-2px_rgba(0,0,0,0.1)] hover:from-slate-50 hover:to-slate-150 hover:text-slate-900 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_-1px_0_0_rgba(0,0,0,0.05)_inset,0_4px_12px_-2px_rgba(0,0,0,0.12)] active:translate-y-px",
        ghost: 
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
        link: 
          "text-slate-700 underline-offset-4 hover:underline hover:text-slate-900 p-0 h-auto",
        premium: 
          "bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_4px_16px_-2px_rgba(99,102,241,0.5)] hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_6px_20px_-2px_rgba(99,102,241,0.6)] active:translate-y-px relative overflow-hidden",
        neon: 
          "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_-2px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-2px_rgba(6,182,212,0.7)] hover:from-cyan-400 hover:to-blue-400 active:translate-y-px",
        glass: 
          "bg-white/70 backdrop-blur-xl border border-slate-200/80 text-slate-700 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:bg-white/90 hover:border-slate-300 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] active:translate-y-px",
        success:
          "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_4px_12px_-2px_rgba(16,185,129,0.4)] hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_6px_16px_-2px_rgba(16,185,129,0.5)] active:translate-y-px",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
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
