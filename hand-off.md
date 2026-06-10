# Codestar — Hand-off & Roadmap

> Dernière mise à jour : 2026-06-10

---

## 0. État d'avancement (au 2026-06-01)

Branche active : `dev`. Phase v1 **terminée**, phase v2 **largement avancée** (backend + frontend des cours, progression, bookmarks, curriculum, gestion users/groupes, branding API). Restent surtout : page UI branding, tests, et toute la phase v3.

### Backend — fait

- Migration Flyway `V001.sql` (fichier unique, **pas** split par PR comme prévu) : `users`, `groups`, `group_memberships`, `invitation_codes`, `courses`, `course_blocks`, `group_curriculum`, `enrollments`, `bookmarks`.
- Spring Security : JWT (`JwtAuthenticationFilter`, `JwtUtils`), `@PreAuthorize` par rôle, services de permission programmatiques (`CoursePermissionService`, `GroupPermissionService`, `InvitationPermissionService`), bootstrap super-admin (`SuperAdminBootstrap`).
- Auth : `POST /auth/{login,register,logout}`, `GET /auth/me`.
- Groupes : CRUD complet + `join` + invitations (create/list) + curriculum (get/put) + membres (list/delete/patch rôle).
- Invitations : `DELETE /invitations/{id}` (permission créateur/admin).
- Cours : list / mine / slug / get-pages / create / **duplicate** / patch / status / delete / put-pages / **export** / **import**. Validation payload via `BlockPayloadValidator`, filtres via `CourseSpecifications`. (Modèle Course→Page→Bloc, cf. §11.4ter — `/blocks` remplacé par `/pages`.)
- Enrollments : `GET /mine`, `POST /{courseId}/progress` (upsert).
- Bookmarks : post / delete / mine / get.
- Instance branding : `GET` + `PATCH /instance/branding`.
- **Users (admin)** : `GET /users`, `PATCH /{id}/role`, `POST /{id}/{disable,enable}` — hors roadmap initiale, anticipe `/admin/users`.
- **Settings** : `GET /settings` (Teacher+), `PATCH /settings` (Admin+) — `app_settings` key/value, `max_blocks_per_page` (cf. §11.4ter).
- **Media** : `POST /media` (Teacher+), `GET /media/{id}` (public) — cf. §12.
- OpenAPI/Swagger (`OpenApiConfig`).

### Backend — reste à faire

- **Notes** : aucun modèle ni endpoint (`/notes/*` de la roadmap v2 non implémenté).
- **Export CSV stats** : `GroupStatsService` existe mais endpoint `GET /groups/{id}/stats/export.csv` commenté (TODO).
- **Gamification v3** : quiz attempts, leaderboard, XP, streak — rien.
- **OAuth v3** : Google/GitHub — rien.
- **Tests** : seulement `BackendApplicationTests` (smoke). Pas de Testcontainers, pas de tests Auth/Group/Invitation/Permission.

### Frontend — fait

- Tokens Liquid Glass dans `globals.css` + `<MeshBackground>` + lib composants glass (`GlassCard/Button/Input/Chip/Nav`).
- i18n `next-intl` opérationnel : `messages/en.json` + `messages/fr.json`, `i18n/{request,routing}.ts`, `<LocaleSwitcher>`.
- Providers : `auth-provider`, `branding-provider`. Server actions pour toutes les ressources (`app/actions/*`).
- Pages : `/` (landing), `/login` (signin/signup/join), `/home`, `/courses`, `/courses/[slug]`, `/courses/[slug]/read` (lecteur), `/my-courses`, `/me/dash`, `/bookmarks`.
- Admin : `/admin` (dashboard), `/admin/courses` (list/new/[id]/[id]/blocks), `/admin/groups/[id]/{members,curriculum}`, `/admin/users`. `role-guard` côté front.
- Rendu des blocs : callout / code / heading / image / media / paragraph / quiz.

### Frontend — reste à faire

