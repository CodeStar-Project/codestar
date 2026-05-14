import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-card border-line-strong text-ink-2",
        primary:
          "bg-brand-soft border-transparent text-brand-deep",
        outline:
          "border-line-strong bg-transparent text-foreground/80",
        ghost: "border-transparent text-ink-3",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.68rem]",
        md: "px-2.5 py-1 text-[0.72rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
