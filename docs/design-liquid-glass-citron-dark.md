# Codestar — Design Spec
## Direction 01 · Liquid Glass · Citron Pastel

> `style: glass` · `palette: citron` · `blur: 29px` · `motion: true` · `logo: pixel`
> Couvre les deux modes : **clair** et **sombre**.
> Généré le 2 juin 2026 — source de vérité pour l'implémentation Next.js.

---

## 1. Concept

**Liquid Glass** est la DA officielle de Codestar. Elle repose sur trois principes :

1. **Profondeur atmosphérique** — un fond sombre traversé de taches de lumière (mesh-gradient) crée l'illusion d'une pièce éclairée par derrière. Les surfaces UI flottent au premier plan comme du verre dépoli.
2. **Matière translucide** — chaque conteneur est un vitrage (`backdrop-filter: blur + saturate`) avec une bordure lumineuse semi-transparente. Il n'y a pas de fond opaque.
3. **Accent citron** — la couleur `#EAB12E` résonne avec le logo étoile pixel-art, évoque la curiosité et l'énergie sans être agressive. Sur fond sombre elle est dorée ; sur fond clair elle est solaire.

---

## 2. Palette de couleurs

### 2.1 Couleurs fixes (indépendantes du mode)

| Token CSS | Valeur | Rôle |
|---|---|---|
| `--g-accent` | `#EAB12E` | Accent principal — citron doré |
| `--g-accent-fg` | `#1A1F2E` | Texte sur accent (sombre, lisible) |
| `--g-blur` | `blur(29px) saturate(180%)` | Effet verre dépoli |

```
Accent   #EAB12E  ████  Citron doré — luminance > seuil → texte sombre dessus
```

---

### 2.2 Tokens mode clair (`dark: false`)

| Token CSS | Valeur | Description |
|---|---|---|
| `--g-bg` | `#FBF9EE` | Fond de page — parchemin solaire |
| `--g-mesh1` | `#FFF1BF` | Blob 1 — vanille |
| `--g-mesh2` | `#FFE2BE` | Blob 2 — pêche pâle |
| `--g-mesh3` | `#EBF6C8` | Blob 3 — agrume tendre |
| `--g-accent-soft` | `rgba(234,177,46,0.16)` | Accent dilué — chips, fonds subtils |
| `--g-text` | `#1A1F2E` | Texte principal |
| `--g-text-soft` | `#4A5366` | Texte secondaire |
| `--g-muted` | `#8892A6` | Texte désactivé / métadonnées |
| `--g-glass` | `rgba(255,255,255,0.55)` | Surface verre — nav, chips |
| `--g-glassS` | `rgba(255,255,255,0.72)` | Surface verre forte — cards hero |
| `--g-border` | `rgba(255,255,255,0.65)` | Bordure lumineuse |
| `--g-shadow` | `0 8px 32px rgba(31,38,135,0.10)` | Ombre portée standard |

```
Bg       #FBF9EE  ████  Parchemin
Blob 1   #FFF1BF  ████  Vanille
Blob 2   #FFE2BE  ████  Pêche pâle
Blob 3   #EBF6C8  ████  Agrume tendre
Text     #1A1F2E  ████  Encre profonde
Soft     #4A5366  ████  Gris bleuté
Muted    #8892A6  ████  Gris discret
```

---

### 2.3 Tokens mode sombre (`dark: true`)

