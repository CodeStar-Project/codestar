"use client";

import { SectionLabel } from "@/components/brand/section-label";
import { Icon } from "@/components/ui/icon";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { IconName } from "@/lib/icons";
import { revealDelay } from "@/lib/reveal";

import { BlockEditorPreview } from "./block-editor-preview";
import { LeaderboardPreview } from "./leaderboard-preview";
import { QuizPreview } from "./quiz-preview";
import { RoadmapRail } from "./roadmap-rail";

const TABS: { id: string; label: string; icon: IconName }[] = [
  { id: "editor", label: "Éditeur de blocs", icon: "grip" },
  { id: "leaderboard", label: "Classement", icon: "trophy" },
  { id: "quiz", label: "Quiz", icon: "list-check" },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div data-reveal>
              <SectionLabel index="03" label="Capacités" />
            </div>
            <h2
              className="font-display mt-8 text-[clamp(2rem,5vw,3.8rem)] max-w-[19ch]"
              data-reveal
              style={revealDelay(60)}
            >
              Ce que vous pouvez faire{" "}
              <span className="text-brand">aujourd’hui</span>.
            </h2>
          </div>
          <p
            className="lg:max-w-sm text-ink-2 text-[1rem] leading-relaxed"
            data-reveal
            style={revealDelay(120)}
          >
            Pas de roadmap fantôme. Voici les fonctionnalités déjà
            disponibles dans la plateforme.
          </p>
        </div>

        <Tabs defaultValue="editor" className="mt-12 lg:mt-14">
          <TabsList
            data-reveal
            style={revealDelay(160)}
            aria-label="Aperçu des fonctionnalités"
          >
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                <Icon name={t.icon} className="text-[0.85rem]" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-10" data-reveal style={revealDelay(220)}>
            <TabsContent value="editor">
              <BlockEditorPreview />
            </TabsContent>
            <TabsContent value="leaderboard">
              <LeaderboardPreview />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizPreview />
            </TabsContent>
          </div>
        </Tabs>

        <RoadmapRail />
      </div>
    </section>
  );
}