- **Page `/admin/branding`** (live preview) : absente, alors que l'API `PATCH /branding` existe.
- **`/leaderboard`** (v3).
- **Éditeur drag-drop complet** : `blocks-editor` actuel est minimaliste (pas de DnD/inspector/autosave de l'écran 9).
- **Tests Playwright** : aucun sur `dev` (présents sur la branche séparée `add-playwright-tests`, non mergée).

---

## 1. Vision produit

**Codestar** est une plateforme e-learning **open-source, self-hostable**. Chaque organisation (école, studio, club) déploie sa propre instance Docker et obtient une plateforme d'apprentissage gamifiée, brandable, à son nom.

- Une instance = un déploiement = une organisation. Pas de SaaS centralisé.
- Branding personnalisable par l'instance (couleur, logo, hero, polices).
- Mention `[logo] Codestar` figée par la licence GPLv3 - non retirable via l'UI.
- Public cible : 50–5 000 apprenants par instance.

### Principes design (fixes)

1. **Liquid Glass complet** — vitres translucides (`backdrop-filter: blur`), palette pastel iOS, accents doux.
2. **Chaleureux + professionnel** — pas de néon, pas de flat brutalisme. Référence : Apple Vision OS, Linear, Arc Browser.
3. **Mobile-first dès v1** sur toutes les pages.
4. **Accessibilité WCAG AA** — contraste vérifié sur palette pastel, focus visibles, ARIA correct.
5. **i18n prête dès v1** — `next-intl`, langage par defaut en anglais et rajout de la langue française dès la v1.
6. **light / dark mode** dès la v1. 

---

## 2. Modèle de tenancy

| Aspect | Décision |
|---|---|
| Architecture | Single-tenant par déploiement Docker |
| Identité instance | Fichier `instance.json` (volume Docker monté), lu au boot par le backend, exposé via `GET /api/instance/branding` |
| Persistance branding | Phase v1 : JSON manuel · Phase v2 : page Branding super-admin réécrit le JSON |
| `[Logo] Codestar` | Footer figé dans le composant `<SiteFooter />`, non paramétrable, imposé par licence GPLv3 |

**Format `instance.json` v1** :
```json
{
  "name": "Atelier 89",
  "tagline": "Studio open-source de cours",
  "logo": { "kind": "preset", "value": "star" },
  "accent": "#7AA9FF",
  "heroTitle": "Apprenez à votre rythme.",
  "heroSubtitle": "…",
  "heroCta": "Commencer",
  "locale": "fr"
}
```

---

## 3. Rôles & matrice de permissions

5 rôles. Hiérarchie : `super-admin > admin > teacher > student > visitor`. Un super-admin a strictement toutes les permissions des rôles inférieurs.

### Matrice complète

Légende : ✅ = autorisé · ⚠️ = autorisé sur ses propres ressources · ❌ = refusé

| Capacité | Visitor | Student | Teacher | Admin | Super-admin |
|---|:-:|:-:|:-:|:-:|:-:|
| **Auth** ||||||
| Voir landing publique | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer un compte (signup public) | ✅ | — | — | — | — |
| Rejoindre via code invitation groupe | ⚠️ doit se connecter par la suite | ✅ | ✅ | ✅ | ✅ |
| Se connecter | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Catalogue & cours** ||||||
| Voir catalogue cours publiés | ❌ | ✅ | ✅ | ✅ | ✅ |
| Lire un cours | ❌ | ✅ | ✅ | ✅ | ✅ |
| Marquer progression / bookmarks / notes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Répondre aux quiz | ❌ | ✅ | ✅ (en mode preview) | ✅ (en preview) | ✅ |
| Créer un cours | ❌ | ❌ | ✅ | ✅ | ✅ |
| Éditer un cours | ❌ | ❌ | ⚠️ ses cours | ✅ | ✅ |
| Publier / dépublier un cours | ❌ | ❌ | ⚠️ ses cours | ✅ | ✅ |
| Supprimer un cours | ❌ | ❌ | ⚠️ ses cours | ✅ | ✅ |
| **Groupes** ||||||
| Voir les groupes auxquelles je suis inscrit | ❌ | ✅ | ✅ | ✅ | ✅ |
| Créer / éditer une groupe | ❌ | ❌ | ❌ | ✅ | ✅ |
| Assigner un cours à un groupe | ❌ | ❌ | ✅ (sur groupe qu'il anime) | ✅ | ✅ |
| Générer / révoquer codes d'invitation | ❌ | ❌ | ⚠️ pour ses groupes | ✅ | ✅ |
| **Utilisateurs** ||||||
| Voir liste des étudiants d'un groupe | ❌ | ❌ | ⚠️ ses groupes | ✅ | ✅ |
| Promouvoir / rétrograder rôles | ❌ | ❌ | ❌ | ⚠️ les roles inférieurs à lui | ✅ |
| Désactiver / supprimer un utilisateur | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gamification** ||||||
| Voir classement (groupe / global) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Réinitialiser saison/classement | ❌ | ❌ | ⚠️ ses groupes | ✅ | ✅ |
| **Branding & instance** ||||||
| Modifier branding (couleur, logo, hero, polices) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modifier paramètres instance (locale, signup ouvert/fermé, OAuth providers) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Retirer mention `[Logo] Codestar` | — | — | — | — | ❌ (figé licence) |
| Voir le dashboard admin (KPI, inscriptions, top cours) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exporter CSV stats | ❌ | ❌ | ⚠️ ses groupes | ✅ | ✅ |

### Implémentation Spring Security

- Enum `Role { VISITOR, STUDENT, TEACHER, ADMIN, SUPER_ADMIN }` ordonnée pour comparaison `.ordinal()`.
- Annotation `@PreAuthorize("hasRole('TEACHER')")` au niveau contrôleur.
- Pour les permissions `⚠️ ses ressources` : combiner `@PreAuthorize` + check programmatique dans le service (`courseAuthor.equals(currentUser)`).
- JWT claim `role` dans le token.

---

## 4. Modèle de données (entités v1 + v2 + v3)

> Implémenté en une seule migration `V001.sql` (v1 + v2). `Note` non implémentée. v3 (gamification) pas encore en DB. Champs réels ajoutés vs draft : `enrollments.last_block_id`, `enrollments.last_activity_at`, contrainte unique `bookmarks (user_id, block_id)`.

### v1 (auth + groupes)

```
User
 ├── id (UUID)
 ├── email (unique)
 ├── password_hash
 ├── display_name
 ├── role (enum)
 ├── created_at
 └── disabled_at (nullable)

Groups
 ├── id (UUID)
 ├── name
 ├── slug (unique)
 ├── starts_at
 ├── ends_at
 ├── created_by (User.id)
 └── created_at

GroupMembership
 ├── user_id (FK User)
 ├── group_id (FK Group)
 ├── joined_at
 ├── role_in_group (enum: STUDENT | TEACHER)
 └── PK (user_id, group_id)

InvitationCode
 ├── id (UUID)
 ├── code (unique, format XXXX-XXXX-XXXX)
 ├── group_id (FK Group)
 ├── max_uses (int, default 1)
 ├── used_count (int, default 0)
 ├── expires_at (nullable)
 ├── created_by (User.id)
 ├── created_at
 └── revoked_at (nullable)
```

### v2 (cours + progression + branding)

```
Course
 ├── id (UUID)
 ├── slug (unique)
 ├── title
 ├── description
 ├── category
 ├── level (enum)
 ├── cover_color
 ├── emoji
 ├── author_id (FK User)
 ├── status (DRAFT | PUBLISHED | ARCHIVED)
 ├── created_at
 ├── updated_at
 └── published_at (nullable)

CourseBlock
 ├── id (UUID)
 ├── course_id (FK Course)
 ├── order_index (int)
 ├── kind (enum: H1, H2, H3, P, CODE, CALLOUT, QUOTE, IMAGE, IFRAME, TABLE, QUIZ, SANDBOX)
 ├── payload (JSONB) — contenu spécifique au kind (cf. §11 Course Builder)
 └── created_at

GroupCurriculum
 ├── group_id (FK Group)
 ├── course_id (FK Course)
 ├── added_at
 └── PK (group_id, course_id)

Enrollment
 ├── user_id (FK User)
 ├── course_id (FK Course)
 ├── progress (decimal 0..1)
 ├── started_at
 ├── completed_at (nullable)
 └── PK (user_id, course_id)

Bookmark
 ├── id (UUID)
 ├── user_id (FK User)
 ├── course_id (FK Course)
 ├── block_id (FK CourseBlock)
 └── created_at

Note
 ├── id (UUID)
 ├── user_id
 ├── course_id
 ├── block_id
 ├── content (text)
 └── updated_at
```

### v3 (gamification)

```
QuizAttempt
 ├── id (UUID)
 ├── user_id
 ├── block_id (FK CourseBlock kind=QUIZ)
 ├── selected_option (int)
 ├── correct (bool)
 ├── xp_awarded (int)
 └── attempted_at

XpEvent
 ├── id (UUID)
 ├── user_id
 ├── source (enum: COURSE_COMPLETED | QUIZ_CORRECT | STREAK_BONUS)
 ├── source_ref (UUID)
 ├── xp (int)
 └── created_at

Streak
 ├── user_id (PK)
 ├── current_days (int)
 ├── longest_days (int)
 ├── last_active_date (date)
 └── updated_at
```

### Schéma de migration à determiner

Flyway versionné `V001__init.sql`, `V002__groups.sql`, etc. Une migration = une PR. Pas de modification rétroactive d'une migration mergée.

---

## 5. API REST

> **Inventaire exhaustif au niveau code** (branche `feat/images-management`). Source = annotations `@*Mapping` + `@PreAuthorize` des contrôleurs. Préfixe global `/api/v1`. **33 endpoints implémentés**, regroupés par ressource.

### Conventions

- **Enveloppe** : toutes les réponses dans `ApiResponseDto<T> { success, message, data }`. **Exception** : `GET /media/{id}` renvoie le binaire brut (`Resource`), hors enveloppe.
- **Auth** : JWT Bearer (`Authorization: Bearer <token>`), sessions `STATELESS`. Token via `POST /auth/{login,register}`.
- **Routes publiques** (`permitAll`, cf. `SecurityConfig`) : `POST /auth/login`, `POST /auth/register`, `GET /instance/branding`, `GET /media/**`, Swagger (`/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`). **Toute autre route = `authenticated()`** (≥ Student) même sans `@PreAuthorize` explicite.
- **Rôles** : `Student+` = tout authentifié · `Teacher+` = TEACHER/ADMIN/SUPER_ADMIN · `Admin+` = ADMIN/SUPER_ADMIN. Les `⚠️` = check programmatique (services `@coursePermissionService`/`@groupPermissionService`/`@invitationPermissionService`).
- **Légende statut** : ✅ implémenté · 🟡 partiel · ❌ non implémenté.

### Auth — `AuthController` (`/api/v1/auth`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | `LoginRequestDto {email, password}` → `LoginResponseDto {token, type:"Bearer"}` |
| POST | `/auth/register` | Public | `RegisterRequestDto {email, password, displayName, invitationCode?}` → 201 + JWT. `invitationCode` **obligatoire si `SIGNUP_OPEN=false`**. Crée un user `STUDENT` |
| GET | `/auth/me` | Authentifié | `MeResponseDto {id, email, displayName, role, createdAt, groups[]}` |
| POST | `/auth/logout` | Authentifié | 204 No Content. **No-op stateless** (TODO blacklist JWT, cf. B6) |

### Courses — `CourseController` (`/api/v1/courses`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/courses` | Student+ | Query : `all`, `status`, `category`, `level`, `author`(UUID), `q`. `all=true` → **Admin+ requis**. `List<CourseSummaryDto>` |
| GET | `/courses/mine` | Teacher+ | Cours dont je suis l'auteur |
| GET | `/courses/{slug}` | Student+ | `CourseDto` (par slug) |
| GET | `/courses/{id}/pages` | Student+ | `List<CoursePageDto>` (modèle Course→Page→Bloc, cf. §11.4ter) |
| POST | `/courses` | Teacher+ | `CreateCourseRequestDto` → 201 `CourseDto` |
| POST | `/courses/{id}/duplicate` | Teacher+ ⚠️ `canEditCourse` | 201 `CourseDto` |
| PATCH | `/courses/{id}` | ⚠️ `canEditCourse` | `UpdateCourseRequestDto` |
| POST | `/courses/{id}/status` | ⚠️ `canEditCourse` | `UpdateCourseStatusRequestDto {status}` (remplace l'ancien `/publish`) |
| DELETE | `/courses/{id}` | ⚠️ `canEditCourse` | Archive le cours (soft) |
| PUT | `/courses/{id}/pages` | ⚠️ `canEditCourse` | `SavePagesRequestDto` — **remplacement complet** des pages/blocs (remplace l'ancien `/blocks`) |
| GET | `/courses/{id}/export` | ⚠️ `canEditCourse` | `CourseExportDto` (JSON §11.3, **version 2**) |
| POST | `/courses/import` | Teacher+ | `ImportCourseRequestDto` → 201 `CourseDto` (`DRAFT`, slugify + collision) |

### Enrollments — `EnrollmentController` (`/api/v1/enrollments`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/enrollments/mine` | Authentifié | `List<EnrollmentDto>` |
| POST | `/enrollments/{courseId}/progress` | Authentifié | `UpdateProgressRequestDto {progress: 0..1}` (upsert) |

### Bookmarks — `BookmarkController` (`/api/v1/bookmarks`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/bookmarks` | Authentifié | `CreateBookmarkRequestDto` → 201 `BookmarkDto` |
| DELETE | `/bookmarks/{id}` | Authentifié (propriétaire) | — |
| GET | `/bookmarks/mine` | Authentifié | `List<BookmarkEnrichedDto>` (tous mes favoris) |
| GET | `/bookmarks?courseId={uuid}` | Authentifié | `List<BookmarkEnrichedDto>` (mes favoris pour un cours) |

### Groups — `GroupController` (`/api/v1/groups`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/groups` | Admin+ | Liste tous les groupes |
| GET | `/groups/mine` | Authentifié | Mes groupes (`List<GroupSummaryDto>`) |
| GET | `/groups/{id}` | Admin+ | `GroupResponseDto` |
| POST | `/groups` | Admin+ | `CreateGroupRequestDto` → 201 |
| PATCH | `/groups/{id}` | Admin+ | `UpdateGroupRequestDto` (nom/dates) |
| DELETE | `/groups/{id}` | Admin+ | — |
| POST | `/groups/join` | Authentifié | `JoinGroupRequestDto {code}` → renvoie le `groupId` rejoint |
| POST | `/groups/{groupId}/invitations` | ⚠️ `canManageGroup` | `CreateInvitationRequestDto {maxUses, expiresAt?}` → 201 `InvitationResponseDto` |
| GET | `/groups/{groupId}/invitations` | ⚠️ `canManageGroup` | Query `includeRevoked` (def. `false`) |
| GET | `/groups/{groupId}/curriculum` | ⚠️ `isGroupMember` | `List<CourseSummaryDto>` |
| PUT | `/groups/{groupId}/curriculum` | ⚠️ `canManageGroup` | `UpdateCurriculumRequestDto` (remplacement complet) |
| GET | `/groups/{groupId}/members` | ⚠️ `canManageGroup` | `List<GroupMemberDto>` |
| DELETE | `/groups/{groupId}/members/{userId}` | ⚠️ `canManageGroup` | Retire un membre |
| PATCH | `/groups/{groupId}/members/{userId}` | ⚠️ `canManageGroup` | `UpdateGroupMemberRoleRequestDto {roleInGroup}` |
| ~~GET~~ | ~~`/groups/{groupId}/stats/export.csv`~~ | ⚠️ `canManageGroup` | ❌ **commenté** (TODO export CSV, cf. §2.15) |

### Invitations — `InvitationController` (`/api/v1/invitations`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| DELETE | `/invitations/{id}` | ⚠️ `canRevoke` (créateur ou Admin) | Révoque un code |

### Users — `UserController` (`/api/v1/users`) — classe entière `Admin+`

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/users` | Admin+ | Query : `role`, `disabled`, `q`. `List<UserSummaryDto>` |
| PATCH | `/users/{id}/role` | Admin+ | `UpdateUserRoleRequestDto {role}` (un admin ne peut promouvoir qu'en dessous de lui) |
| POST | `/users/{id}/disable` | Admin+ | Désactive |
| POST | `/users/{id}/enable` | Admin+ | Réactive |

### Settings — `SettingsController` (`/api/v1/settings`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/settings` | Teacher+ | `SettingsDto` (l'éditeur lit `max_blocks_per_page`). ⚠️ TODO : restreindre Teacher après fusion avec `instance` |
| PATCH | `/settings` | Admin+ | `UpdateSettingsRequestDto` (borne `max_blocks_per_page` 1–1000) |

### Media — `MediaController` (`/api/v1/media`) — cf. §12

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/media` | Teacher+ | multipart `file` (png/jpg/webp/gif, ≤ 5 MB) → 201 `MediaUploadDto {id, url}` |
| GET | `/media/{id}` | Public | Binaire brut (hors enveloppe). Headers : `Cache-Control: immutable 1 an`, `ETag`, `nosniff`, `Content-Disposition: inline` |

### Instance — `InstanceController` (`/api/v1/instance`)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| GET | `/instance/branding` | Public | `InstanceBrandingDto` (lit `instance.json`, pas de cache) |
| PATCH | `/instance/branding` | Admin+ | `UpdateBrandingRequestDto` → réécrit `instance.json` |

### Non implémenté (roadmap)

- ❌ **Notes** : `GET/PUT /notes/{courseId}/{blockId}` (v2) — table + contrôleur absents.
- ❌ **Export CSV stats** : `GET /groups/{groupId}/stats/export.csv` — code commenté dans `GroupController` (service `GroupStatsService` présent).
- ❌ **Gamification v3** : `POST /quiz/{blockId}/attempt`, `GET /leaderboard?scope={global,groups,friends}&season={current}`, `GET /me/stats`, `POST /admin/leaderboard/reset` — rien.
- ⚠️ **Logout** : route présente mais no-op (pas de blacklist).

> ⚠️ **Changements vs ancienne doc** : `/courses/{id}/blocks` → `/courses/{id}/pages` (modèle pages, §11.4ter) · `/courses/{id}/publish` → `/courses/{id}/status` · ajout `/courses/{id}/export` + `/courses/import` · ajout `/settings/*` · `/notes/*` jamais livré.

---

## 6. Spécifications UI (8 écrans)

### Écran 1 — Landing publique (Visitor) · `/`

Sections de haut en bas :

1. **TopNav glass sticky** — logo + nom instance, menu (Fonctionnalités · À propos), boutons `Se connecter` (outline) + `Rejoindre avec un code` (glass-primary).
2. **Hero** — typo display géante (`clamp(40px, 5.4vw, 68px)`), `instance.heroTitle`, sous-titre, CTA primary `instance.heroCta` → `/login`, CTA secondary `Voir le catalogue` → désactivé v1 (badge "bientôt").
3. **Cours mis en avant** — 3 cartes glass avec gradient pastel, emoji XL, chip catégorie, titre, auteur, note. Clic → `/login`. **v1 : utilise mock data ou cache (`COURSES` du draft) puis remplace en v2 par `GET /courses?featured=true`.**
4. **Trois piliers** — `Lecteur soigné` · `Progression motivante` · `Cours par des gens qui savent`. Cards glass avec icône pastel.
5. **CTA final** — gros card glass centrée, titre éditorial, bouton primary.
6. **Footer figé** — logo + nom instance + © + `[Logo] Codestar` (badge non éditable, lien vers le repo GitHub Codestar).

### Écran 2 — Login & Signup & Join · `/login`

3 modes dans la même page (state local) : `signin` · `signup` · `join`.

Layout split 50/50 desktop, 100% mobile :
- **Gauche (form)** — logo, h1 contextuel ("Bon retour." / "Créer un compte." / "Rejoindre votre groupe."), inputs glass.
  - **signin** : email + password + lien `Oublié ?` (désactivé v1) + boutons `Continuer avec Google/GitHub` masqués v1.
  - **signup** : email + password + (optionnel) `code d'invitation` si `instance.signupOpen=false` → obligatoire.
  - **join** : juste un input `code XXXX-XXXX-XXXX` → si user pas connecté, redirige vers signup pré-rempli avec le code.
- **Droite (decorative glass)** — gradient pastel, badge GitHub stars (mock v1), citation/témoignage, mini card streak.

Switching entre modes via tabs glass en haut du form.

### Écran 3 — HomePage Étudiant · `/home` (remplace `/feed` du draft)

Anciennement "Découvrir" dans le draft, renommée HomePage et placée en première position dans la nav étudiant.

Sections :

1. **Hero greeting** — date courte mono, `Bonjour {prénom},` + emphase italique sur le streak (`14 jours de série. Continuons.`). À droite : card glass avec XP total + Rang (cliquable → `/leaderboard`).
2. **Reprendre** — 3 cards (cours en cours, progress > 0 et < 1), barre de progression liquid, lien `Reprendre →`.
3. **Découvrir** — h2 + filtres topics (chips glass cliquables) + grille 3 colonnes (desktop) / 1 col (mobile) des cours du curriculum (intersection des groupes du user). Layout grid/list selon `instance.feedLayout`.

### Écran 4 — Mes cours · `/my-courses`

Vue **étudiant uniquement**. Liste tous les enrollments du user, groupés par statut :
- **En cours** (progress > 0 et < 1) — cards avec progress bar.
- **Terminés** (progress = 1) — cards plus discrètes, badge `Complété`.
- **À démarrer** (curriculum groupe non encore commencé) — cards "ghost", CTA `Commencer`.

Tri par `last_activity_at`. Filtre par groupe si user dans plusieurs groupes.

### Écran 5 — Lecteur de cours · `/courses/{slug}`

3 colonnes desktop (`260px 1fr 280px`), passe en stack mobile avec TOC en bottom-sheet drawer.

- **Colonne gauche (sticky)** — Sommaire (H1/H2 cliquables avec scroll-margin-top), card Marque-pages.
- **Colonne centre** — Article :
  - Header sticky avec breadcrumb, title, chips (cat/lvl/durée/leçons), avatar auteur, boutons `Télécharger` / `Sauvegarder`.
  - Blocs rendus selon kind : h1/h2/p/code (avec syntax highlighting basique), callout pastel, image placeholder, quiz interactif (avec feedback +XP / pas tout à fait), audio mock player.
  - Footer leçon : boutons précédent/suivant + `Marquer comme lue · +X%`.
- **Colonne droite (sticky)** — Mes notes (textarea par section) + card "À retenir" (auto-extracted ou manuelle v3).

### Écran 6 — Dashboard étudiant (Mes progrès) · `/me/dash`

- Hero : nom, streak emphase, card mini-stats (Streak / XP / Rang).
- 3 ProgressTiles donut : Cours finis · En cours · À découvrir.
- Activité 30j (bar chart sparkline) + Badges (grid 3 col).
- Section "Reprendre" (mêmes cards que HomePage).

### Écran 7 — Classement · `/leaderboard`

- Hero éditorial : saison courante mono uppercase (`SAISON · MAI 2026`), titre `Classement de la semaine`, sous-titre règles XP + reset hebdo dimanche.
- Toggle scope glass (`Global · Amis · Groupe`).
- **Podium** — 3 colonnes (2-1-3 avec or au centre, taille variable), avatars, médailles emoji.
- **Table** — lignes (rank · avatar · nom · streak · cours · XP), highlight ligne du user courant.

### Écran 8 — Dashboard admin · `/admin` (homepage admin)

- Hero : `ADMIN · {instanceName}`, titre `Vos cours, en un coup d'œil.`, boutons `Export CSV` + `Nouveau cours` (→ `/admin/editor`).
- 4 StatCards : Cours édités · Étudiants actifs · Heures consommées · Note moyenne.
- 2 cards : Inscriptions 30j (bar chart SVG) + Top cours par vues (liste).
- Table tous les cours (titre · catégorie · statut · inscriptions · note · maj · action édit).

### Écran 9 — Éditeur · `/admin/editor` (admin + teacher)

3 colonnes (`260px 1fr 320px`), pleine hauteur.

- **Gauche** — Block Library glass, drag source. Groupes : Texte / Média / Interactif.
- **Centre (canvas)** — Toolbar sticky (titre cours éditable, statut, last-saved, Aperçu, Publier). Cover header. Liste de blocs avec drop-lines entre chaque, drag pour réordonner, contentEditable pour textes, sélection visuelle.
- **Droite** — Inspector du bloc sélectionné (champs spécifiques selon kind) + Statistiques (mots, blocs, durée estimée).

Persistance : autosave debounced (1.5s) → `PUT /courses/{id}/blocks`.

### Écran 10 — Branding · `/admin/branding` (admin + super-admin)

- Hero éditorial avec `ADMIN · BRANDING & THÈME`.
- Layout `1fr 380px` : settings à gauche, **live preview glass à droite (sticky)**.
- Blocks : Identité (nom + tagline + logo presets/upload) · Page d'accueil (hero title/sub/cta) · Couleur d'accent (palette pastel + custom picker) · Typographie · Style cartes · Layout feed · Mode clair/sombre.
- Bouton `Enregistrer` → `PATCH /instance/branding` → réécrit `instance.json` côté backend.
- Mention figée `[Logo] Codestar` rappelée dans une callout.

---

## 7. Direction Artistique — Liquid Glass

⚠️ Cette DA **remplace** celle définie dans `apps/frontend/CLAUDE.md` (Outfit + #F28022 Apple-grey). Mettre à jour le CLAUDE.md dans la PR de la nouvelle HomePage.

### Tokens à définir dans `globals.css`

```css
:root {
  /* Surfaces — pastel iOS */
  --bg-base: #F4F6FB;        /* lavande très clair */
  --bg-mesh-1: #DCE8FF;      /* spot bleu pastel */
  --bg-mesh-2: #FFE4D6;      /* spot pêche pastel */
  --bg-mesh-3: #E1F5E8;      /* spot menthe pastel */

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-strong: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.65);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.08);
  --glass-blur: blur(20px) saturate(180%);

  /* Texte */
  --text: #1A1F2E;
  --text-soft: #4A5366;
  --muted: #8892A6;

  /* Accent (paramétrable instance, fallback) */
  --accent: #7AA9FF;          /* bleu pastel par défaut */
  --accent-fg: #FFFFFF;
  --accent-soft: rgba(122, 169, 255, 0.18);

  /* Sémantiques */
  --success: #5DC9A8;
  --warning: #FFB672;
  --danger:  #FF8A95;

  /* Typo — Outfit reste recommandé pour body, ajout d'un display serif optionnel */
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Instrument Serif', 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;

  /* Rayons + ombres */
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

body {
  background: var(--bg-base);
  background-image:
    radial-gradient(circle at 12% 18%, var(--bg-mesh-1), transparent 45%),
    radial-gradient(circle at 88% 12%, var(--bg-mesh-2), transparent 50%),
    radial-gradient(circle at 50% 95%, var(--bg-mesh-3), transparent 55%);
  background-attachment: fixed;
}

.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  border-radius: var(--r-lg);
}
```

### Composants glass à créer dans `components/ui/`

- `<GlassCard>` — wrapper standard (variants : `default | strong | tinted-accent`).
- `<GlassButton>` — variants `primary | ghost | outline`.
- `<GlassInput>` — input + textarea + select stylisés.
- `<GlassChip>` — pour catégories, états, etc.
- `<GlassNav>` — top-nav sticky avec backdrop-blur intense.
- `<MeshBackground>` — composant qui pose les radial-gradients animés (parallax léger au scroll).

### Garde-fous accessibilité

- Contraste texte sur glass : tester systématiquement `text` sur `glass-bg` au-dessus de chaque mesh-spot. Si < 4.5:1 → augmenter `glass-bg` à `glass-bg-strong`.
- Focus ring `2px solid var(--accent)` + `outline-offset: 2px`, jamais supprimé.
- `prefers-reduced-motion` : désactiver mesh animation et page-fade transitions.
- `prefers-contrast: more` : remplacer glass par surfaces opaques.

---

## 8. Roadmap phasée

### Phase v1 — Socle auth + landing ✅ TERMINÉE

**Objectif** : un visiteur peut découvrir Codestar, créer un compte, rejoindre un groupe avec un code. Les rôles existent en DB. Pas de cours, pas de gamification.

| # | Tâche | Couche | Effort |
|---|---|---|---|
| 1.1 | Migration Flyway initiale (User + Role + Group + GroupMembership + InvitationCode) | back | M |
| 1.2 | Mise à jour `User.java` (UUID, email, role enum, displayName) | back | S |
| 1.3 | Endpoints `/auth/{login,register,me,logout}` avec invitation code optionnelle | back | M |
| 1.4 | Endpoints `/groups/*` + `/invitations/*` | back | M |
| 1.5 | Endpoint `/instance/branding` (lit `instance.json`) | back | S |
| 1.6 | Spring Security : `@PreAuthorize` par rôle, JWT claims | back | M |
| 1.7 | Tokens DA Liquid Glass dans `globals.css` + `<MeshBackground>` | front | M |
| 1.8 | Composants ui glass (Card, Button, Input, Chip, Nav) | front | M |
| 1.9 | Page `/` HomePage publique Liquid Glass (hero + 3 cours mock + 3 features + CTA + footer figé) | front | L |
| 1.10 | Page `/login` (3 modes signin/signup/join, split layout, mobile-first) | front | M |
| 1.11 | Hook React `useInstanceBranding()` consommant `/instance/branding` au mount | front | S |
| 1.12 | Setup `next-intl` + arborescence `messages/fr.json` | front | S |
| 1.13 | Setup Playwright + 3 tests E2E (signup, login, join groupe) | tests | M |
| 1.14 | Mise à jour `apps/frontend/CLAUDE.md` (nouvelle DA Liquid Glass) | docs | XS |
| 1.15 | Mise à jour `README.md` (rôles, fichier `instance.json`, capture d'écran landing) | docs | S |


- B1 — Permission Teacher granulaire (GroupPermissionService)
- B2 — Permission DELETE invitation (créateur ou admin)
- B3 — Validation DTOs (@Email, @NotBlank, @Pattern)
- B4 — Healthcheck Spring actuator + docker-compose update
- B5 — Rate-limit /auth/* (Bucket4j)
- B6 — Logout effectif (token blacklist + jti claim)
- B7 — Logging structuré JSON (logback-spring.xml)
- B8 — Setup Testcontainers PostgreSQL
- B9 — Tests AuthController
- B10 — Tests GroupService
- B11 — Tests InvitationService
- B12 — Tests GroupPermissionService
- F1 — Setup Playwright (config + deps)
- F2 — E2E signup spec
- F3 — E2E signin spec
- F4 — E2E join group spec
- F5 — Scripts package.json (test:e2e)
- C1 — Activer tests backend en CI
- C2 — Lint frontend strict en CI
- C3 — Job Playwright E2E en CI
- C4 — Type-check frontend en CI
- D1 — Update apps/frontend/CLAUDE.md (DA)
- D2 — Update README.md racine (rôles + instance.json)
- D3 — Créer DEPLOYMENT.md
- D4 — Créer CONTRIBUTING.md
- D5 — Créer SECURITY.md

### Phase v2 — Cours + dashboards + branding UI (cible : 8–10 semaines) — 🟡 EN COURS

Statut : ✅ fait · 🟡 partiel · ❌ à faire

| # | Tâche | Dépend | Effort | Statut |
|---|---|---|---|---|
| 2.1 | Migrations Course + CourseBlock + GroupCurriculum + Enrollment + Bookmark + Note | 1.1 | L | 🟡 tout sauf `Note` (table absente) |
| 2.2 | Endpoints `/courses/*` + `/blocks/*` + `/enrollments/*` + `/bookmarks/*` + `/notes/*` | 2.1 | L | 🟡 `/notes/*` manquant, reste fait |
| 2.3 | Page `/home` étudiant (hero + reprendre + découvrir) | 1.9, 2.2 | M | ✅ |
| 2.4 | Page `/courses/{slug}` lecteur 3 colonnes + responsive bottom-sheet TOC | 2.2 | XL | ✅ (`/courses/[slug]` + `/read`, `mobile-toc`) |
| 2.5 | Page `/my-courses` étudiant | 2.2 | M | ✅ |
| 2.6 | Page `/me/dash` Dashboard étudiant | 2.2 | M | ✅ |
| 2.7 | Page `/admin` Dashboard admin (KPI, table cours) | 2.2 | M | ✅ |
| 2.8 | Stockage médias : choix MinIO vs filesystem | — | M | ✅ **filesystem** + durcissement P0 (volume `media_data`, PR `feat/images-management`) — MinIO/S3 plus tard. Cf. §12 |
| 2.9 | Endpoint `PATCH /instance/branding` + page `/admin/branding` (avec live preview) | 1.5 | L | 🟡 API faite, **page UI manquante** |
| 2.10 | Bottom-sheet mobile pour TOC, gestes drawer | 2.4 | M | ✅ (`mobile-toc`) |
| 2.11 | Tests Playwright : flows lecture cours, progression, branding update | 2.4, 2.9 | M | ❌ (branche `add-playwright-tests` non mergée) |
| 2.12 | **(ajouté)** Gestion users admin : `/users/*` + page `/admin/users` | 1.6 | M | ✅ |
| 2.13 | **(ajouté)** Gestion membres groupe : list/remove/patch-rôle + page `/admin/groups/[id]/members` | 1.4 | M | ✅ |
| 2.14 | **(ajouté)** Duplication de cours (`POST /courses/{id}/duplicate`) | 2.2 | S | ✅ |
| 2.15 | Export CSV stats groupe (`GroupStatsService` + endpoint) | 2.2 | M | 🟡 service présent, endpoint commenté (TODO) |

### Phase v3 — Éditeur + gamification + OAuth (cible : 10–12 semaines)

| # | Tâche | Dépend | Effort |
|---|---|---|---|
| 3.1 | Migrations QuizAttempt + XpEvent + Streak | 2.1 | M |
| 3.2 | Endpoints `/quiz/*` + `/leaderboard` + `/me/stats` | 3.1 | M |
| 3.3 | Page `/leaderboard` avec podium + table + scope toggle | 3.2 | M |
| 3.4 | Job cron quotidien : recompute streak, reset hebdo dimanche | 3.1 | M |
| 3.5 | Page `/admin/editor` complète (drag-drop, inspector, autosave) | 2.2 | XL |
| 3.6 | Génération PDF/print du cours (bouton Télécharger) | 2.4 | M |
| 3.7 | Spring OAuth2 : provider Google + GitHub | 1.6 | L |
| 3.8 | Boutons OAuth réactivés sur `/login` | 3.7 | S |
| 3.9 | Notifications (bell topbar) : nouveau cours dans groupe, badge gagné | 3.1 | M |
| 3.10 | Mode sombre auto + manuel | 1.7 | S |
| 3.11 | i18n : ajouter `en` (EN) | 1.12 | M |

### Hors-roadmap (à arbitrer ultérieurement)

- Mobile app native (React Native / Capacitor).
- Live sessions (visio intégrée).
- Marketplace de cours entre instances.
- Certificats vérifiables (signature cryptographique).
- IA assistante de cours (résumé, quiz auto).
- Plugin SCORM/xAPI.

---

## 9. Stack technique consolidée

| Couche | Choix | Notes |
|---|---|---|
| Backend | Spring Boot 3 / Java 17 | Existant. Ajouter Spring Security + Flyway + jjwt. |
| DB | PostgreSQL 16 | Existant. Migrations Flyway. JSONB pour `payload` des blocs. |
| Frontend | Next.js (App Router, version interne, cf. `AGENTS.md`) | ⚠️ pas la Next.js standard — toujours lire `node_modules/next/dist/docs/` avant. |
| Styling | Tailwind v4 + tokens CSS custom | Glass via classes utilitaires + `@layer components`. |
| State | React state local + SWR/React Query pour API | Pas de Redux. |
| i18n | `next-intl` | Arborescence `messages/{locale}.json`. |
| Tests E2E | Playwright | 1 worker en CI, retries=2. |
| Tests back | JUnit 5 + Spring Test + Testcontainers (Postgres) | Pas de mock DB. |
| CI | GitHub Actions | Lint + tests front + tests back + build Docker. |
| Déploiement | Docker Compose (existant) | Ajouter volume `instance-config` pour `instance.json`. |

### Variables d'environnement nouvelles (v1)

```env
# .env.example à compléter
JWT_SECRET=<random-256-bits>
JWT_EXPIRATION=86400000
INSTANCE_CONFIG_PATH=/app/config/instance.json
SIGNUP_OPEN=false   # si false, code invitation obligatoire
```

---

## 10. Checklist de démarrage v1 (ordre d'attaque conseillé)

1. ☐ Créer branche `feat/v1-liquid-glass-foundation` depuis `front/home-page-non-auth`.
2. ☐ Mettre à jour `apps/frontend/CLAUDE.md` avec la nouvelle DA Liquid Glass (§7).
3. ☐ Définir tokens CSS dans `globals.css`, créer `<MeshBackground>`.
4. ☐ Créer la lib de composants glass (`<GlassCard>`, `<GlassButton>`, etc.).
5. ☐ Réécrire `app/page.tsx` (HomePage publique) — supprimer Sovereignty/Personas/etc, recréer Hero + Featured + Pillars + CTA + Footer figé.
6. ☐ Créer `app/login/page.tsx` (3 modes).
7. ☐ Setup `next-intl`, déplacer toutes les chaînes FR dans `messages/fr.json`.
8. ☐ En parallèle backend : Flyway init + entités + endpoints auth/groups.
9. ☐ Brancher front sur back (hooks `useAuth`, `useInstanceBranding`).
10. ☐ Tests Playwright des 3 flows critiques.
11. ☐ Audit Lighthouse + axe-core, corrections.
12. ☐ PR récapitulative + démo.

---

## 11. Course Builder — blocs, payloads, import/export

> Point critique du produit. Si l'édition est pénible, l'utilisateur ne revient pas. Priorité UX/UX max.
> ✅ Livré (PR `feat/course-builder`) : éditeur 3 colonnes `components/admin/course-editor.tsx` + registry `components/block-kinds/`. Cf. §11.4/§11.5 (statut) et §11.4bis (notes).

### 11.1 Décisions d'architecture

| Sujet | Décision | Raison |
|---|---|---|
| warning / error / validation / green / tip | **1 seul kind `CALLOUT`** + champ `tone`. Pas 5 kinds. | `tone` vit dans `payload` JSONB → réutilise l'infra, surfacé comme 5 boutons distincts dans la palette d'insertion. |
| quote / iframe / table / sandbox | **4 nouveaux kinds** | schémas payload distincts. |
| AUDIO / VIDEO | **retirés** du builder (décision validée) | vidéo via `IFRAME` (youtube/vimeo). |
| quiz | ajout `correctIndex` (+ `explanation` optionnel) | l'actuel ne stocke pas la bonne réponse → quiz inexploitable. |
| table | payload structuré `{ header[], rows[][] }`, **jamais de HTML brut** | rendu sûr, zéro XSS. |
| iframe | `src` https + **allowlist de domaines** | iframe arbitraire = XSS / clickjacking. |
| sandbox | v1 = stockage + rendu read-only ; **exécution = v2** | payload conçu pour brancher un moteur après (Pyodide/WebContainers client *ou* Judge0/conteneur serveur — à trancher). |
| Migration | **éditer `V001.sql` en place** (pas de déploiement → on peut casser le SQL) | pas de `V002` pour l'instant. |
| Tests unitaires | **reportés** | hors scope de cette PR. |

### 11.2 Liste finale des kinds + schéma payload

JSONB par bloc, clés strictes (le validateur rejette toute clé inconnue). Volontairement simple : reproductible par une IA, lisible par un humain.

```
H1 / H2 / H3   { text }
P              { text }
CODE           { code, language }
CALLOUT        { text, tone }          tone ∈ neutral | warning | danger | success | green | tip
QUOTE          { text, author?, source? }
IMAGE          { src(https), alt }
IFRAME         { src(https + allowlist), title, height? }
TABLE          { header: string[], rows: string[][] }   // lignes rectangulaires, taille max
QUIZ           { question, options: string[2..10], correctIndex: int, explanation? }
SANDBOX        { language, code, readonly?, expectedOutput? }   // pas d'exec en v1
```

Mapping UI palette → kind/tone : Vigilance ⚠️ (`CALLOUT/warning`, orange) · Erreur ⛔ (`CALLOUT/danger`, rouge) · Validé ✅ (`CALLOUT/success`, vert) · Green IT 🌱 (`CALLOUT/green`) · Astuce 💡 (`CALLOUT/tip`, jaune) · Note (`CALLOUT/neutral`).

### 11.3 Schéma JSON import / export (versionné)

Même format pour l'export, l'import, et plus tard la génération IA (cf. §11.6). Contrat unique = garde-fou unique.

```json
{
  "version": 1,
  "course": { "title", "slug", "description", "category", "level" },
  "blocks": [ { "kind", "payload" } ]
}
```

### 11.4 TODO Backend (à faire en premier) — ✅ FAIT (PR `feat/course-builder`)

- [x] `V001.sql` (édité en place) : CHECK `course_blocks.kind` → `H1,H2,H3,P,CODE,CALLOUT,QUOTE,IMAGE,TABLE,QUIZ,SANDBOX` (retire AUDIO/VIDEO). **IFRAME retiré du scope** (décision : trop de surface d'attaque ; pas de vidéo en v1).
- [x] `CourseBlockType` : enum aligné (ajout QUOTE,TABLE,SANDBOX ; retrait AUDIO,VIDEO). Idem `SaveBlocksRequestDto` (regex `@Pattern`).
- [x] `BlockPayloadValidator` :
  - [x] `ALLOWED_TONES` → `neutral, warning, danger, success, green, tip`.
  - [x] `validateQuiz` : `correctIndex` (0 ≤ idx < options) + `explanation` optionnel.
  - [x] `validateQuote` ({text, author?, source?}), `validateTable` (rectangulaire, ≤12 col / ≤100 lignes), `validateSandbox` ({language, code, readonly?, expectedOutput?}, stockage seul).
  - [x] `validateMedia` retiré (AUDIO/VIDEO). `validateIframe` non implémenté (kind hors scope).
- [x] `GET /courses/{id}/export` → JSON §11.3 (`CourseExportDto`, perm `canEditCourse`).
- [x] `POST /courses/import` (Teacher+, `ImportCourseRequestDto`) → re-valide chaque bloc, crée Course `DRAFT`, slugify + collision de slug.

### 11.5 TODO Frontend (1 composant Next par kind) — ✅ FAIT

- [x] `lib/types.ts` : `CourseBlockKind` aligné + `CalloutTone` + `CourseExport`.
- [x] Un module par kind dans `components/block-kinds/` (`Render` + `Edit` + `defaultPayload` + `normalize`), enregistré dans `BLOCK_REGISTRY` :
  - [x] `quote.tsx`, `table.tsx` (éditeur add/remove ligne+colonne), `sandbox.tsx` (Render read-only + bouton « Run » désactivé, placeholder `SandboxRunner`). `iframe.tsx` **non créé** (kind hors scope).
  - [x] `quiz.tsx` : sélection bonne réponse + explication + feedback lecteur (`quiz-player.tsx` client).
  - [x] `callout.tsx` : 6 tones + icônes (`tones.ts`, tokens CSS `--color-green/--color-tip`).
  - Note : les `Edit` consomment `useTranslations("courseBuilder")` directement (plus de prop `labels`).
- [x] **Live preview** : toggle Édition / Côte-à-côte / Aperçu (réutilise les `Render`).
- [x] **Palette d'insertion** groupée (Texte / Mise en avant / Média / Interactif) + icônes ; les 6 callouts en entrées distinctes (`palette.ts`, préremplit `tone`).
- [x] **Drag-drop** réordonnancement via **`@dnd-kit`** (remplace flèches).
- [x] **Autosave** debounced 1.5s → `PUT /courses/{id}/blocks` + indicateur (saving / non enregistré / ✓).
- [x] Boutons **Importer / Exporter JSON** dans la toolbar.
- [x] i18n `messages/{en,fr}.json` : namespace `courseBuilder` (labels blocs + palette + toolbar).

### 11.4bis Décisions & notes d'implémentation (PR `feat/course-builder`)

- **Éditeur 3 colonnes** (écran 9 : palette / canvas dnd / inspector + stats) livré comme `components/admin/course-editor.tsx`, monté sur la route existante `/admin/courses/[id]/blocks` (garde chargement cours + permissions + breadcrumb). `blocks-editor.tsx` minimaliste supprimé.
- **IFRAME** abandonné (pas de vidéo v1) → la décision §11.1 « vidéo via IFRAME » est caduque tant que le kind n'est pas réintroduit (avec allowlist).
- **Migration** : `V001.sql` édité en place → checksum Flyway modifié. Sur une DB déjà initialisée, **reset** requis (`flyway clean` / volume neuf), conforme à §11.1.
- **Autosave all-or-nothing** : un bloc à champ requis vide (IMAGE.src, SANDBOX.code…) fait échouer la sauvegarde du cours entier (400 affiché) jusqu'à complétion — comportement du validateur strict.
- Vérifs : `mvnw compile` ✅ · `tsc --noEmit` ✅ · `eslint` ✅ · `next build` ✅. Tests unitaires reportés (§11.1).

### 11.4ter Structure en pages + limite configurable (PR `feat/course-builder`, 2ᵉ itération)

- **Modèle Course → Page → Bloc** (au lieu de Course → Bloc plat). Nouvelle table `course_pages` ; `course_blocks` gagne `page_id` (FK CASCADE) tout en gardant `course_id` dénormalisé (bookmarks/enrollment inchangés, cohérence garantie par les écritures full-replace).
  - Entités `CoursePage`, `CourseBlock.page`, `Course.pages`. Repo `ICoursePageRepository`.
  - API : `GET/PUT /courses/{id}/pages` (remplacent `/blocks`). DTO `CoursePageDto`, `SavePagesRequestDto` (`pages[].{title?, blocks[]}`). `CourseDto.pages`.
  - Export/import **v2 uniquement** : `{ version:2, course, pages:[{title?, blocks}] }`. Pas de rétrocompat v1 (`blocks` plat rejeté ; `pages` requis).
  - Front : `course-editor.tsx` = barre de pages (ajout / renommer / réordonner ◀▶ / supprimer) + canvas par page ; reader `/courses/[slug]/read` rend les pages en sections titrées ; intro cours compte les pages comme leçons.
- **`max_blocks_per_page` configurable ADMIN/SUPER_ADMIN** : table `app_settings` (key/value, seed `50`). `SettingsService` + `GET /settings` (TEACHER+, l'éditeur le lit) + `PATCH /settings` (ADMIN+). Page `/admin/settings` (form). Borne 1–1000. Plafond aussi appliqué côté `savePages` et `importCourse` (+ `MAX_PAGES = 200`). L'éditeur désactive la palette quand la page est pleine.
- **i18n** : tous les strings introduits passés en `messages/{fr,en}.json` (namespaces `courseBuilder` étendu + `adminSettings`, `admin.settingsLink`) ; `sandbox.tsx` (« Run » / « Bientôt ») et titres de page i18n.
- **Garde unsaved** : `beforeunload` averti quand modifs non sauvegardées.
- **Note bookmarks** : sauvegarder le contenu remplace tous les blocs → les favoris pointant d'anciens blocs sont supprimés (cascade FK). Comportement pré-existant, à adresser (réconciliation par contenu) plus tard.
- **Migration** : V001 toujours édité en place → reset DB requis (cf. ci-dessus).
- Vérifs 2ᵉ itération : `mvnw compile` ✅ · `tsc` ✅ · `eslint` ✅ · `next build` ✅ (routes `/admin/settings` + `/admin/courses/[id]/blocks`).

### 11.6 Plus tard (hors PR) — génération IA

- L'IA renvoie **le JSON §11.3** → passe par `POST /courses/import` → validation déjà en place = garde-fou.
- Front : bouton « Générer avec IA » → modal prompt → stream → preview avant insertion.
- À préparer dès cette PR : schéma JSON stable + validation stricte. Rien d'autre à coder maintenant.

---

## 12. Médias — upload / download d'images

> Livré (PR `feat/images-management`) : upload/download d'images de cours sur **filesystem** (volume Docker), durci niveau production (P0), intégré au course builder. MinIO/S3 = évolution future, service swappable.

### 12.1 Décision de stockage

Filesystem local — volume Docker `media_data`, `MEDIA_STORAGE_PATH=/app/media`. Choix adapté au modèle single-tenant / petite échelle (50–5 000 apprenants) et au self-hosting (zéro infra externe à provisionner). `MediaStorageService` est isolé → bascule MinIO/S3 ultérieure sans toucher aux contrôleurs (cf. P3 / §12.4).

### 12.2 API

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/api/v1/media` | Teacher+ | multipart `file` → `{ id, url }` (`url = /api/v1/media/{uuid.ext}`) |
| GET | `/api/v1/media/{id}` | Public | sert l'image brute (id opaque `uuid.ext`) |

- Types acceptés : png, jpg, webp, gif. **SVG exclu** (vecteur XSS). Taille ≤ 5 MB.
- Bloc `IMAGE` : `src` désormais **optionnel** ; accepte une URL https **ou** un chemin média interne `/api/v1/media/{uuid.ext}` (`BlockPayloadValidator`).
- Le navigateur charge via une route proxy Next `app/api/v1/media/[id]/route.ts` — le backend (`http://backend:8080` en Docker) n'est pas joignable depuis le navigateur.
- Intégré à l'éditeur : bouton « Téléverser » dans le bloc IMAGE (`components/block-kinds/image-uploader.tsx` + `image.tsx`), preview + saisie URL manuelle conservée.

> **Note déploiement (pas immédiat, à terme).** La route proxy Next fait transiter chaque image par le serveur Node — correct en dev / petite instance Docker, mais Node n'est pas fait pour streamer des fichiers à l'échelle. En prod sérieux, placer un **reverse proxy edge** (nginx / Caddy / Traefik) en origine unique qui route `/api/*` → backend (images servies direct, hors Node) et `/*` → frontend. Même origine donc toujours zéro CORS ; le `cache immutable` posé en §12.3 est compatible CDN. Le proxy Next reste utile en fallback. À consigner dans `DEPLOYMENT.md` (D3 roadmap).

### 12.3 Durcissement P0 (livré)

- **Type réel par magic-bytes** : `MediaStorageService.detectType` ignore le content-type client (spoofable) et identifie le format par signature binaire.
- **`nosniff` + `Content-Disposition: inline`** sur le GET (backend + proxy) : empêche le MIME-sniffing d'un polyglot en HTML/JS (XSS same-origin).
- **Garde decompression-bomb** : dimensions lues via header (`ImageIO`, sans décodage complet), rejet > 50 MP / 12 000 px. WebP (pas de reader JDK) retombe sur le cap 5 MB.
- **Écriture atomique** : fichier temp + `ATOMIC_MOVE` (jamais de fichier tronqué servi).
- **Cache immutable 1 an + ETag** : id unique par upload → contenu immuable, le navigateur ne revalide jamais (CDN-friendly).
- **Lecteur** : `<img loading="lazy" decoding="async">`.

### 12.3bis Accès au GET média (public) — décision

`GET /api/v1/media/**` est en `permitAll` (non authentifié). **Volontaire** : une image de cours se charge via `<img>`, qui n'envoie pas le JWT, et le proxy Next ne forwarde aucun header auth → exiger l'auth casserait l'affichage. Modèle **capability-URL** : id = UUIDv4 opaque (~122 bits), aucun endpoint de listing → pas d'énumération ni de fuite de masse ; on ne récupère qu'une image dont on connaît déjà l'URL exacte.

Tradeoff assumé : les images **ne sont pas gated par cours/inscription** (URL partagée = image visible par un anonyme). Acceptable pour des illustrations de cours (faible sensibilité), **pas** pour du média privé/PII.

Protection anti-abus du GET (rate-limit / connection-limit / bande passante) = **déléguée à l'edge** (reverse proxy nginx/Caddy ou CDN), **différée** (décision 2026-06-10 : « si proxy, ce sera après »). Raison : mauvaise couche en app (fichier statique, cache immutable 1 an absorbe déjà, IP masquée derrière proxy → besoin `X-Forwarded-For` de confiance). L'**upload** (POST), lui, est déjà rate-limité + quota.

Si média privé un jour → **URLs signées** (token HMAC + TTL sur le GET, garde le cache) — voir P3.

### 12.4 Prochaines étapes

Statut : ✅ fait · 🟡 partiel · ❌ à faire · ordre conseillé = P1 → P3.

#### P1 — Anti-abus + durabilité (priorité haute) ✅ FAIT (PR `feat/images-management`)

Débloque le contrôle d'usage.

| # | Tâche | Couche | Effort | Statut / détail |
|---|---|---|---|---|
| M1 | Table `media_assets` | back | M | ✅ `id`, `filename`, `owner_id` (FK user, CASCADE), `content_type`, `bytes`, `width`, `height`, `created_at`, `referenced` (bool, pour P2). Index owner + index partiel `WHERE referenced=FALSE`. **Ajoutée dans `V001.sql` en place** (encore en pré-déploiement → reset DB requis) ; passer à une migration versionnée dès qu'on vise prod. Entité `MediaAsset` + `IMediaAssetRepository`. |
| M2 | Rate-limit upload | back | S | ✅ `UploadRateLimiter` : token-bucket par user, **en mémoire, sans dépendance** (single-instance). Dépassement → 429. **Éviction des buckets inactifs** via sweep `@Scheduled` (TTL idle 30 min) — but = **borner la mémoire** (sauvegarde anti-OOM, pas un mécanisme d'enforcement du rate-limit) : map bornée aux users actifs, pas de fuite heap (`@EnableScheduling` activé, réutilisé par le GC P2). Config `codestar.media.rate-limit.{capacity,refill-per-minute,idle-ttl-minutes,sweep-ms}`. Redis = upgrade multi-replica (P3). |
| M3 | Quota disque | back | S | ✅ Cap par user + par instance (somme `bytes` DB), rejet 413. Config `MEDIA_USER_QUOTA_MB` (100) / `MEDIA_INSTANCE_QUOTA_MB` (5000). |
| M4 | Sharding répertoire | back | S | ✅ `media/ab/cd/uuid.ext` (préfixe uuid) dans `pathFor`. URL/id inchangés (shard interne). |

Notes : cohérence disque↔DB (delete fichier si l'insert échoue) ; **race quota acceptée** (check `SUM` puis `save` non atomiques → 2 uploads concurrents peuvent dépasser légèrement). Tolérée car : quota = garde-fou souple (pas facturation), dépassement borné à `uploads concurrents × 5 MB`, rate-limiter par user borne déjà le burst, mono-instance. Fix atomique = compteur `user_storage(owner_id, used_bytes)` + `UPDATE … WHERE used_bytes + :n <= :quota` (atomique sous verrou de ligne) — reporté à P2 (couplé au cycle de vie des assets / GC). Edge connu : owner supprimé → row CASCADE → fichier orphelin invisible pour le GC référencé (adressé par P2/G3).

#### P2 — Garbage collection orphelins ❌

| # | Tâche | Couche | Effort | Détail |
|---|---|---|---|---|
| G1 | GC médias non référencés | back | M | **Tâche en 2 parties.** (1) **Marking — à implémenter** : à chaque `PUT /courses/{id}/pages`, scanner les payloads de blocs et mettre `media_assets.referenced=true` pour chaque chemin média interne (suppose `referenced` défaut `false` à la création — déjà le cas). (2) **Job `@Scheduled` quotidien** (`@EnableScheduling` déjà activé en P1) : supprime fichier+ligne si `referenced=false AND created_at < now-24h` (grâce 24h pour uploads en cours). Évite la fuite disque (upload abandonné, bloc supprimé). Dépend de M1. |
| G2 | Quota atomique (anti-race) | back | M | Remplacer le check `SUM`+`save` (race tolérée en P1) par un compteur `user_storage(owner_id, used_bytes)` + `UPDATE … SET used_bytes = used_bytes + :n WHERE used_bytes + :n <= :quota` (rows=0 → 413). Idem compteur instance. À faire ici car le compteur doit décrémenter sur suppression/GC → cohérent avec G1. Sans objet tant que mono-instance + quota souple. |
| G3 | Orphelins d'owner supprimé | back | S | `media_assets.owner_id` FK CASCADE → supprimer un user efface ses rows mais **pas** les fichiers disque (invisibles au GC G1, qui s'appuie sur les rows). Le GC doit aussi réconcilier disque↔DB : supprimer les fichiers sans row `media_assets`. Risque sinon = fuite disque si beaucoup d'owners supprimés. |

#### P3 — Optimisation avancée + évolution stockage ❌

| # | Tâche | Couche | Effort | Détail |
|---|---|---|---|---|
| O3 | Re-encodage à l'upload | back | M | Décode→ré-encode PNG/JPEG : strip EXIF (fuite GPS/métadonnées) + neutralise polyglot définitivement. ⚠️ casse GIF animé + WebP sans plugin `ImageIO` (TwelveMonkeys) → re-encoder PNG/JPEG seulement, GIF/WebP = magic-bytes only. **Décision à prendre.** |
| O4 | Variantes responsive | back+front | M | Générer WebP + largeurs multiples (thumb/medium/full) → `srcset`. Gain bande passante. |
| O5 | Domaine cookieless | infra | S | Servir les médias depuis un sous-domaine dédié sans cookies → défense en profondeur XSS. |
| O6 | CDN | infra | S | Cache immutable déjà compatible (§12.3). |
| O7 | Rate-limit / connection-limit du GET média | infra | S | À l'**edge** (reverse proxy nginx/Caddy ou CDN), pas en app (cf. §12.3bis). Différé. Ex : `limit_req_zone` nginx sur `/api/v1/media/`. |
| O8 | URLs signées (média privé) | back | M | Si un jour le média doit être gated : token HMAC + TTL sur le GET (garde le cache, expire les liens). Seulement si besoin de média non-public (cf. §12.3bis). |
| S7 | Backend MinIO/S3 swappable | back | L | Interface `MediaStorage` + impl `S3MediaStorage` (`software.amazon.awssdk:s3` ou `minio-java`), sélection `MEDIA_BACKEND=fs\|s3`. **Déclencheur** : scale horizontal (≥ 2 replicas backend) — le FS local n'est pas partagé entre replicas. Tant qu'on est mono-replica, inutile. |

### 12.5 Config

```env
MEDIA_STORAGE_PATH=/app/media   # mappé sur le volume Docker media_data
```

Multipart : `spring.servlet.multipart.max-file-size=5MB`, `max-request-size=6MB`. `GET /api/v1/media/**` ajouté en `permitAll` dans `SecurityConfig`.

---

## 13. Observabilité & tests backend (stratégie)

> Cadrage décidé le 2026-06-09 pour les items roadmap **B7** (logging) et **B8–B12** (tests). Couvre **uniquement le backend**. Le frontend (Playwright F1–F5) reste hors scope ici.

### 13.1 Logging en production (B7)

**Principe 12-factor** : le backend tourne en container (`ENTRYPOINT java -jar`). Les logs partent sur **stdout/stderr**, jamais dans un fichier interne au container. Docker (puis k8s / driver de log) capture et route. Le travail de B7 porte donc sur le **format**, pas la destination.

**Décision — logging structuré JSON natif Spring Boot 3.4** (et non `logback-spring.xml` + `logstash-logback-encoder` comme supposé à l'origine dans B7). Le projet est sur Spring Boot **3.4.0**, qui embarque le logging structuré sans dépendance ni XML :

```properties
# application-prod.properties (profil prod déjà activé par docker-compose)
logging.structured.format.console=ecs
```

- Format **`ecs`** (Elastic Common Schema) : standard large, avalé par Elastic/OpenSearch, Loki, CloudWatch, Datadog. Alternatives `logstash` (ELK) / `gelf` (Graylog) si l'agrégateur l'impose.
- **Split dev/prod par profil** : `dev` garde le texte coloré lisible (défaut, aucune config) ; `prod` émet du JSON. `service.name` est dérivé de `spring.application.name=backend`.
- **Corrélation via MDC** : un filtre `RequestContextFilter` (`@Order(HIGHEST_PRECEDENCE)`) pose un `requestId` (header `X-Request-Id` ou UUID généré, renvoyé au client) en début de requête ; `userId` est ajouté dans `JwtAuthenticationFilter` juste après l'authentification. Le format structuré remonte automatiquement ces clés MDC au niveau racine du JSON. **`MDC.clear()` obligatoire dans un `finally`** : les threads Tomcat sont réutilisés → sans nettoyage, fuite de contexte d'une requête à la suivante (logs attribués au mauvais user).
- **Sécurité des logs** : ne **jamais** journaliser mot de passe (même tenté), token JWT, hash, `jwt.secret`, ni PII inutile. Un login échoué se logge avec un *hash* de l'email (détection de brute-force sans fuite d'identité), pas l'email ni le password — couplé au rate-limit B5.
- Logback reste sous le capot (Spring Boot) ; on ne crée un `logback-spring.xml` que si un besoin fin non couvert par la propriété native apparaît.

### 13.2 Tests backend — stratégie en couches (B8–B12)

**JUnit 5 et Testcontainers ne sont pas des alternatives** : ce sont des couches différentes qui se combinent. JUnit est le framework de test (présent dans **tous** les tests) ; Testcontainers fournit un vrai PostgreSQL jetable, ajouté **seulement** pour les tests qui touchent la base.

```
JUnit 5                ← socle, toujours présent
  ├─ Mockito           ← faux objets (logique isolée)
  ├─ Spring Test       ← démarre le contexte Spring (@WebMvcTest / @SpringBootTest)
  └─ Testcontainers    ← vrai Postgres jetable (tests d'intégration DB)
```

**Le type de test suit la nature de l'unité** (pyramide) :

| Niveau | Outils (en plus de JUnit) | Pour quoi | Coût |
|---|---|---|---|
| Unitaire | Mockito | logique pure, branches, validators | ms |
| Slice | Spring Test (`@WebMvcTest`, `@DataJpaTest`) | couche web isolée / repo + SQL | rapide |
| Intégration | Spring Test + **Testcontainers** | flux complet routing→validation→sécurité→DB | lent |

**Pourquoi Testcontainers et pas H2** : le projet utilise **JSONB**, le dialecte PostgreSQL et Flyway `validate`. H2 simule mal ces points → faux positifs. Testcontainers lance un Postgres réel (`postgres:16-alpine`) par run ; `@ServiceConnection` (Spring Boot 3.1+) câble la datasource automatiquement et Flyway applique `V001.sql` sur ce container — on teste contre le **vrai schéma**. Prérequis : Docker disponible en dev et en CI (déjà le cas).

**Dépendances à ajouter (pom, scope `test`)** : `org.testcontainers:junit-jupiter`, `org.testcontainers:postgresql` (versions via le BOM Testcontainers), `org.springframework.security:spring-security-test`. Note Spring Boot 3.4 : utiliser `@MockitoBean` (et non `@MockBean`, déprécié).

**Convention** : tests d'intégration suffixés `*IT` (héritent d'une classe de base `IntegrationTest` annotée `@SpringBootTest @AutoConfigureMockMvc @Testcontainers`), tests unitaires/slice suffixés `*Test`.

**Mapping des cibles roadmap → type recommandé** :

| Item | Cible | Type recommandé | Raison |
|---|---|---|---|
| B8 | Socle Testcontainers | classe de base `IntegrationTest` | débloque B9–B11 (volet DB) |
| B9 | `AuthController` | **intégration** (Testcontainers) | flux register/login complet + DB + sécurité |
| B10 | `GroupService` | mix unitaire + intégration | dépend du SQL réel |
| B11 | `InvitationService` | unitaire Mockito (intégration si SQL complexe) | logique consume/expiry/revoke |
| B12 | `GroupPermissionService` | **unitaire Mockito** (pas de Testcontainers) | logique de permissions pure → quick-win haute valeur (sécurité) |

**Ordre d'attaque conseillé** : B8 (socle) → B12 (quick-win, le plus critique) → B9 → B11 → B10.

### 13.3 Logging — plan « ready » par étapes (statut au 2026-06-09)

**Fondation B7 livrée** (couche transversale) :

- Logging structuré JSON natif Spring Boot 3.4 (`logging.structured.format.console=ecs`) sur profil `prod` ; `application-prod.properties`. Dev reste en texte lisible.
- Corrélation MDC : `requestId` posé par `RequestContextFilter` (header `X-Request-Id` ou UUID, renvoyé au client), `userId` ajouté par `JwtAuthenticationFilter` après validation. `MDC.clear()` en `finally` (anti-fuite entre threads Tomcat réutilisés).
- Access log : une ligne par requête (`méthode path → statut (durée)`), path seul (jamais la query string).
- Events sécurité auth : login échoué (email **hashé**, jamais en clair) / succès, register OK / refusé ; refus d'autorisation 403 (`GlobalExceptionHandler`).

**Étapes vers « logs ready »** (✅ fait · 🟡 en cours · ❌ à faire) :

| Étape | Objet | Statut | Notes |
|---|---|---|---|
| 1 | **Audit trail métier** — INFO/WARN sur mutations (Course create/update/status/archive/duplicate/import, User role-change/disable/enable, Group CRUD/join/membres/curriculum, Invitation create/revoke, Settings, Branding, Media upload/rate-limit/quota, Bootstrap super-admin, 403 access-denied) ; autosave `savePages` en DEBUG | ✅ | Jamais de code d'invitation ni de payload loggé ; acteur via id explicite ou `userId` MDC. |
| 2 | **Maîtrise du bruit + healthcheck** — Actuator `/actuator/health` (public, check DB inclus), healthcheck Docker dédié, `/actuator` skippé dans l'access log | ✅ | = roadmap **B4**. Supprime ~8600 lignes/jour de ping |
| 3 | **Champs structurés requêtables** — access log en key-value typés (`method/path/status/durationMs`) ; 28 events métier (30 call-sites) centralisés dans `AuditLogger` (bean, logger dédié `audit`, API `audit.event("action").field(k,v).log()`) avec `action` obligatoire + ids typés | ✅ | Permet `status>=500`, `durationMs>1000`, `action:course.create` sans parser le message. `AuditLogger` tue le boilerplate + garantit le format (routable via logger `audit`) |
| 4 | **Audit anti-fuite** — relire chaque log existant (MediaStorageService, InstanceBrandingService…) pour PII/secret + convention écrite | ❌ | |
| 5 | **Rotation + shipping** — docker-compose `logging:` (json-file `max-size`/`max-file`) + doc shipping stdout→Loki/ELK dans `DEPLOYMENT.md` (D3) | ❌ | infra/docs |
| 6 | **Tests logging** — MDC nettoyé entre requêtes, access log émis, zéro secret en sortie ; sur socle Testcontainers B8 | ❌ | couplé aux tests |
| 7 | **Optimisation (option)** — `AsyncAppender` (latence requête) + actuator `loggers` (changer le niveau à chaud sans redéploy) | ❌ | |

Ordre : 1 → 2 → 3 → 4 → 5 → 6 → 7.

---

## Annexes

### A. Mapping draft → roadmap

| Fichier draft | Devient | Phase |
|---|---|---|
| `landing.jsx` (instance) | `app/page.tsx` Liquid Glass | v1 |
| `auth.jsx` | `app/login/page.tsx` (3 modes) | v1 |
| `feed.jsx` | `app/home/page.tsx` (étudiant) | v2 |
| `course.jsx` | `app/courses/[slug]/page.tsx` | v2 |
| `dashboards.jsx` (StudentDash) | `app/me/dash/page.tsx` | v2 |
| `dashboards.jsx` (AdminDash) | `app/admin/page.tsx` | v2 |
| `dashboards.jsx` (Leaderboard) | `app/leaderboard/page.tsx` | v3 |
| `editor.jsx` | `app/admin/editor/page.tsx` | v3 |
| `settings.jsx` | `app/admin/branding/page.tsx` | v2 |
| `Alpha Star marketing.html` | Hors scope (page marketing du repo Codestar lui-même, non livré dans l'app) | — |

### B. Décisions volontairement reportées

- ~~Stockage médias (MinIO vs FS local)~~ → **tranché : filesystem** + durcissement P0 (PR `feat/images-management`). MinIO/S3 = évolution future (service swappable). Détail + roadmap P1→P3 en §12.
- OAuth Google/GitHub → v3.
- Mode sombre → v3 (token CSS prévus dès v1, mais pas de toggle UI).
- Page `/admin/users` (gestion users) → v2 ou v3 selon besoin.
- Détection appartenance groupe au signup (un seul code → un seul groupe au démarrage, multi-groupe via `/groups/join` après).

### C. Risques identifiés

| Risque | Mitigation |
|---|---|
| Liquid Glass = mauvais contraste sur mesh coloré | Tests axe-core en CI + variant `glass-bg-strong` systématique au-dessus du texte. |
| Next.js fork interne (cf. `AGENTS.md`) → APIs différentes | Toujours lire `node_modules/next/dist/docs/` avant un nouveau pattern. |
| `instance.json` modifié à chaud → besoin de redémarrer ? | Lecture à chaque requête `GET /branding` (pas de cache backend) + invalidation côté front au save. |
| Permissions teacher granulaires (son groupe) → boilerplate `@PreAuthorize` lourd | Helper `PermissionService.canEditGroup(user, groupId)` réutilisé. |
| Codes invitations partagés publiquement | TTL + quota d'usages + révocation côté admin. |

---

**Fin du hand-off.** Toute décision ultérieure doit être consignée dans une PR + ce fichier mis à jour.