| Token CSS | Valeur | Description |
|---|---|---|
| `--g-bg` | `#0E1422` | Fond de page — navy profond |
| `--g-mesh1` | `#38352a` | Blob 1 — miel profond (`#FFF1BF` assombri 78%) |
| `--g-mesh2` | `#332d26` | Blob 2 — ambre nuit (`#FFE2BE` assombri 80%) |
| `--g-mesh3` | `#2f3128` | Blob 3 — sauge nuit (`#EBF6C8` assombri 80%) |
| `--g-accent-soft` | `rgba(234,177,46,0.24)` | Accent dilué — opacité plus forte qu'en light |
| `--g-text` | `#EDF1F9` | Texte principal |
| `--g-text-soft` | `#B6C0D6` | Texte secondaire |
| `--g-muted` | `#7C8BA8` | Texte désactivé / métadonnées |
| `--g-glass` | `rgba(20,28,48,0.55)` | Surface verre — nav, chips |
| `--g-glassS` | `rgba(20,28,48,0.80)` | Surface verre forte — cards hero |
| `--g-border` | `rgba(255,255,255,0.12)` | Bordure lumineuse |
| `--g-shadow` | `0 8px 32px rgba(0,0,0,0.45)` | Ombre portée standard |

```
Bg       #0E1422  ████  Navy profond
Blob 1   #38352a  ████  Miel profond
Blob 2   #332d26  ████  Ambre nuit
Blob 3   #2f3128  ████  Sauge nuit
Text     #EDF1F9  ████  Blanc cassé
Soft     #B6C0D6  ████  Bleu pâle
Muted    #7C8BA8  ████  Gris bleuté
```

> **Algorithme d'assombrissement des blobs** :
> `shade(hex, t, dark) = Math.round(channel × (1 − t))`
> Blob1 → t=0.78 · Blob2&3 → t=0.80

---

### 2.4 Autres palettes disponibles (tweakables)

| ID | Accent | Usage |
|---|---|---|
| `lavande` | `#7AA9FF` | Défaut — bleu iOS |
| `menthe` | `#23B891` | Vert émeraude |
| `peche` | `#F76F52` | Corail chaud |
| `lilas` | `#8E78F5` | Violet pastel |
| `rose` | `#EC5C8D` | Rose bonbon |

---

## 3. Typographie

