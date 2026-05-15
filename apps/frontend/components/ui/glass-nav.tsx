"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* ============================================================
   GlassNav — sticky top navigation with strengthened glass on scroll.
   - Renders <header role="banner"> with sticky positioning + safe-area top inset.
   - Adds `data-scrolled="true"` once user scrolls past `scrollThreshold` (default 8px)
     so consumers can adapt visual weight via CSS selectors if needed.
   - Children layout fully delegated to caller (logo / nav / actions).
   ============================================================ */

interface GlassNavProps extends React.HTMLAttributes<HTMLElement> {
  scrollThreshold?: number;
  /** When false, stays at static position (no sticky). */
  sticky?: boolean;
}

const GlassNav = React.forwardRef<HTMLElement, GlassNavProps>(
  (
    {
      className,
      scrollThreshold = 8,
      sticky = true,
      children,
      ...props
    },
    ref
  ) => {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
      if (!sticky) return;
      const onScroll = () => {
        setScrolled(window.scrollY > scrollThreshold);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, [sticky, scrollThreshold]);

    return (
      <header
        ref={ref}
        role="banner"
        data-scrolled={scrolled || undefined}
        className={cn(
          "z-50 w-full",
          sticky && "sticky top-0",
          "border-b border-[color:var(--glass-border)]",
          "bg-[color:var(--glass-bg)]",
          "backdrop-blur-[20px] backdrop-saturate-[180%]",
          "supports-[backdrop-filter]:bg-[color:var(--glass-bg)]",
          "transition-[background-color,box-shadow] duration-200",
          "data-[scrolled=true]:bg-[color:var(--glass-bg-strong)]",
          "data-[scrolled=true]:shadow-[0_4px_20px_rgba(31,38,135,0.06)]",
          // Safe area on iOS standalone PWA
          "pt-[env(safe-area-inset-top)]",
          className
        )}
        {...props}
      >
        {children}
      </header>
    );
  }
);
GlassNav.displayName = "GlassNav";

const GlassNavInner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8",
      className
    )}
    {...props}
  />
));
GlassNavInner.displayName = "GlassNavInner";

interface GlassNavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  /** When passed, render as <button>. Use for in-app handlers without href. */
  asButton?: boolean;
}

const GlassNavLink = React.forwardRef<HTMLElement, GlassNavLinkProps>(
  ({ className, active, asButton = false, children, ...props }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-2",
      "text-[0.9rem] font-medium",
      "transition-colors duration-150",
      active
        ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
        : "text-text-soft hover:text-text hover:bg-[color:var(--glass-bg)]",
      className
    );

    if (asButton) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          aria-current={active ? "page" : undefined}
          className={baseClasses}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-current={active ? "page" : undefined}
        className={baseClasses}
        {...props}
      >
        {children}
      </a>
    );
  }
);
GlassNavLink.displayName = "GlassNavLink";

export { GlassNav, GlassNavInner, GlassNavLink };
