/**
 * Couche décorative animée pour les pages publiques (home, auth).
 * Aurora conique + orbes flottants + grille en fondu + particules
 * scintillantes. Purement décoratif (`aria-hidden`), sans JS.
 * Toutes les animations sont neutralisées par `prefers-reduced-motion`
 * (cf. globals.css).
 */

// Positions déterministes (pas de Math.random → pas de mismatch d'hydratation).
const PARTICLES = [
  { top: "16%", left: "12%", size: 5, delay: "0s", dur: "5s" },
  { top: "28%", left: "82%", size: 3, delay: "0.8s", dur: "4s" },
  { top: "44%", left: "24%", size: 4, delay: "1.6s", dur: "6s" },
  { top: "62%", left: "70%", size: 6, delay: "0.4s", dur: "5.5s" },
  { top: "74%", left: "18%", size: 3, delay: "2.2s", dur: "4.5s" },
  { top: "22%", left: "54%", size: 4, delay: "1.2s", dur: "6.5s" },
  { top: "82%", left: "46%", size: 5, delay: "0.2s", dur: "5s" },
  { top: "38%", left: "90%", size: 3, delay: "1.9s", dur: "4.2s" },
  { top: "55%", left: "8%", size: 4, delay: "2.6s", dur: "6s" },
  { top: "10%", left: "38%", size: 3, delay: "1.4s", dur: "5.2s" },
  { top: "68%", left: "58%", size: 5, delay: "0.6s", dur: "4.8s" },
  { top: "48%", left: "62%", size: 3, delay: "2.0s", dur: "5.6s" },
];

export function AuroraLayer({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={"absolute inset-0 overflow-hidden " + className}
    >
      {/* Faisceau conique en rotation — coeur lumineux de la scène. */}
      <div
        className="fx-aurora absolute left-1/2 top-1/2 h-[130vmax] w-[130vmax] opacity-40 blur-[70px]"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, transparent 0%, color-mix(in oklab, var(--color-accent) 32%, transparent) 12%, transparent 32%, color-mix(in oklab, var(--color-bg-mesh-2-raw) 85%, transparent) 55%, transparent 78%)",
        }}
      />

      {/* Orbes flottants. */}
      <div
        className="fx-orb absolute left-[10%] top-[20%] h-44 w-44 rounded-full opacity-55 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 48%, transparent), transparent 70%)",
        }}
      />
      <div
        className="fx-orb absolute right-[12%] bottom-[18%] h-56 w-56 rounded-full opacity-45 blur-2xl"
        style={{
          animationDelay: "1.6s",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-bg-mesh-1-raw) 92%, transparent), transparent 70%)",
        }}
      />

      {/* Grille fine, en fondu radial vers les bords. */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text-raw) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-raw) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage:
            "radial-gradient(ellipse 72% 60% at 50% 42%, #000 28%, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 60% at 50% 42%, #000 28%, transparent 76%)",
        }}
      />

      {/* Particules scintillantes. */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="fx-particle absolute rounded-full bg-[color:var(--color-accent)]"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
            boxShadow:
              "0 0 8px color-mix(in oklab, var(--color-accent) 80%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
