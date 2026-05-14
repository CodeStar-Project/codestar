"use client";

import { useState } from "react";

import { SectionLabel } from "@/components/brand/section-label";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { revealDelay } from "@/lib/reveal";

interface Command {
  label: string;
  cmd: string;
}

const COMMANDS: Command[] = [
  {
    label: "Cloner le dépôt",
    cmd: "git clone https://github.com/CodeStar-Project/codestar.git",
  },
  {
    label: "Configurer",
    cmd: "cp .env.example .env && nano .env",
  },
  {
    label: "Lancer",
    cmd: "docker compose up -d",
  },
];

function CommandLine({
  index,
  command,
  copied,
  onCopy,
}: {
  index: number;
  command: Command;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/40">
        <span className="font-mono text-brand">0{index + 1}</span>
        <span>{command.label}</span>
      </div>
      <div className="mt-2 flex items-center gap-3 bg-black/30 rounded-xl border border-white/5 p-3 lg:p-4">
        <span className="font-mono text-brand shrink-0">$</span>
        <code className="flex-1 font-mono text-[0.84rem] lg:text-[0.92rem] text-code-fg truncate">
          {command.cmd}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[0.78rem] font-medium border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
          aria-label={`Copier la commande ${index + 1} : ${command.cmd}`}
        >
          {copied ? (
            <>
              <Icon name="check" className="text-emerald-400 text-[0.7rem]" />
              Copié
            </>
          ) : (
            <>
              <Icon name="copy" className="text-[0.78rem]" />
              Copier
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Terminal() {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (i: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable — silent */
    }
  };

  return (
    <div className="bg-code-bg rounded-3xl overflow-hidden shadow-[0_18px_60px_-20px_rgba(0,0,0,0.4)] border border-white/5">
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
        </div>
        <div className="flex-1 mx-2 sm:mx-4 text-center">
          <span className="font-mono text-[0.72rem] text-white/40">
            ~ / codestar
          </span>
        </div>
        <span className="font-mono text-[0.7rem] text-white/40">zsh</span>
      </div>

      <div className="p-6 lg:p-8 space-y-5">
        {COMMANDS.map((c, i) => (
          <CommandLine
            key={i}
            index={i}
            command={c}
            copied={copied === i}
            onCopy={() => copy(i, c.cmd)}
          />
        ))}

        <div className="pt-3 mt-3 border-t border-white/5 flex items-center gap-2 font-mono text-[0.85rem] text-emerald-400">
          <Icon name="circle-check" className="text-[0.86rem]" />
          <span>codestar running on http://localhost:3000</span>
          <span className="cursor-blink bg-emerald-400 h-4 w-[6px]" />
        </div>
      </div>
    </div>
  );
}

export function Deployment() {
  return (
    <section
      id="deploiement"
      className="relative py-24 lg:py-32 overflow-hidden scroll-mt-24"
    >
      <div
        className="absolute inset-0 bg-dots opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-y-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <SectionLabel index="05" label="Déploiement" />
            </div>
            <h2
              className="font-display mt-8 text-[clamp(2rem,5vw,3.8rem)]"
              data-reveal
              style={revealDelay(60)}
            >
              5 minutes,
              <br />
              trois commandes.
            </h2>
            <p
              className="mt-6 text-ink-2 text-[1.02rem] leading-relaxed"
              data-reveal
              style={revealDelay(120)}
            >
              Si vous savez utiliser Docker, vous savez installer CodeStar.
              Aucune dépendance externe, aucun compte à créer ailleurs.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              data-reveal
              style={revealDelay(180)}
            >
              <Button asChild variant="solid" size="md">
                <a href="#">
                  <Icon name="book" />
                  Lire la documentation
                </a>
              </Button>
              <Button asChild variant="outline" size="md">
                <a
                  href="https://github.com/CodeStar-Project"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" />
                  Sources
                </a>
              </Button>
            </div>

            <div
              className="mt-8 flex items-start gap-3 text-[0.82rem] text-ink-3"
              data-reveal
              style={revealDelay(240)}
            >
              <Icon name="circle-info" className="mt-0.5" />
              <span>
                Compatible Linux, macOS, Windows (WSL2). Docker Engine ≥ 24.
              </span>
            </div>
          </div>

          <div
            className="lg:col-span-7"
            data-reveal
            style={revealDelay(140)}
          >
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
