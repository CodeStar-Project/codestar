import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none",
    "transition-[transform,box-shadow,background-color,color] duration-200 ease-out",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
          "border border-[color:var(--color-accent)]",
          "shadow-[0_8px_28px_-6px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]",
          "hover:shadow-[0_14px_36px_-8px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        glass: [
          "glass text-text",
          "hover:bg-[color:var(--glass-bg-strong)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        outline: [
          "bg-transparent text-text",
          "border border-[color:var(--glass-border)]",
          "hover:bg-[color:var(--glass-bg)] hover:backdrop-blur-md",
        ].join(" "),
        ghost: [
          "bg-transparent text-text-soft",
          "hover:text-text hover:bg-[color:var(--glass-bg)]",
        ].join(" "),
        danger: [
          "bg-[color:var(--color-danger)] text-white",
          "border border-[color:var(--color-danger)]",
          "hover:-translate-y-0.5",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-[0.85rem]",
        md: "h-11 px-5 text-[0.92rem]",
        lg: "h-14 px-7 text-[1rem]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 1-9 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(glassButtonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
