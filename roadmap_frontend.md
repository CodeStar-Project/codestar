# Refonte Frontend — Roadmap

> **But du document.** Brief exécutable pour une **refonte totale du frontend** Codestar, lisible par une IA ou un·e collègue.
> **Audience.** Quiconque exécute la refonte (humain ou agent). Aucun pré-requis sur l'historique : tout le contexte est pointé ci-dessous.
> **Statut.** Brouillon de cadrage — la DA et l'archi cible sont des **livrables de la Phase 0/2**, pas des décisions figées.
> **Dernière mise à jour.** 2026-06-08.

---

## 0. À lire avant de commencer (obligatoire)

1. **`hand-off.md`** — contexte produit complet. Sections critiques :
   - **§5 API REST** — inventaire exhaustif des **33 endpoints backend réels**. C'est la **source de vérité** des fonctionnalités à couvrir (cf. règle §3 ci-dessous).
   - **§6 Spécifications UI (10 écrans)** — specs des pages (référence, pas un dogme : la refonte peut les revoir).
   - **§1 Principes design (fixes)** — non négociables (cf. §2 ci-dessous).
2. **`apps/frontend/design-liquid-glass-citron-dark.md`** — ✅ **DA officielle verrouillée** : Liquid Glass · Citron Pastel (générée via Claude). **Source de vérité du design** : tokens couleurs (light + dark), typo (Instrument Serif / Outfit / JetBrains Mono), recette verre (`blur 29px`), logo étoile pixel, animations, layout, specs composants. Remplace l'ancienne DA de `hand-off §7`.
3. **`apps/frontend/CLAUDE.md`** + **`AGENTS.md`** — conventions du repo frontend.
   - ⚠️ **Next.js = version interne** (cf. `AGENTS.md`) : APIs potentiellement différentes du Next public. **Lire `node_modules/next/dist/docs/` avant tout nouveau pattern** (routing, cache, server actions, etc.).

---

## 1. État actuel du frontend (inventaire)

> Base concrète sur laquelle on part. Mesurée au niveau code, branche `feat/images-management`.

### Stack

| Couche | Choix actuel | Note |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Version interne — cf. `AGENTS.md`. |
| UI | **React 19** | Server Components par défaut. |
| Styling | **Tailwind v4** + tokens CSS custom | DA Liquid Glass dans `globals.css`. |
| Primitives | `class-variance-authority` + `clsx` + `tailwind-merge` + `@radix-ui/react-slot` | Pattern `cva` dans `components/ui/`. |
| Drag-drop | `@dnd-kit/*` | Éditeur de cours uniquement. |
| i18n | `next-intl` 4 | `messages/{en,fr}.json`. |
| Auth (edge) | `jose` | Vérif JWT côté front. |
| **Data fetching** | **Server Actions + RSC** (`app/actions/*`) | ❌ aujourd'hui : ni SWR ni TanStack Query. **→ TanStack Query à introduire en Phase 1** (cf. 0.3). |
| **Tests** | **aucun** | Playwright sur branche séparée non mergée. |

### Architecture data (à connaître avant de juger la Phase 1)

