# Codestar — Hand-off

> Dernière mise à jour : 2026-06-19

## Sommaire

0. [Présentation](#0-présentation)
1. [État d'avancement (fonctionnalités)](#1-état-davancement-fonctionnalités)
2. [Architecture, stack & gotchas](#2-architecture-stack--gotchas)
3. [Modèle de tenancy](#3-modèle-de-tenancy)
4. [Rôles & matrice de permissions](#4-rôles--matrice-de-permissions)
5. [Backend](#5-backend)
6. [Course Builder](#6-course-builder)
7. [Frontend](#7-frontend)
8. [Migrations](#8-migrations)
9. [Observabilité & logging](#9-observabilité--logging-back--front)
10. [Tests](#10-tests)
11. [Roadmap projet](#11-roadmap-projet)
12. [Annexes](#12-annexes)
13. [Règle de maintenance de cette doc](#13-règle-de-maintenance-de-cette-doc)

---

## 0. Présentation

**Codestar** est une plateforme e-learning **open-source, self-hostable** (licence GPLv3). Chaque organisation (école, studio, club) déploie sa propre instance Docker et obtient une plateforme d'apprentissage gamifiée et brandable à son nom.

- **Single-tenant** : une instance = un déploiement = une organisation. Pas de SaaS centralisé.
- Branding personnalisable par instance.
- Mention de "Codestar" figée par la licence.

---

## 1. État d'avancement (fonctionnalités)

Phase v1 **terminée**, phase v2 **largement avancée** (cours, progression, bookmarks, curriculum, users/groupes, branding API, médias, génération IA backend). Restent surtout : UI branding, UI génération IA, tests, et la phase v3.

### Backend — fait ✅

- Auth JWT (`JwtAuthenticationFilter`, `JwtUtils`), `@PreAuthorize` par rôle, services de permission programmatiques, bootstrap super-admin (`SuperAdminBootstrap`).
- Auth, Groupes (CRUD + join + invitations + curriculum + membres), Invitations, Cours (CRUD + duplicate + export/import + pages), Enrollments, Bookmarks, Branding, Users admin, Settings, Médias, **Génération IA de cours**.
- Validation payload des blocs (`BlockPayloadValidator`), filtres (`CourseSpecifications`), OpenAPI/Swagger, logging structuré + `AuditLogger`, healthcheck Actuator.

### Backend — reste à faire ❌

- **Notes** : aucun modèle ni endpoint (`/notes/*` roadmap v2 non implémenté).
- **Export CSV stats groupe** : `GroupStatsService` existe, endpoint commenté (TODO).
- **Gamification v3** : quiz attempts, leaderboard, XP, streak — rien.
- **OAuth v3** : Google/GitHub — rien.
- **Logout effectif** : route présente mais no-op (pas de blacklist JWT). (peut etre redis sur le front ?)
- **Tests** : seulement `BackendApplicationTests` (smoke). Pas de Testcontainers ni de tests ciblés (cf. §10).

### Frontend — fait ✅

- DA Liquid Glass (`globals.css`, `<MeshBackground>`, lib `GlassCard/Button/Input/Chip/Nav`).
- i18n `next-intl` (`messages/{en,fr}.json`, `<LocaleSwitcher>`).
- Providers `auth-provider`, `branding-provider` ; server actions (`app/actions/*`).
- Pages : `/`, `/login`, `/home`, `/courses`, `/courses/[slug]` + `/read`, `/my-courses`, `/me/dash`, `/bookmarks`.
- Admin : `/admin`, `/admin/courses` (+ `[id]/blocks` = éditeur 3 colonnes), `/admin/groups/[id]/{members,curriculum}`, `/admin/users`, `/admin/settings`. `role-guard` front.
- Logger server-side (`lib/logger.ts`, cf. §9).

### Frontend — reste à faire ❌

- **Page `/admin/branding`** (live preview) : absente, alors que l'API `PATCH /branding` existe.
- **UI génération IA** (bouton « Générer », modal, preview avant insertion → `/courses/import`).
- **`/leaderboard`** (v3).
- **Tests Playwright** : aucun sur la branche courante (présents sur `add-playwright-tests`, non mergée).

---

## 2. Architecture, stack & gotchas

| Couche | Choix | Notes |
|---|---|---|
| Backend | Spring Boot **3.4** / Java 17 | Spring Security + Flyway + jjwt. |
| DB | PostgreSQL 16 | Migrations Flyway. **JSONB** pour `payload` des blocs. |
| Frontend | **Next.js (App Router, fork interne)** | ⚠️ voir gotcha ci-dessous. |
| Styling | Tailwind v4 + tokens CSS custom | Glass via classes utilitaires + `@layer components`. |
| State | React local + server actions / SWR | Pas de Redux. |
| i18n | `next-intl` | `messages/{locale}.json`. |
| Tests E2E | Playwright | 1 worker en CI, retries=2. |
| Tests back | JUnit 5 + Spring Test + Testcontainers (Postgres) | Pas de mock DB (cf. §10). |
| Logging | JSON ECS (back natif Spring 3.4, front pino) | cf. §9. |
| CI | GitHub Actions | Lint + tests + build Docker. |
| Déploiement | Docker Compose (3 services) | Volume monté pour `instance.json` + volume `media_data`. |

### ⚠️ Gotcha n°1 — Next.js est un fork interne

Le frontend n'utilise **pas** la Next.js standard (cf. `AGENTS.md`). Les APIs peuvent différer. **Toujours lire `node_modules/next/dist/docs/` avant d'introduire un nouveau pattern Next.** Ne pas se fier à la doc Next.js publique.

### Variables d'environnement clés

```env
JWT_SECRET=<random-256-bits>
JWT_EXPIRATION=86400000
INSTANCE_CONFIG_PATH=/app/config/instance.json
SIGNUP_OPEN=false                 # si false, code d'invitation obligatoire au register
MEDIA_STORAGE_PATH=/app/media     # volume Docker media_data
MEDIA_USER_QUOTA_MB=100
MEDIA_INSTANCE_QUOTA_MB=5000
# Génération IA (provider OpenAI-compatible, défaut Groq) — clé optionnelle
codestar.ai.api-url / api-key / model / max-tokens / temperature / rate-limit
# Logging front (server-side)
LOG_LEVEL=info                    # debug en dev
LOG_PRETTY=true                   # false → JSON même en dev
```

### Autres risques connus

- **Liquid Glass** : contraste sur mesh coloré → variant `glass-strong` systématique au-dessus du texte + axe-core en CI.
- **`instance.json` modifié à chaud** : lu à chaque `GET /branding` (pas de cache backend) + invalidation front au save.
- **Codes d'invitation partagés** : TTL + quota d'usages + révocation admin.

---

## 3. Modèle de tenancy

| Aspect | Décision |
|---|---|
| Architecture | Single-tenant par déploiement Docker |
| Identité instance | Fichier `instance.json` (volume monté), lu au boot, exposé via `GET /api/v1/instance/branding` |
| Persistance branding | v1 : JSON manuel · v2 : `PATCH /instance/branding` réécrit le JSON (page UI à faire) |

Format `instance.json` :
```json
{
  "name": "Atelier 89",
  "tagline": "Studio open-source de cours",
  "logo": { "kind": "preset", "value": "star" },
  "accent": "#EAB12E",
  "heroTitle": "Apprenez à votre rythme.",
  "heroSubtitle": "…",
  "heroCta": "Commencer",
  "locale": "fr"
}
```

---

## 4. Rôles & matrice de permissions

> **Référence dure** — vérifiée contre les `@PreAuthorize` + services de permission.

5 rôles, hiérarchie `super-admin > admin > teacher > student > visitor`. Un rôle a strictement toutes les permissions des rôles inférieurs.

Légende : ✅ autorisé · ⚠️ autorisé sur ses propres ressources · ❌ refusé.

| Capacité | Visitor | Student | Teacher | Admin | Super-admin |
|---|:-:|:-:|:-:|:-:|:-:|
| **Auth** ||||||
| Voir landing publique | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer un compte (signup public) | ✅ | — | — | — | — |
| Rejoindre via code invitation | ⚠️ doit se connecter ensuite | ✅ | ✅ | ✅ | ✅ |
| Se connecter | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Catalogue & cours** ||||||
| Voir catalogue publié / lire un cours | ❌ | ✅ | ✅ | ✅ | ✅ |
| Progression / bookmarks / (notes v2) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Répondre aux quiz | ❌ | ✅ | ✅ (preview) | ✅ (preview) | ✅ |
| Créer un cours | ❌ | ❌ | ✅ | ✅ | ✅ |
| Éditer / publier / supprimer un cours | ❌ | ❌ | ⚠️ ses cours | ✅ | ✅ |
| Lister **tous** les cours (`all=true`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Groupes** ||||||
| Voir mes groupes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Créer / éditer / supprimer un groupe | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gérer invitations / curriculum / membres | ❌ | ❌ | ⚠️ groupes qu'il gère | ✅ | ✅ |
| **Utilisateurs (admin)** ||||||
| Lister les utilisateurs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Promouvoir / rétrograder rôles | ❌ | ❌ | ❌ | ⚠️ rôles sous lui | ✅ |
| Désactiver / réactiver un utilisateur | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Settings & branding** ||||||
| Lire les settings (`max_blocks_per_page`) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Modifier les settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modifier le branding | ❌ | ❌ | ❌ | ✅ | ✅ |
| Retirer la mention `★ Codestar` | — | — | — | — | ❌ (figé licence) |
| **Médias** ||||||
| Uploader un média | ❌ | ❌ | ✅ | ✅ | ✅ |
| Lire un média (`GET /media/{id}`) | ✅ public | ✅ | ✅ | ✅ | ✅ |
| **Génération IA** ||||||
| Générer un cours via IA | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Gamification (v3, non implémenté)** ||||||
| Voir classement / reset saison | ❌ | ✅ / ❌ | ✅ / ⚠️ | ✅ | ✅ |
| Exporter CSV stats (commenté) | ❌ | ❌ | ⚠️ ses groupes | ✅ | ✅ |

**Implémentation Spring Security** : enum `Role { VISITOR, STUDENT, TEACHER, ADMIN, SUPER_ADMIN }` · `@PreAuthorize("hasAnyRole(...)")` au contrôleur · permissions `⚠️` = check programmatique dans les services `@coursePermissionService` / `@groupPermissionService` / `@invitationPermissionService` · claim `role` dans le JWT.

---

## 5. Backend

### 5.1 Conventions API

- **Préfixe global** : `/api/v1`.
- **Enveloppe** : toutes les réponses dans `ApiResponseDto<T> { success, message, data }`. **Exception** : `GET /media/{id}` renvoie le binaire brut (`Resource`).
- **Auth** : JWT Bearer (`Authorization: Bearer <token>`), sessions `STATELESS`.
- **Routes publiques** (`permitAll`, cf. `SecurityConfig`) : `POST /auth/login`, `POST /auth/register`, `GET /instance/branding`, `GET /media/**`, Swagger (`/v3/api-docs/**`, `/swagger-ui/**`). **Toute autre route = `authenticated()` (≥ Student)** même sans `@PreAuthorize` explicite.
- **Mapping rôles** : `Student+` = tout authentifié · `Teacher+` = TEACHER/ADMIN/SUPER_ADMIN · `Admin+` = ADMIN/SUPER_ADMIN.

### 5.2 Endpoints

> **Référence dure** — régénérée depuis les contrôleurs (`@*Mapping` + `@PreAuthorize`). **48 endpoints implémentés**.

**Auth** — `AuthController` (`/api/v1/auth`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | `LoginRequestDto {email, password}` → `{token, type:"Bearer"}` |
| POST | `/auth/register` | Public | `RegisterRequestDto {email, password, displayName, invitationCode?}` → 201 + JWT. Code **obligatoire si `SIGNUP_OPEN=false`**. Crée un `STUDENT` |
| GET | `/auth/me` | Authentifié | `MeResponseDto {id, email, displayName, role, createdAt, groups[]}` |
| POST | `/auth/logout` | Authentifié | 204. **No-op stateless** (TODO blacklist JWT) |

**Courses** — `CourseController` (`/api/v1/courses`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/courses` | Student+ | Query `all, status, category, level, author, q`. `all=true` → **Admin+ requis** |
| GET | `/courses/mine` | Teacher+ | Cours dont je suis l'auteur |
| GET | `/courses/{slug}` | Student+ | `CourseDto` (par slug) |
| GET | `/courses/{id}/pages` | Student+ | `List<CoursePageDto>` (modèle Course→Page→Bloc) |
| POST | `/courses` | Teacher+ | `CreateCourseRequestDto` → 201 |
| POST | `/courses/{id}/duplicate` | Teacher+ ⚠️ `canEditCourse` | 201 |
| PATCH | `/courses/{id}` | ⚠️ `canEditCourse` | `UpdateCourseRequestDto` |
| POST | `/courses/{id}/status` | ⚠️ `canEditCourse` | `UpdateCourseStatusRequestDto {status}` |
| DELETE | `/courses/{id}` | ⚠️ `canEditCourse` | Archive (soft) |
| PUT | `/courses/{id}/pages` | ⚠️ `canEditCourse` | `SavePagesRequestDto` — **remplacement complet** des pages/blocs |
| GET | `/courses/{id}/export` | ⚠️ `canEditCourse` | `CourseExportDto` (JSON §6, version 1) |
| POST | `/courses/import` | Teacher+ | `CoursePayloadDto` → 201 (`DRAFT`, slugify + collision) |

**Enrollments** — `EnrollmentController` (`/api/v1/enrollments`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/enrollments/mine` | Authentifié | `List<EnrollmentDto>` |
| POST | `/enrollments/{courseId}/progress` | Authentifié | `UpdateProgressRequestDto {progress: 0..1}` (upsert) |

**Bookmarks** — `BookmarkController` (`/api/v1/bookmarks`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/bookmarks` | Authentifié | `CreateBookmarkRequestDto` → 201 |
| DELETE | `/bookmarks/{id}` | Authentifié (propriétaire) | — |
| GET | `/bookmarks/mine` | Authentifié | `List<BookmarkEnrichedDto>` |
| GET | `/bookmarks?courseId={uuid}` | Authentifié | Favoris pour un cours |

**Groups** — `GroupController` (`/api/v1/groups`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/groups` | Admin+ | Tous les groupes |
| GET | `/groups/mine` | Authentifié | Mes groupes |
| GET | `/groups/{id}` | Admin+ | `GroupResponseDto` |
| POST | `/groups` | Admin+ | `CreateGroupRequestDto` → 201 |
| PATCH | `/groups/{id}` | Admin+ | `UpdateGroupRequestDto` |
| DELETE | `/groups/{id}` | Admin+ | — |
| POST | `/groups/join` | Authentifié | `JoinGroupRequestDto {code}` → `groupId` rejoint |
| POST | `/groups/{groupId}/invitations` | ⚠️ `canManageGroup` | `CreateInvitationRequestDto {maxUses, expiresAt?}` → 201 |
| GET | `/groups/{groupId}/invitations` | ⚠️ `canManageGroup` | Query `includeRevoked` (def. false) |
| GET | `/groups/{groupId}/curriculum` | ⚠️ `isGroupMember` | `List<CourseSummaryDto>` |
| PUT | `/groups/{groupId}/curriculum` | ⚠️ `canManageGroup` | Remplacement complet |
| GET | `/groups/{groupId}/members` | ⚠️ `canManageGroup` | `List<GroupMemberDto>` |
| DELETE | `/groups/{groupId}/members/{userId}` | ⚠️ `canManageGroup` | Retire un membre |
| PATCH | `/groups/{groupId}/members/{userId}` | ⚠️ `canManageGroup` | `UpdateGroupMemberRoleRequestDto {roleInGroup}` |
| ~~GET~~ | ~~`/groups/{groupId}/stats/export.csv`~~ | ⚠️ `canManageGroup` | ❌ **commenté** (TODO export CSV) |

**Invitations** — `InvitationController` (`/api/v1/invitations`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| DELETE | `/invitations/{id}` | ⚠️ `canRevoke` (créateur ou Admin) | Révoque un code |

**Users** — `UserController` (`/api/v1/users`) — classe entière `Admin+`

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/users` | Admin+ | Query `role, disabled, q` |
| PATCH | `/users/{id}/role` | Admin+ | `UpdateUserRoleRequestDto {role}` (un admin promeut seulement sous lui) |
| POST | `/users/{id}/disable` | Admin+ | Désactive |
| POST | `/users/{id}/enable` | Admin+ | Réactive |

**Settings** — `SettingsController` (`/api/v1/settings`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/settings` | Teacher+ | `SettingsDto` (l'éditeur lit `max_blocks_per_page`). TODO restreindre après fusion avec `instance` |
| PATCH | `/settings` | Admin+ | `UpdateSettingsRequestDto` (borne `max_blocks_per_page` 1–1000) |

**Media** — `MediaController` (`/api/v1/media`) — cf. §5.3

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/media` | Teacher+ | multipart `file` (png/jpg/webp/gif, ≤ 5 MB) → 201 `{id, url}` |
| GET | `/media/{id}` | Public | Binaire brut. Headers `Cache-Control: immutable 1 an`, `ETag`, `nosniff`, `Content-Disposition: inline` |

**Instance** — `InstanceController` (`/api/v1/instance`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/instance/branding` | Public | `InstanceBrandingDto` (lit `instance.json`, pas de cache) |
| PATCH | `/instance/branding` | Admin+ | `UpdateBrandingRequestDto` → réécrit `instance.json` |

**AI** — `AiCourseController` (`/api/v1/ai/courses`) — cf. §5.4

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/ai/courses/generate` | Teacher+ | `GenerateCourseRequestDto {topic, level, language?, keyIdeas?}` → `CoursePayloadDto` (DRAFT, re-postable sur `/courses/import`). Rate-limité par user |

**Non implémenté (roadmap)** : ❌ Gamification v3 (`/quiz/*`, `/leaderboard`, `/me/stats`) · ⚠️ Logout no-op.

### 5.3 Médias

Stockage **filesystem** (volume Docker `media_data`, `MEDIA_STORAGE_PATH`). Choix adapté au single-tenant / petite échelle ; `MediaStorageService` isolé → bascule MinIO/S3 ultérieure sans toucher aux contrôleurs (déclencheur = scale horizontal ≥ 2 replicas).

- Types : png/jpg/webp/gif, **SVG exclu** (XSS), ≤ 5 MB.
- Bloc `IMAGE.src` accepte une URL https **ou** un chemin interne `/api/v1/media/{uuid.ext}`.
- Le navigateur charge via une **route proxy Next** (`app/api/v1/media/[id]/route.ts`) car le backend Docker n'est pas joignable directement.
- Durcissement P0 livré : type réel par **magic-bytes**, `nosniff` + `Content-Disposition: inline`, garde decompression-bomb, écriture atomique, cache immutable + ETag.
- `GET /media/**` en `permitAll` (capability-URL : id = UUIDv4 opaque, pas de listing). Tradeoff : images **non gated** par cours → OK pour illustrations, **pas** pour média privé/PII.
- Anti-abus livré côté upload : rate-limit + quota disque user/instance. Anti-abus du GET = délégué à l'edge (reverse proxy / CDN), différé.
- **Reste à faire** : GC des médias orphelins (marking + job `@Scheduled`), quota atomique anti-race, re-encodage/variantes (P2/P3).

### 5.4 Génération IA de cours (backend livré, front à faire)

- `POST /ai/courses/generate` (Teacher+) renvoie un **`CoursePayloadDto`** — **le même DTO que `POST /courses/import`** → le front le re-POSTe verbatim sur `/import`, dont la validation (`BlockPayloadValidator`) reste le garde-fou unique. Pas de risque de drift.
- **Provider** : API OpenAI-compatible (défaut **Groq** `llama-3.3-70b-versatile`), via `RestClient`, `response_format=json_object`. Config `codestar.ai.*` 100% env. **Clé optionnelle** : si absente → 502 « misconfigured ».
- **Prompt système** externalisé (`resources/prompts/course-system.txt`, fail-fast au boot). Shapes alignées sur `BlockPayloadValidator`. IMAGE = URL https publique réelle uniquement.
- **Sécurité** : gate Teacher+ ; rate-limiter token-bucket par user ; anti-injection par **barrière à nonce aléatoire** par requête ; `sanitize()` en défense de profondeur. Observabilité via `AuditLogger` (jamais clé ni payload).

---

## 6. Course Builder

> Point critique du produit. Éditeur 3 colonnes livré (`components/admin/course-editor.tsx` + registry `components/block-kinds/`), monté sur `/admin/courses/[id]/blocks`.

**Modèle** : Course → **Page** → Bloc. Table `course_pages` ; `course_blocks` a `page_id` (FK CASCADE) + `course_id` dénormalisé. Cohérence garantie par écritures **full-replace** (`PUT /courses/{id}/pages`).

**Kinds + schéma payload** (JSONB, clés strictes, validateur rejette toute clé inconnue) :

```
H1 / H2 / H3   { text }
P              { text }
CODE           { code, language }
CALLOUT        { text, tone }   tone ∈ neutral|warning|danger|success|green|tip
QUOTE          { text, author?, source? }
IMAGE          { src(https ou /api/v1/media/...), alt }
TABLE          { header: string[], rows: string[][] }   // rectangulaire, ≤12 col / ≤100 lignes
QUIZ           { question, options: string[2..10], correctIndex: int, explanation? }
SANDBOX        { language, code, readonly?, expectedOutput? }   // stockage seul, pas d'exec en v1
```

- AUDIO/VIDEO retirés pour l'instant.
- Les 6 callouts sont surfacés comme entrées distinctes dans la palette d'insertion (préremplit `tone`).
- Drag-drop via `@dnd-kit` ; autosave debounced 1.5s → `PUT /courses/{id}/pages` ; import/export JSON dans la toolbar ; garde `beforeunload` si modifs non sauvegardées.
- `max_blocks_per_page` configurable (table `app_settings`, `GET/PATCH /settings`, borne 1–1000, `MAX_PAGES=200`). La palette se désactive quand la page est pleine.

**Contrat JSON import/export/IA** (versionné, contrat unique) :
```json
{
  "version": 1,
  "course": { "title", "slug", "description", "category", "level" },
  "pages": [ { "title", "blocks": [ { "kind", "payload" } ] } ]
}
```
`version` = version **du format JSON**. Source de vérité : `CourseExportDto.CURRENT_VERSION` (back) ↔ `COURSE_PAYLOAD_VERSION` (front, `lib/types.ts`) — **toujours aligner les deux**. L'import rejette toute autre valeur. Incrémenter à chaque changement incompatible de l'enveloppe.

**Limites connues** : autosave all-or-nothing (un champ requis vide fait échouer la sauvegarde du cours, 400) ; sauvegarder remplace tous les blocs → les bookmarks pointant d'anciens blocs sont supprimés (cascade FK, réconciliation par contenu à faire).

---

## 7. Frontend

### 7.1 Direction Artistique — Liquid Glass (Citron)

> DA à tester : `Design Liquid Glass Citron Dark`. Couvre modes **clair** et **sombre**.

Concept de couleur : **citron `#EAB12E`** (résonne avec le logo étoile pixel-art).

Tout le front est à refaire, nous devons donc faire des tests pour convenir de la future DA.

La home page ne doit pas être défilable et rester moderne tout en accueillant le visiteur avec la qualité d'UX des plus gros sites. Les autres pages suiveront cet exemple de DA : simpliste et moderne.

Aucune dépendance n'a été actée. Le but est aussi que tu nous proposes des librairies comme zod, tanstack, intl-next, etc... pour améliorer le front end.

### 7.2 Pages

| Route | Rôle | Description | Statut |
|---|---|---|---|
| `/` | Visitor | Landing glass : hero + 3 cours featured + 3 piliers + CTA + footer figé | ✅ |
| `/login` | Public | 3 modes signin/signup/join (state local), split layout, mobile-first | ✅ |
| `/home` | Student | Hero greeting + Reprendre + Découvrir (curriculum des groupes) | ✅ |
| `/courses` · `/courses/[slug]` · `/read` | Student+ | Catalogue + lecteur 3 colonnes (TOC sticky / bottom-sheet mobile, blocs rendus par kind) | ✅ |
| `/my-courses` | Student | Enrollments groupés (en cours / terminés / à démarrer), tri `last_activity_at` | ✅ |
| `/me/dash` | Student | Dashboard progrès (donuts, activité 30j, badges) | ✅ |
| `/bookmarks` | Authentifié | Mes favoris | ✅ |
| `/admin` | Admin+ | Dashboard (KPI, table cours) | ✅ |
| `/admin/courses` (+ `[id]/blocks`) | Teacher+ | Liste + **éditeur 3 colonnes** (palette / canvas dnd / inspector) | ✅ |
| `/admin/groups/[id]/{members,curriculum}` | Admin+ ⚠️ | Gestion membres + curriculum | ✅ |
| `/admin/users` | Admin+ | Gestion utilisateurs (rôle, disable/enable) | ✅ |
| `/admin/settings` | Admin+ | `max_blocks_per_page` | ✅ |
| `/admin/branding` | Admin+ | Live preview branding | ❌ API prête, UI à faire |


### 7.3 Roadmap

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

---

## 8. Migrations

Actuellement **une seule** migration Flyway : `V001.sql` (users, groups, group_memberships, invitation_codes, courses, course_pages, course_blocks, group_curriculum, enrollments, bookmarks, app_settings, media_assets). Pas encore de split par PR.

⚠️ `V001.sql` est **éditée en place** (pré-déploiement → checksum modifié) : sur une DB déjà initialisée, **reset requis** (`flyway clean` / volume neuf).

**Convention dès qu'on vise la prod** : `V001__init.sql`, `V002__*.sql`… une migration = une PR, **jamais** de modification rétroactive d'une migration mergée.

---

## 9. Observabilité & logging (back + front)

Principe **12-factor** : les deux apps logguent sur **stdout/stderr** (JSON en prod), Docker/agrégateur capture. Format aligné **ECS** (Elastic Common Schema) back et front → corrélation possible.

### 9.1 Backend (livré)

- Logging structuré **JSON natif Spring Boot 3.4** (`logging.structured.format.console=ecs` sur profil `prod`). Dev = texte coloré.
- Corrélation **MDC** : `requestId` (header `X-Request-Id` ou UUID, renvoyé au client) posé par `RequestContextFilter` ; `userId` ajouté par `JwtAuthenticationFilter`. `MDC.clear()` en `finally` (anti-fuite entre threads Tomcat réutilisés).
- **`AuditLogger`** (bean, logger dédié `audit`) : ~28 events métier sur les mutations (Course, User, Group, Invitation, Settings, Branding, Media, bootstrap, 403). `action` obligatoire + ids typés. **Jamais** de secret/PII (login échoué = email **hashé**).
- Access log : une ligne par requête (`method path → status (durée)`), path seul. `/actuator` skippé.
- Reste : audit anti-fuite complet, rotation/shipping (docker-compose + `DEPLOYMENT.md`), tests logging.

### 9.2 Frontend — `lib/logger.ts` (server-side only)

- **pino** + `@elastic/ecs-pino-format`, marqué `"server-only"` (jamais bundlé client).
- ECS en prod (même `serviceName: "frontend"`, format aligné back) ; `pino-pretty` lisible en dev.
- **Redaction** : `authorization, cookie, token, accessToken, password, secret, email` (+ variantes imbriquées) → `[redacted]`.
- API par scope : `logger.{error,warn,info,debug}(scope, message, context?)`. Niveau via `LOG_LEVEL`, pretty via `LOG_PRETTY`.
- Erreurs : passer l'objet sous la clé `err` (sinon le serializer perd `message`/`stack`).
- ⚠️ **Server-side uniquement** : pas de logging client navigateur (à arbitrer si besoin).

---

## 10. Tests

État : back = `BackendApplicationTests` (smoke) seul ; front = Playwright sur branche non mergée. Stratégie cadrée, à implémenter.

**Pyramide** (JUnit 5 = socle de tous les tests) :

| Niveau | Outils (+ JUnit) | Pour quoi |
|---|---|---|
| Unitaire | Mockito | logique pure, branches, validators |
| Slice | Spring Test (`@WebMvcTest`, `@DataJpaTest`) | couche web / repo + SQL |
| Intégration | Spring Test + **Testcontainers** | routing→validation→sécurité→DB |

**Testcontainers, pas H2** : le projet utilise JSONB + dialecte Postgres + Flyway `validate` → H2 simule mal (faux positifs). Testcontainers lance un vrai `postgres:16-alpine`, `@ServiceConnection` câble la datasource, Flyway applique `V001.sql` → test contre le **vrai schéma**.

**Cibles backend (roadmap B8–B12)** : socle `IntegrationTest` (B8) → `GroupPermissionService` unitaire (B12, quick-win sécurité) → `AuthController` intégration (B9) → `InvitationService` (B11) → `GroupService` (B10). Convention : tests d'intégration `*IT`, unitaires/slice `*Test`. Spring Boot 3.4 : `@MockitoBean` (pas `@MockBean`).

**Frontend (F1–F5)** : Playwright, 3 flows critiques v1 (signup, login, join groupe) + flows v2 (lecture cours, progression, branding). À merger.

---

## 11. Règle de maintenance de cette doc

> **Toute PR doit mettre à jour ce hand-off dans le même commit.**
> En particulier : la **matrice de permissions** (§4), la **table des endpoints** (§5.2) et l'**état des fonctionnalités** (§1). Une feature livrée — nouveau endpoint, changement de rôle, nouvelle page, migration — **sans** mise à jour de la doc est une PR **incomplète**.

**Fin du hand-off.** Toute décision technique ultérieure : consignée dans la PR + ici.

// TODO gestion JWT cookie + redis