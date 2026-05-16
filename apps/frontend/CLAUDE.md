@AGENTS.md

# Contexte projet

Source de vérité technique du projet : [`/hand-off.md`](../../hand-off.md) à la racine du repo.
Y consulter avant toute décision touchant : roles & permissions, modèle de données, endpoints REST, scope par phase (v1/v2/v3), spécifications UI page-par-page.

Source de vérité visuelle : `/codestar-draft-design/` (mocks React du draft initial). Le draft est obsolète sur la DA (cf. ci-dessous) mais reste valable pour la structure des écrans.

# Direction Artistique — Liquid Glass

DA validée le 2026-05-09. Remplace l'ancienne DA Outfit + #F28022 + Apple-grey (commit antérieur, désormais obsolète). Détails complets : `hand-off.md` §7.

## Principes
- Vitres translucides (`backdrop-filter: blur(20px) saturate(180%)`).
- Palette pastel iOS (lavande, pêche, menthe en mesh-gradient sur le fond).
- Accent paramétrable par instance via `instance.json` (fallback `#7AA9FF`).
- Chaleureux + professionnel. Références : Apple Vision OS, Linear, Arc Browser. Pas de néon, pas de flat brutalisme.
- Mobile-first dès la v1. WCAG AA respecté (contraste sur glass vérifié, focus visibles, ARIA).

## Tokens CSS (à poser dans `app/globals.css`)

```css
:root {
  --bg-base: #F4F6FB;
  --bg-mesh-1: #DCE8FF;
  --bg-mesh-2: #FFE4D6;
  --bg-mesh-3: #E1F5E8;

  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-strong: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.65);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.08);
  --glass-blur: blur(20px) saturate(180%);

  --text: #1A1F2E;
  --text-soft: #4A5366;
  --muted: #8892A6;

  --accent: #7AA9FF;
  --accent-fg: #FFFFFF;
  --accent-soft: rgba(122, 169, 255, 0.18);

  --success: #5DC9A8;
  --warning: #FFB672;
  --danger:  #FF8A95;

  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Instrument Serif', 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;

  --r-sm: 8px;
  --r: 14px;
  --r-lg: 22px;
  --r-xl: 32px;
}

[data-theme="dark"] {
  --bg-base: #0E1422;
  --glass-bg: rgba(20, 28, 48, 0.55);
  --glass-bg-strong: rgba(20, 28, 48, 0.78);
  --glass-border: rgba(255, 255, 255, 0.10);
  --text: #EDF1F9;
  --text-soft: #B6C0D6;
  --muted: #7C8BA8;
}
```

## Composants à créer dans `components/ui/`
`<GlassCard>`, `<GlassButton>`, `<GlassInput>`, `<GlassChip>`, `<GlassNav>`, `<MeshBackground>`. Variantes glass : `default | strong | tinted-accent`.

## Garde-fous
- Contraste texte sur glass : tester systématiquement au-dessus de chaque mesh-spot. Si < 4.5:1 → utiliser `--glass-bg-strong`.
- Focus ring : `2px solid var(--accent)` + `outline-offset: 2px`, jamais supprimé.
- `prefers-reduced-motion` : désactiver mesh animation et page-fade transitions.
- `prefers-contrast: more` : remplacer glass par surfaces opaques.

## Typographie
**Outfit** (Google Fonts) — body / UI.
**Instrument Serif** ou **Fraunces** — display / titres éditoriaux.
Import : `family=Outfit:wght@300..900&family=Instrument+Serif:ital@0;1`.
