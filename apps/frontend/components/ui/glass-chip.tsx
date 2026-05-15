import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassChipVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full font-medium",
    "border border-[color:var(--glass-border)] backdrop-blur-md",
    "transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--glass-bg)] text-text-soft hover:text-text",
        accent:
          "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] border-[color:color-mix(in_oklab,var(--color-accent)_25%,transparent)]",
        success:
          "bg-[color:color-mix(in_oklab,var(--color-success)_18%,transparent)] text-[color:color-mix(in_oklab,var(--color-success)_75%,#0d3a2e)] border-[color:color-mix(in_oklab,var(--color-success)_30%,transparent)]",
        warning:
          "bg-[color:color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[color:color-mix(in_oklab,var(--color-warning)_75%,#5a3300)] border-[color:color-mix(in_oklab,var(--color-warning)_30%,transparent)]",
        danger:
          "bg-[color:color-mix(in_oklab,var(--color-danger)_18%,transparent)] text-[color:color-mix(in_oklab,var(--color-danger)_75%,#4a0010)] border-[color:color-mix(in_oklab,var(--color-danger)_30%,transparent)]",
        outline:
          "bg-transparent text-text-soft border-[color:var(--glass-border)]",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[0.7rem]",
        md: "px-3 py-1 text-[0.78rem]",
        lg: "px-3.5 py-1.5 text-[0.85rem]",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-transform",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

export interface GlassChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "size">,
    VariantProps<typeof glassChipVariants> {
  asButton?: boolean;
}

const GlassChip = React.forwardRef<HTMLElement, GlassChipProps>(
  (
    { className, variant, size, interactive, asButton = false, ...props },
    ref
  ) => {
    if (asButton) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={cn(
            glassChipVariants({
              variant,
              size,
              interactive: interactive ?? true,
            }),
            className
          )}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      );
    }
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(
          glassChipVariants({ variant, size, interactive }),
          className
        )}
        {...props}
      />
    );
  }
);
GlassChip.displayName = "GlassChip";

export { GlassChip, glassChipVariants };
