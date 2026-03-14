import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[160px] w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-5 py-5 text-base font-semibold ring-offset-white placeholder:text-gray-400 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 focus-visible:bg-orange-50/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm resize-y hover:border-gray-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
