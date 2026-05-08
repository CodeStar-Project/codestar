import { cn } from "@/lib/utils";

export interface StarMarkProps {
  size?: number;
  className?: string;
  fill?: string;
}

export function StarMark({
  size = 22,
  className,
  fill = "var(--color-brand)",
}: StarMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M12 1.5L13.71 8.05L20.13 9.83L14.86 13.94L15.27 20.5L12 16.55L8.73 20.5L9.14 13.94L3.87 9.83L10.29 8.05L12 1.5Z"
        fill={fill}
      />
    </svg>
  );
}