- `lib/api.ts` — client HTTP **server-only** : `apiFetch` (déballe l'enveloppe `ApiResponseDto`), `apiUpload` (multipart), `apiFetchText`. Gère JWT via cookie, timeout/abort, `ApiError`.
- `app/actions/*` — un fichier par ressource (`auth, bookmarks, courses, enrollments, groups, instance, media, settings, users`). Convention : **mutations renvoient `{ ok, error?, data? }`** (ne throw pas) ; lectures renvoient la donnée ou `[]`/`null`.
- Providers : `auth-provider`, `branding-provider`.

### Arborescence actuelle (résumé)

```
app/
  page.tsx (landing) · login/ · home/ · courses/[slug]/(+read) · my-courses/ · me/dash/ · bookmarks/
  admin/ → page.tsx · courses/(list,new,[id],[id]/blocks) · groups/[id]/(members,curriculum) · users/ · settings/
  api/v1/media/[id]/route.ts (proxy)
  actions/* · layout.tsx · error.tsx · not-found.tsx · robots.ts · sitemap.ts
components/
  ui/ (glass-* + mesh-background + icons)   ← design system actuel
  course/ (catalog, card, reader bits, toc, stat-card…)
  admin/ (shell, course-editor, forms, tables, role-guard…)
  block-kinds/ (registry: 1 module/kind + palette + tones)
  auth-provider · branding-provider · top-nav · site-footer · user-menu · locale-switcher
lib/ api · types · format · instance · roles · safe-redirect · site · utils
```

---

## 2. Principes fixes (hérités — non négociables)

Repris de `hand-off §1`. Toute page/composant doit les respecter dès la livraison :

1. **Mobile-first** sur 100 % des pages.
2. **Accessibilité WCAG AA** — contraste vérifié, focus visibles jamais supprimés, ARIA correct, `prefers-reduced-motion` + `prefers-contrast`.
3. **i18n dès la livraison** — zéro string en dur, tout dans `messages/{en,fr}.json`. EN = défaut, FR livré.
4. **Light / dark mode**.
5. **Mention `[Logo] Codestar`** dans le footer — figée par licence GPLv3, non retirable.

---

## 3. Règle d'or : on couvre le **backend**, pas le front actuel

> Le front actuel **n'expose pas** tout ce que le backend sait faire. La refonte se base sur les **fonctionnalités backend** (`hand-off §5`), **pas** sur les pages existantes.

### Mapping capacité backend → surface frontend cible

✅ couvert aujourd'hui · 🟡 partiel · ❌ manquant (à construire) · 🚫 hors scope (back absent)

| Capacité backend (endpoints) | Surface front cible | Statut actuel |
|---|---|---|
| `auth/*` (login/register/me/logout) | `/login` (3 modes), provider auth, user-menu | ✅ |
| `courses` list/`{slug}`/`{id}/pages` | `/courses` (catalogue), `/courses/[slug]` (intro), `/courses/[slug]/read` (lecteur), `/home` (découvrir) | ✅ |
| `courses` mine/create/duplicate/patch/status/delete/pages | `/admin/courses` + éditeur `/admin/courses/[id]/blocks` | ✅ |
| `courses/{id}/export` + `courses/import` | Boutons import/export dans l'éditeur | 🟡 à re-valider dans la refonte |
| `enrollments` mine/progress | `/my-courses`, `/me/dash`, bloc « Reprendre » de `/home` | ✅ |
| `bookmarks` (CRUD + mine + by-course) | `/bookmarks`, bouton favori dans le lecteur | ✅ |
| `groups` **list + create + patch + delete** | **Page liste + création de groupes admin** | ❌ **manquant** — seuls `[id]/members` et `[id]/curriculum` existent ; pas de `/admin/groups` ni `/admin/groups/new` alors que `GET/POST/PATCH/DELETE /groups` existent |
| `groups/{id}/invitations` + `invitations/{id}` (revoke) | UI génération / liste / révocation de codes | 🟡 à vérifier/refaire |
| `groups/{id}/members` (+ remove + patch-role) | `/admin/groups/[id]/members` | ✅ |
| `groups/{id}/curriculum` | `/admin/groups/[id]/curriculum` | ✅ |
| `users` (list + role + disable/enable) | `/admin/users` | ✅ |
| `settings` (get/patch) | `/admin/settings` | ✅ |
| `media` (upload/get) | Téléversement dans le bloc IMAGE de l'éditeur | ✅ |
| `instance/branding` **PATCH** | **`/admin/branding` (live preview)** | ❌ **manquant** — API existe, page absente (`hand-off §2.9`) |
| `instance/branding` GET | `branding-provider` | ✅ |
| Gamification (quiz/leaderboard/me-stats/reset) | `/leaderboard`, badges, XP | 🚫 **hors scope** — endpoints back v3 non implémentés |
| Notes (`/notes/*`) | Colonne notes du lecteur | 🚫 **hors scope** — endpoint back absent |

**Conséquences pour la refonte :**
- **Construire le manquant** : `/admin/branding`, page **liste + création de groupes**, UI invitations complète.
- **Ne pas construire** le v3 (leaderboard, quiz, notes) tant que le backend ne l'expose pas. Prévoir les emplacements UI (placeholders) sans logique morte.

---

## Phase 0 — Cadrage (avant d'écrire du code)

**Objectif.** Figer les décisions structurantes pour que Phases 1-3 ne partent pas dans le mur.

| # | Tâche | Livrable | Statut |
|---|---|---|---|
| 0.1 | Lire §0 ci-dessus en entier (hand-off, design spec, CLAUDE.md, AGENTS.md, docs Next interne). | — | ☐ |
| 0.2 | ~~Décider de la nouvelle DA~~ | **✅ TRANCHÉ** : DA = `design-liquid-glass-citron-dark.md` (Liquid Glass · Citron, light + dark). | ✅ |
| 0.3 | ~~Décider de l'architecture data~~ | **✅ TRANCHÉ** : RSC + server actions (lectures/mutations serveur) **+ TanStack Query** côté client pour le cache, les mutations optimistes et la revalidation. | ✅ |
| 0.4 | ~~Découpage livraison~~ | **✅ TRANCHÉ** : ~11 PR séquentielles, chacune shippable seule (cf. **§4bis Plan de livraison**). | ✅ |

> Décisions structurantes **toutes actées** : DA (0.2), archi data (0.3), plan de PR (0.4).

---

## Phase 1 — Assainir la base (libs + server actions)

> **Objectif.** Partir sur une base propre **avant** de toucher l'UI. Aucune régression fonctionnelle. **Commit / PR séparé** (idéalement avant toute la partie visuelle).

### 1.1 Audit à produire

Passer en revue `lib/*` + `app/actions/*` et **répertorier** (rapport écrit) tout ce qui est :
- dupliqué (ex. boilerplate `try/catch` + `errMsg` répété dans chaque action) ;
- incohérent (conventions de retour, nommage, gestion d'erreur) ;
- fragile ou non typé de bout en bout ;
- absent (validation d'entrée, revalidation de cache, gestion du chargement/erreur côté UI).

### 1.2 Chantiers candidats

| Chantier | Détail |
|---|---|
| **Uniformiser la gestion d'erreur** | Helper unique (`errMsg`/wrapper) au lieu de le répéter dans chaque action. Type de retour mutation standard (`Result<T>`). |
| **Validation d'entrée** | Valider les payloads avant l'appel back (candidat : **Zod**) + inférence de types depuis les schémas. |
| **Typage de bout en bout** | Réconcilier `lib/types.ts` avec les DTO backend réels (`hand-off §5`). Supprimer les `any`/casts douteux. |
| **Stratégie de cache / revalidation** | Statuer sur `revalidatePath`/`revalidateTag` (serveur) vs cache **TanStack Query** (client). Documenter quand utiliser quoi. |
| **Data fetching client — TanStack Query** | ✅ **acté** (0.3). Mettre en place le `QueryClientProvider`, conventions de **query keys**, hooks par ressource au-dessus des server actions, mutations optimistes + invalidation. Les server actions restent la couche d'accès back ; TanStack Query gère le cache/état client. ⚠️ valider la compat avec la version interne de Next (SSR/hydratation) avant de généraliser. |
| **Découpage** | Si un sujet est trop gros (ex. migration validation), le sortir en PR dédiée. |

> ⚠️ **Zod = candidat à valider.** **TanStack Query = acté.** Toute nouvelle dépendance doit être confirmée compatible avec la version interne de Next. Préférer le minimum de dépendances.

### 1.3 Critère de sortie Phase 1

- Rapport d'audit livré.
- Base refactorée, **build + lint + type-check verts**, **aucune régression** fonctionnelle (vérif manuelle des flux existants).
- Conventions documentées (dans `CLAUDE.md` ou un `README` frontend).

---

## Phase 2 — Nouvelle DA + design system

> **Objectif.** Un design system réutilisable **avant** de réécrire les pages, pour maximiser la réutilisation (exigence clé).

> **Référence unique : `design-liquid-glass-citron-dark.md`.** Reprendre tokens, typo, recette verre, animations et specs composants tels que définis. Ne pas réinventer ce qui y est déjà spécifié.

| # | Tâche |
|---|---|
| 2.1 | Porter les tokens du design spec dans `globals.css` (§11 du spec : `--color-accent #EAB12E`, `--glass-blur blur(29px) saturate(180%)`, bg/text/mesh light + dark, `[data-theme]`). Charger les polices (Instrument Serif / Outfit / JetBrains Mono). |
| 2.2 | Reconstruire / faire évoluer les **primitives** `components/ui/` selon §11 du spec : `<MeshBackground>`, `<GlassCard variant>`, `<GlassNav>`, `<GlassButton variant="primary\|glass\|outline\|ghost" size>`, `<GlassChip variant>`, `<BrandMark logoMode="pixel\|vector">` + besoins transverses (inputs, modal, table, skeleton, toast). Variants via `cva`. |
| 2.3 | Composer les **patterns réutilisables** (au-dessus des primitives) : page header, empty-state, stat-card, data-table, form-field, etc. Couvrir les besoins récurrents repérés en Phase 3. |
| 2.4 | États transverses obligatoires pour chaque composant : **loading / empty / error / disabled**, focus visible, dark mode. |
| 2.5 | Mini-doc d'usage du design system (où vit quoi, comment réutiliser, do/don't). |

**Critère de sortie :** chaque primitive et pattern est accessible (WCAG AA), responsive, i18n-ready, dark-mode-ready, et documenté.

---

## Phase 3 — Refonte composants / pages / layout

> **Objectif.** Réécrire les pages avec la nouvelle DA et la nouvelle archi, en **réutilisant au maximum** le design system de la Phase 2. **Chaque page est validée une par une** avant de passer à la suivante.

### 3.1 Layout & navigation

- Refondre `app/layout.tsx`, les **shells** (`student-shell`, `admin-shell`), `top-nav`, `site-footer`, `user-menu`, `locale-switcher`.
- Navigation par rôle (cf. matrice `hand-off §3`), `role-guard` conservé/refondu.

### 3.2 Pages — file de validation (une par une)

> Ordre conseillé : public → étudiant → admin. **Chaque page** doit passer la *Definition of Done* (§3.3) avant d'être marquée ✅.

| # | Page | Source spec | Construire / refaire | Statut |
|---|---|---|---|---|
| P1 | `/` Landing | `§6 écran 1` | refonte | ☐ |
| P2 | `/login` (signin/signup/join) | `§6 écran 2` | refonte | ☐ |
| P3 | `/home` étudiant | `§6 écran 3` | refonte | ☐ |
| P4 | `/courses` catalogue | — | refonte | ☐ |
| P5 | `/courses/[slug]` intro cours | `§6 écran 5` | refonte | ☐ |
| P6 | `/courses/[slug]/read` lecteur | `§6 écran 5` | refonte | ☐ |
| P7 | `/my-courses` | `§6 écran 4` | refonte | ☐ |
| P8 | `/me/dash` dashboard étudiant | `§6 écran 6` | refonte | ☐ |
| P9 | `/bookmarks` | — | refonte | ☐ |
| P10 | `/admin` dashboard admin | `§6 écran 8` | refonte | ☐ |
| P11 | `/admin/courses` (+ new, [id]) | — | refonte | ☐ |
| P12 | `/admin/courses/[id]/blocks` éditeur | `§6 écran 9` + `§11` | refonte (gros morceau, dnd existant) | ☐ |
| P13 | **`/admin/groups` liste + création** | `§6` | **nouveau** (back existe, front absent) | ☐ |
| P14 | `/admin/groups/[id]/members` | — | refonte | ☐ |
| P15 | `/admin/groups/[id]/curriculum` | — | refonte | ☐ |
| P16 | Invitations (génération/liste/révocation) | — | nouveau / compléter | ☐ |
| P17 | `/admin/users` | — | refonte | ☐ |
| P18 | `/admin/settings` | `§11.4ter` | refonte | ☐ |
| P19 | **`/admin/branding` (live preview)** | `§6 écran 10` | **nouveau** (back existe, front absent) | ☐ |
| — | `/leaderboard`, notes, gamification | `§6 écran 7` | 🚫 **hors scope** (back v3 absent) | — |

### 3.3 Definition of Done par page (validation « une par une »)

Une page n'est ✅ que si **tout** est coché :

- [ ] Couvre la/les capacité(s) backend associée(s) (cf. mapping §3) — pas de fonction back oubliée.
- [ ] Réutilise le design system (Phase 2) ; zéro one-off non justifié.
- [ ] Responsive mobile-first vérifié (≥ 1 breakpoint mobile + desktop).
- [ ] États loading / empty / error gérés.
- [ ] Light + dark mode OK.
- [ ] i18n : zéro string en dur (EN + FR).
- [ ] A11y : navigation clavier, focus visible, ARIA, contraste (axe-core).
- [ ] Permissions par rôle respectées (`hand-off §3`).
- [ ] Build + lint + type-check verts.
- [ ] Validée visuellement (capture/démo) avant de passer à la page suivante.

---

## Phase 4 — Tests, accessibilité, performance (transverse / fin de parcours)

| # | Tâche |
|---|---|
| 4.1 | Tests E2E Playwright des flux critiques (signup, login, join, lecture cours, progression, édition cours, branding). |
| 4.2 | Audit a11y automatisé (axe-core) + corrections, sur chaque page livrée. |
| 4.3 | Audit perf (Lighthouse) : LCP/CLS, code-splitting, images (`media` proxy), polices. |
| 4.4 | Brancher en CI : lint + type-check + E2E (`hand-off §9`). |
| 4.5 | Mettre à jour `apps/frontend/CLAUDE.md` (nouvelle DA + archi) et `hand-off.md`. |

---

## 4bis. Plan de livraison (PR)

> **Principe.** PR **séquentielles**, chacune **shippable seule** (build/lint/type-check verts, aucune régression). Chaque PR touchant des pages applique la **DoD §3.3** par page. Ordre : base → design system → public → étudiant → admin. a11y/perf vérifiés **par page dans chaque PR** ; la suite E2E + le câblage CI ferment le parcours.

| PR | Portée | Contenu | Phase |
|---|---|---|---|
| **PR0** | Base | Audit + refacto `lib/*` & `app/actions/*`, gestion d'erreur unifiée, validation (Zod si retenu), **setup TanStack Query** (`QueryClientProvider`, query keys, hooks par ressource). Zéro changement visuel. | 1 |
| **PR1** | Design system + layout + landing | Tokens `globals.css` (light/dark) + polices, primitives `components/ui/` (§11 spec), `MeshBackground`, refonte `layout` + shells + `top-nav` + `site-footer`. **`/` (landing)** = 1ʳᵉ page consommatrice (preuve du système). | 2 + P1 |
| **PR2** | Auth | `/login` (signin/signup/join). Clôt le public. | 3 (P2) |
| **PR3** | Étudiant — lecture | `/home`, `/courses`, `/courses/[slug]`, `/courses/[slug]/read`. | 3 (P3-P6) |
| **PR4** | Étudiant — suivi | `/my-courses`, `/me/dash`, `/bookmarks`. | 3 (P7-P9) |
| **PR5** | Admin — socle | `admin-shell`, `role-guard`, `/admin` (dashboard), `/admin/courses` (+ new, [id]). | 3 (P10-P11) |
| **PR6** | Éditeur | `/admin/courses/[id]/blocks` — **seul** (gros morceau, dnd + import/export + media). | 3 (P12) |
| **PR7** | Groupes | **`/admin/groups` liste + création (NEW)**, `[id]/members`, `[id]/curriculum`, **UI invitations**. | 3 (P13-P16) |
| **PR8** | Users + Settings | `/admin/users`, `/admin/settings`. | 3 (P17-P18) |
| **PR9** | Branding | **`/admin/branding` live preview (NEW)**. | 3 (P19) |
| **PR10** | Qualité | Suite **E2E Playwright** des flux critiques + câblage **CI** (lint, type-check, E2E) + audits finaux Lighthouse/axe + maj docs (`CLAUDE.md`, `hand-off.md`). | 4 |

**Règles de fusion :**
- Une PR « pages » ne merge que si **chaque page** dedans est ✅ selon la DoD §3.3.
- Pas de logique morte pour le v3 (leaderboard/quiz/notes) : emplacements UI seulement si justifié.
- Découper davantage si une PR devient trop grosse (ex. PR3 → 2 PR lecteur/catalogue).

---

## 5. Définition de « terminé » (global)

- Toutes les capacités backend de `hand-off §5` ont une surface front (sauf v3 hors scope).
- Toutes les pages de §3.2 sont ✅ selon la DoD §3.3.
- Base (libs/actions) propre et documentée (Phase 1).
- Design system documenté et réutilisé partout (Phase 2).
- Principes fixes §2 respectés partout.
- CI verte (lint, type-check, E2E).
- Docs à jour.

---

## 6. Garde-fous & rappels

- **Ne pas réintroduire** de fonctionnalités sans backend (leaderboard, quiz, notes) — placeholders UI seulement si nécessaire.
- **Version Next interne** : lire `node_modules/next/dist/docs/` avant chaque nouveau pattern ; ne pas présumer du Next public.
- **DA verrouillée** : `design-liquid-glass-citron-dark.md` est la source de vérité visuelle — s'y conformer, ne pas diverger sans accord.
- **Minimiser les dépendances** : TanStack Query est acté ; toute autre nouvelle lib (Zod…) doit être justifiée + validée compatible avec le Next interne.
- **Toute décision structurante** prise en cours de route → consignée dans une PR **et** dans `hand-off.md` / ce fichier.
- **Réutilisation > duplication** : si un composant est copié-collé, c'est un signal pour le remonter dans le design system.
