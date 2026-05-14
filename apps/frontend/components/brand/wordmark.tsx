import { cn } from "@/lib/utils";

import { StarMark } from "./star-mark";

export interface WordmarkProps {
  className?: string;
  starSize?: number;
}

export function Wordmark({ className, starSize = 20 }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <StarMark size={starSize} />
      <span className="font-bold tracking-tight text-[1.05rem]">
        Code<span className="text-brand">Star</span>
      </span>
    </span>
  );
}
