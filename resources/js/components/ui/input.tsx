import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-11 w-full min-w-0 border border-input bg-inverse px-3 py-2 text-base text-foreground shadow-hard-sm transition-[border-color,box-shadow] outline-none selection:bg-warning selection:text-ink file:mr-4 file:inline-flex file:min-h-7 file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-bold file:tracking-[0.05em] file:text-primary-foreground file:uppercase placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper-raised",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
