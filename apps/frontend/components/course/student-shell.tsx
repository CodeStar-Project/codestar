import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { MeshBackground } from "@/components/ui/mesh-background";
import { cn } from "@/lib/utils";

interface StudentShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "wide" | "narrow";
}

const MAX: Record<NonNullable<StudentShellProps["maxWidth"]>, string> = {
  narrow: "max-w-4xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

export function StudentShell({
  children,
  className,
  maxWidth = "default",
}: StudentShellProps) {
  return (
    <>
      <MeshBackground />
      <TopNav />
      <main
        id="main"
        className={cn(
          "mx-auto px-6 py-12 md:px-8 md:py-16",
          MAX[maxWidth],
          className
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
