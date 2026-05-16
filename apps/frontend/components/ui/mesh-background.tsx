/**
 * Fond mesh-gradient pastel pour la DA Liquid Glass.
 * 3 spots radiaux animés en parallax doux. Fixed full-viewport, derrière tout.
 * Désactivé automatiquement par `prefers-reduced-motion` (cf. globals.css).
 */
export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="mesh-spot absolute -top-1/4 -left-1/4 h-[80vmax] w-[80vmax] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-bg-mesh-1-raw), transparent 60%)",
          animation: "mesh-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-spot absolute -top-1/4 -right-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-bg-mesh-2-raw), transparent 60%)",
          animation: "mesh-drift 28s ease-in-out infinite reverse",
        }}
      />
      <div
        className="mesh-spot absolute -bottom-1/3 left-1/4 h-[75vmax] w-[75vmax] rounded-full opacity-65 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-bg-mesh-3-raw), transparent 60%)",
          animation: "mesh-drift 32s ease-in-out infinite",
        }}
      />
    </div>
  );
}
