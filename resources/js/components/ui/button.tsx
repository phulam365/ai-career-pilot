import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border-2 border-ink text-sm font-bold tracking-[0.08em] uppercase shadow-hard-md transition-[background-color,color,box-shadow,transform] outline-none hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-strong",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "bg-paper text-ink hover:bg-ink hover:text-inverse",
        secondary:
          "bg-paper-raised text-secondary-foreground hover:bg-warning hover:text-ink",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-ink hover:bg-warning hover:text-ink",
        link: "min-h-0 border-0 bg-transparent p-0 text-primary shadow-none hover:translate-y-0 hover:text-primary-strong hover:underline active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "px-4 py-2 has-[>svg]:px-3",
        sm: "min-h-9 px-3 text-xs has-[>svg]:px-2.5",
        lg: "min-h-12 px-6 has-[>svg]:px-4",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