| Rôle | Famille | Poids | Taille |
|---|---|---|---|
| **Display / Titres** | Instrument Serif | 400 (italic pour l'accent) | clamp(2.6rem → 4.6rem) |
| **Corps / Interface** | Outfit | 300 400 500 600 700 | 0.78rem → 1.12rem |
| **Mono / Badges** | JetBrains Mono | 400 500 | 0.72rem → 0.86rem |

### Hiérarchie typographique

```
H1 Hero      Instrument Serif 400  clamp(2.6rem, 6.4vw, 4.6rem)   ls: -0.01em  lh: 1.02
H2 Section   Instrument Serif 400  clamp(2rem, 3.6vw, 2.9rem)      ls: -0.01em  lh: 1.02
H3 Card      Instrument Serif 400  1.5rem                           ls: -0.01em  lh: 1.08
Lede         Outfit 400            1.12rem                          lh: 1.6
Corps        Outfit 400            0.92rem                          lh: 1.55
Meta         Outfit 500            0.78–0.86rem
Nano (footer) JetBrains Mono 400  0.72–0.76rem                     ls: 0
```

### Chargement Google Fonts

```html
<link href="https://fonts.googleapis.com/css2?
  family=Outfit:wght@300;400;500;600;700;800;900
  &family=Instrument+Serif:ital@0;1
  &family=JetBrains+Mono:wght@400;500;700
  &display=swap" rel="stylesheet" />
```

---

## 4. Logo

- **Type** : Étoile pixel-art (style 8-bit, deux yeux, aplats jaune + brun)
- **Format** : PNG transparent `assets/star-tight.png` (219×218 px)
- **Rendu** : `image-rendering: pixelated` + `filter: drop-shadow(0 2px 6px rgba(0,0,0,.18))`
- **Mode vectoriel (fallback)** : `★` en SVG rempli, fond carré arrondi couleur accent

### Tailles d'usage

| Contexte | Taille |
|---|---|
| Nav principale | 30×30 px |
| Card hero mini | 40×40 px |
| CTA final | 64×64 px |
| Favicon (recommandé) | 32×32 → 512×512 svg |

---

## 5. Effets de surface — Verre

Toutes les surfaces UI utilisent la même recette :

```css
.surface {
  background:    rgba(20, 28, 48, 0.55);       /* --g-glass */
  border:        1px solid rgba(255,255,255,0.12); /* --g-border */
  backdrop-filter:   blur(29px) saturate(180%); /* --g-blur */
  -webkit-backdrop-filter: blur(29px) saturate(180%);
  box-shadow:    0 8px 32px rgba(0,0,0,0.45);  /* --g-shadow */
  border-radius: 22px;                          /* cards standard */
}
```

**Pseudo-reflet** (cards hero, vcard) :
```css
.gh-vcard::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.5), transparent 42%);
  pointer-events: none;
}
```

**Valeurs de blur par couche** :

| Couche | Backdrop blur |
|---|---|
| Nav sticky | 29px |
| Cards interactives | 29px |
| Chips flottants | 8px |
| Bouton "Se connecter" | 29px |

---

## 6. Animations

Toutes gérées en CSS (aucune lib JS). Respectent `prefers-reduced-motion: reduce`.

### Mesh background — 3 blobs
```css
@keyframes gh-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1) }
  33%       { transform: translate3d(3%, -2%, 0) scale(1.06) }
  66%       { transform: translate3d(-2%, 3%, 0) scale(.96) }
}
.gh-b1 { animation: gh-drift 22s ease-in-out infinite; }
.gh-b2 { animation: gh-drift 28s ease-in-out infinite reverse; }
.gh-b3 { animation: gh-drift 32s ease-in-out infinite; }
```

### Floating cards (hero)
```css
@keyframes gh-bob {
  0%, 100% { transform: translateY(0) }
  50%       { transform: translateY(-10px) }
}
.gh-vcard  { animation: gh-bob 7s ease-in-out infinite; }
.gh-fchip1 { animation: gh-bob 6s ease-in-out infinite 0.4s; }
.gh-fchip2 { animation: gh-bob 8s ease-in-out infinite 0.8s; }
```

### Interactions boutons
```css
.gh-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px -8px #EAB12E;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.gh-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 50px -12px rgba(31,38,135,0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
```

---

## 7. Composants

### 7.1 Navigation (sticky)

```
┌────────────────────────────────────────────────────────────────┐
│ ★ Codestar  |  Accueil  Catalogue  Mes cours          [Join] [Connexion] │
└────────────────────────────────────────────────────────────────┘
  height: 66px · backdrop-filter: blur(29px) · border-bottom: 1px solid rgba(255,255,255,.12)
```

- **Brand** : Logo pixel 30px + "Codestar" Outfit 600 1.05rem
- **Liens** : Outfit 400 0.9rem, padding 7px 13px, border-radius 99px, hover → glass bg
- **Bouton Rejoindre** : ghost (no bg, caché < 620px)
- **Bouton Se connecter** : `.gh-glassbtn` — verre + bordure

### 7.2 Boutons

| Variante | Background | Texte | Bordure | Ombre |
|---|---|---|---|---|
| **Primary** | `#EAB12E` | `#1A1F2E` | `#EAB12E` | `0 8px 26px -8px #EAB12E` |
| **Glass** | `rgba(20,28,48,0.55)` | `#EDF1F9` | `rgba(255,255,255,0.12)` | — |
| **Outline** | transparent | `#EDF1F9` | `rgba(255,255,255,0.12)` | — |
| **Ghost** | transparent | `#B6C0D6` | transparent | — |

Tous : `border-radius: 99px` · hauteurs : sm=34px, default=42px, lg=54px

### 7.3 Chips

```css
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: 99px; padding: 5px 12px; font-size: .78rem;
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
}
.chip-accent {
  background: rgba(234,177,46,0.24);
  color: #EAB12E;
  border-color: rgba(234,177,46,0.28);
}
.chip-default { background: rgba(20,28,48,0.55); color: #B6C0D6; }
```

### 7.4 Card de cours

```
border-radius: 22px
background:    rgba(20,28,48,0.55)
border:        1px solid rgba(255,255,255,0.12)
backdrop-filter: blur(29px) saturate(180%)
padding:       24px
gap:           12px (flex column)
```

Structure interne :
```
[Category chip]    [Niveau]
H3 Titre du cours
p  Description du cours (1.55 line-height)
─────────────────────────────────────────
[📖 N leçons]              [→ cercle accent]
```

Hover : `translateY(-4px)` + ombre accentuée.

### 7.5 Carte héro (vcard)

Flottante dans la colonne droite du hero. Double couche verre (rgba 0.72) + pseudo-reflet linéaire.

```
top:    [chip Frontend]    [🔖]
body:   [Logo star 40px]
        H3 "Introduction à React"  ← Instrument Serif 1.9rem
        "14 leçons · Débutant"     ← meta
        [██████████░░░░░░]  62%    ← progress bar accent
        [62%]         [▶ Reprendre] ← CTA primary sm
```

### 7.6 Chips flottants (hero)

Positionnés en absolu sur la vcard, animés `gh-bob` :

- **Fchip 1** (gauche, haut) : `🔥 · 7 · jours de série`
- **Fchip 2** (droite, bas) : `★ · 4,8 · de moyenne`

---

## 8. Layout & Grille

### 8.1 Conteneur principal
```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
```

### 8.2 Hero — 2 colonnes
```css
.hero-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 48px;
  align-items: center;
}
@media (max-width: 920px) { grid-template-columns: 1fr; }
```

### 8.3 Sections de cours / piliers — 3 colonnes
```css
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 900px) { grid-template-columns: 1fr; }
```

### 8.4 Sections — espacement vertical
```
Nav         sticky 66px
Hero        padding-top: 64px, padding-bottom: 40px
Sections    padding: 46px 28px
CTA final   padding: 46px 28px (card interne : 64px 40px)
Footer      margin-top: 54px, padding: 30px 0
```

### 8.5 Responsive breakpoints

| Breakpoint | Changement |
|---|---|
| `< 920px` | Hero : grille → colonne unique |
| `< 900px` | Grid 3 → colonne unique |
| `< 860px` | Nav : liens masqués |
| `< 620px` | Nav : bouton "Rejoindre" masqué |

---

## 9. Sections — Structure & Contenu

### 9.1 Navigation
```
Logo + nom · Accueil · Catalogue · Mes cours · [Rejoindre avec un code] · [Se connecter]
```

### 9.2 Hero
```
★ Nouveaux cours chaque semaine                   [Card flottante React]
────────────────────────────────
Apprenez à votre rythme.
(Instrument Serif 4.6rem)

Des cours soignés, des quiz qui collent, un suivi
de progression motivant. Cinq minutes par jour suffisent.

[✦ Commencer maintenant →]  [Voir le catalogue  bientôt]

· 12+ cours  · 2 400 apprenants  · ★ 4,8 de moyenne
```

### 9.3 Cours mis en avant
```
Cours mis en avant
Une sélection volontairement courte. Tout le catalogue
est accessible une fois connecté.

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Frontend Deb │ │ Prog. Deb    │ │ Outils Inter │
│ Introduction │ │ Python pour  │ │ Git & GitHub │
│ à React      │ │ débuter      │ │ en pratique  │
│ ...desc...   │ │ ...desc...   │ │ ...desc...   │
│ 📖 14 leçons →│ │ 📖 18 leçons→│ │ 📖 9 leçons →│
└──────────────┘ └──────────────┘ └──────────────┘
```

### 9.4 Piliers (3 cards)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ [📖]         │ │ [🏆]         │ │ [✦]          │
│ Lecteur      │ │ Progression  │ │ Cours faits  │
│ soigné       │ │ motivante    │ │ par des gens │
│ ...desc...   │ │ ...desc...   │ │ ...desc...   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 9.5 CTA Final
```
★ (logo 64px, absolu, droit, opacité 0.16)

Prêt·e à commencer ?
(em italic accent)

Créez un compte gratuit. Cinq minutes, votre première leçon est déjà là.

[Commencer maintenant →]  [Rejoindre avec un code]
```

### 9.6 Footer
```
★ Codestar  ·  2026 · Tous droits réservés

Mentions légales  Confidentialité  Contact

[★ Built on Codestar]  ← monospace pill badge
```

---

## 10. Motion — Règles d'accessibilité

```css
/* Désactive toutes les animations si l'utilisateur le demande */
@media (prefers-reduced-motion: reduce) {
  .gh-blob, .gh-float, .gh-float2, .gh-float3 {
    animation: none !important;
  }
}

/* Toggle programmatique via classe (Tweak "Animations") */
.gh-noanim .gh-blob,
.gh-noanim .gh-float,
.gh-noanim .gh-float2,
.gh-noanim .gh-float3 {
  animation: none !important;
}
```

---

## 11. Implémentation Next.js — Notes

### Variables CSS dans `globals.css`

```css
/* ── Tokens fixes (palette Citron) ── */
:root {
  --color-accent:       #EAB12E;
  --color-accent-fg:    #1A1F2E;
  --glass-blur:         blur(29px) saturate(180%);
}

/* ── Mode clair (défaut) ── */
:root,
[data-theme="light"] {
  --color-accent-soft:  rgba(234,177,46,0.16);
  --color-bg:           #FBF9EE;
  --color-text:         #1A1F2E;
  --color-text-soft:    #4A5366;
  --color-muted:        #8892A6;
  --glass-bg:           rgba(255,255,255,0.55);
  --glass-strong:       rgba(255,255,255,0.72);
  --glass-border:       rgba(255,255,255,0.65);
  --glass-shadow:       0 8px 32px rgba(31,38,135,0.10);
  --mesh-1:             #FFF1BF;
  --mesh-2:             #FFE2BE;
  --mesh-3:             #EBF6C8;
}

/* ── Mode sombre ── */
[data-theme="dark"] {
  --color-accent-soft:  rgba(234,177,46,0.24);
  --color-bg:           #0E1422;
  --color-text:         #EDF1F9;
  --color-text-soft:    #B6C0D6;
  --color-muted:        #7C8BA8;
  --glass-bg:           rgba(20,28,48,0.55);
  --glass-strong:       rgba(20,28,48,0.80);
  --glass-border:       rgba(255,255,255,0.12);
  --glass-shadow:       0 8px 32px rgba(0,0,0,0.45);
  --mesh-1:             #38352a;
  --mesh-2:             #332d26;
  --mesh-3:             #2f3128;
}
```

### Classe utilitaire Tailwind (à ajouter dans `tailwind.config.ts`)
```ts
extend: {
  colors: {
    accent: '#EAB12E',
    'accent-fg': '#1A1F2E',
  },
  backdropBlur: {
    glass: '29px',
  },
}
```

### Composants à créer / adapter
- `<MeshBackground />` — 3 blobs animés en `position: fixed`, `z-index: 0`
- `<GlassCard />` — surface verre avec variante `strong`
- `<GlassNav />` — sticky, blur, border-bottom
- `<GlassButton variant="primary|glass|outline|ghost" size="sm|md|lg" />`
- `<GlassChip variant="accent|default" />`
- `<BrandMark size logoMode="pixel|vector" />`

---

## 12. Fichiers sources

| Fichier | Contenu |
|---|---|
| `home/shared.js` | Palette citron, tous les tokens, contenu i18n FR |
| `home/design-glass.jsx` | Composant React complet de la homepage Liquid Glass |
| `home/icons.jsx` | Mini icon set (Book, Trophy, Sparkles, ArrowRight…) |
| `assets/star-tight.png` | Logo étoile pixel-art, fond transparent, 219×218 px |
| `Codestar Home.html` | Prototype interactif (3 directions + tweaks) |

---

*Document généré automatiquement depuis le prototype Codestar Home.html · branch `dev` · commit `c6b6273`*
