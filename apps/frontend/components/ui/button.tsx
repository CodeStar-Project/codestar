import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        // Primary CTA: brand orange, used sparingly
        primary:
          "bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_rgba(242,128,34,0.55)] hover:shadow-[0_18px_40px_-10px_rgba(242,128,34,0.6)] hover:-translate-y-0.5",
        // Solid neutral on dark ink
        solid:
          "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        // Outlined neutral, hovers to inverted
        outline:
          "bg-card text-foreground border border-line-strong hover:bg-foreground hover:text-background hover:border-foreground",
        // Subtle (pill chip / nav)
        subtle:
          "bg-card text-foreground/80 border border-line-strong hover:text-foreground hover:border-foreground",
        // Ghost (no surface)
        ghost: "text-foreground/70 hover:text-foreground hover:bg-muted",
        // Link
        link: "text-primary underline-offset-4 hover:underline rounded-none",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.85rem]",
        md: "h-11 px-5 text-[0.92rem]",
        lg: "h-14 px-7 text-[0.98rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
