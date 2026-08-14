import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"

    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-12 px-6 py-2", // Taller (48px)
        sm: "h-9 rounded-full px-3",
        lg: "h-14 rounded-full px-8 text-base",
        icon: "h-10 w-10",
    }

    const variantStyles = variants[variant] || variants.default
    const sizeStyles = sizes[size] || sizes.default

    return (
        <button
            className={cn(baseStyles, variantStyles, sizeStyles, className)}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
