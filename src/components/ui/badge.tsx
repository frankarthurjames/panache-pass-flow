import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1.5 text-[10px] uppercase font-black tracking-widest transition-all shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-black text-white hover:bg-black/90",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600 shadow-md",
        outline: "text-gray-900 border-2 border-gray-200 bg-white",
        success: "bg-emerald-500 text-white border-transparent hover:bg-emerald-600 shadow-md",
        warning: "bg-orange-500 text-white border-transparent hover:bg-orange-600 shadow-md"
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
