import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { MeshBackground } from "@/components/ui/mesh-background";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  return (
    <>
      <MeshBackground />
      <TopNav />
      <main
        id="main"
        className={cn(
          "mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16",
          className
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

interface AdminBreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[0.85rem] text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? (
              <Link
                href={it.href}
                className="rounded px-1 text-text-soft hover:text-text"
              >
                {it.label}
              </Link>
            ) : (
              <span className="text-text">{it.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
