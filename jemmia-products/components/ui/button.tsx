import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-none text-sm font-medium transition-all duration-200 outline-none select-none disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        filled: 
          "bg-primary-900 text-white hover:bg-primary-800 disabled:bg-primary-100 disabled:text-primary-300 shadow-sm",
        outline:
          "border border-primary-800 text-black hover:bg-primary-900 hover:border-transparent hover:text-white disabled:border-primary-100 disabled:bg-primary-100 disabled:text-primary-400",
        borderless:
          "text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-300",
        // Keep compatibility with shadcn defaults if needed
        default: "bg-primary-900 text-white hover:bg-primary-800",
        secondary: "bg-secondary-900 text-white hover:bg-secondary-800",
        ghost: "hover:bg-primary-50 text-primary-900",
        destructive: "bg-critical text-white hover:bg-critical/90",
      },
      size: {
        sm: "px-2 py-1 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2.5",
        icon: "size-9 rounded-none",
        "icon-sm": "size-7 rounded-none p-1",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
