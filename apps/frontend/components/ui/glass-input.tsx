import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ============================================================
   GlassInput — glass-styled <input>, <textarea>, <select>
   Always pair with a visible <GlassLabel /> (a11y).
   For password fields, use type="password" + autoComplete handled by parent.
   ============================================================ */

const glassFieldVariants = cva(
  [
    "block w-full rounded-[var(--r)] text-text placeholder:text-muted",
    "border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)]",
    "backdrop-blur-md",
    "transition-[box-shadow,border-color,background-color] duration-150",
    "focus:border-[color:var(--color-accent)] focus:bg-[color:var(--glass-bg-strong)]",
    "focus:shadow-[0_0_0_3px_var(--color-accent-soft)]",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "aria-[invalid=true]:border-[color:var(--color-danger)]",
    "aria-[invalid=true]:focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-danger)_30%,transparent)]",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-10 px-3 text-[0.9rem]",
        md: "h-12 px-4 text-[0.95rem]",
        lg: "h-14 px-5 text-[1rem]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type FieldSize = NonNullable<VariantProps<typeof glassFieldVariants>["size"]>;

/* ---- Input ---- */

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FieldSize;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, size, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(glassFieldVariants({ size }), className)}
      {...props}
    />
  )
);
GlassInput.displayName = "GlassInput";

/* ---- Textarea ---- */

export interface GlassTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: FieldSize;
}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, size = "md", rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        glassFieldVariants({ size }),
        "h-auto py-3 leading-relaxed resize-y min-h-[6rem]",
        className
      )}
      {...props}
    />
  )
);
GlassTextarea.displayName = "GlassTextarea";

/* ---- Select ---- */

export interface GlassSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: FieldSize;
}

const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, size, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          glassFieldVariants({ size }),
          "appearance-none pr-10 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
);
GlassSelect.displayName = "GlassSelect";

/* ---- Label / helper / error ---- */

const GlassLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[0.8rem] font-medium text-text-soft mb-1.5",
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span aria-hidden className="ml-1 text-[color:var(--color-danger)]">
        *
      </span>
    )}
  </label>
));
GlassLabel.displayName = "GlassLabel";

const GlassFieldHelper = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-1.5 text-[0.78rem] text-muted", className)}
    {...props}
  />
));
GlassFieldHelper.displayName = "GlassFieldHelper";

const GlassFieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  return (
    <p
      ref={ref}
      role="alert"
      aria-live="polite"
      className={cn(
        "mt-1.5 text-[0.78rem] font-medium text-[color:var(--color-danger)]",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});
GlassFieldError.displayName = "GlassFieldError";

/* ---- Field wrapper ---- */

interface GlassFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  helper?: React.ReactNode;
  error?: React.ReactNode;
}

const GlassField = React.forwardRef<HTMLDivElement, GlassFieldProps>(
  (
    { className, label, htmlFor, required, helper, error, children, ...props },
    ref
  ) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {label && (
        <GlassLabel htmlFor={htmlFor} required={required}>
          {label}
        </GlassLabel>
      )}
      {children}
      {error ? (
        <GlassFieldError>{error}</GlassFieldError>
      ) : helper ? (
        <GlassFieldHelper>{helper}</GlassFieldHelper>
      ) : null}
    </div>
  )
);
GlassField.displayName = "GlassField";

export {
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassLabel,
  GlassField,
  GlassFieldHelper,
  GlassFieldError,
  glassFieldVariants,
};
