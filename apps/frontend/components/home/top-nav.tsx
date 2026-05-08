"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#souverainete", label: "Souveraineté" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#deploiement", label: "Déploiement" },
  { href: "#contribuer", label: "Contribuer" },
];

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-canvas/80 backdrop-blur-xl border-b border-line"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="-ml-2 px-2 py-1 rounded-md hover:bg-line/40 transition-colors"
        >
          <Wordmark />
        </Link>

        <nav
          className="hidden md:flex items-center gap-7 text-[0.92rem] font-medium text-ink-2"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="subtle"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a
              href="https://github.com/CodeStar-Project"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub CodeStar Project"
            >
              <Icon name="github" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="solid" size="sm">
            <a href="#deploiement">
              Déployer
              <Icon name="arrow-right" className="text-[0.7rem]" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
