import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { revealDelay } from "@/lib/reveal";

interface RoadmapItem {
  icon: IconName;
  title: string;
  desc: string;
}

const ITEMS: RoadmapItem[] = [
  {
    icon: "bell",
    title: "Notifications",
    desc: "Suivi des deadlines, des corrections et des messages directs.",
  },
  {
    icon: "certificate",
    title: "Certificats",
    desc: "Délivrer des attestations vérifiables à vos apprenants.",
  },
  {
    icon: "mobile",
    title: "Application mobile",
    desc: "Accès aux cours et aux quiz depuis le téléphone.",
  },
];

export function RoadmapRail() {
  return (
    <div className="mt-20 pt-12 border-t border-line">
      <div className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-2">
        <Icon name="route" className="text-brand" />
        <span>À venir · Roadmap</span>
        <span className="h-px flex-1 bg-line-strong" />
      </div>
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className="border border-dashed border-line-strong rounded-2xl p-5 group hover:border-brand transition-colors"
            data-reveal
            style={revealDelay(i * 90)}
          >
            <div className="flex items-center gap-3">
              <Icon
                name={item.icon}
                className="text-ink-2 group-hover:text-brand transition-colors"
              />
              <span className="font-semibold">{item.title}</span>
            </div>
            <p className="mt-2 text-[0.9rem] text-ink-2 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
