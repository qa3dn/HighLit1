# HighLit — engineering rules (CLAUDE.md)

HighLit is a graduation project: an Arabic‑first, RTL developer‑community platform for
programmers. This file is the binding contract for every change in this repo — backend, public
frontend, and admin dashboard. Rules here are not suggestions. A change that violates a rule
without an explicit, written justification should be rejected in review.

Read this top to bottom before writing code. When a rule and a quick hack disagree, the rule wins.

---

## 0. The three apps (know which one you're in)

| App | Path | Stack | Dev port | Purpose |
|-----|------|-------|----------|---------|
| Backend API | `backend/` | Django 5 + DRF + SimpleJWT + Channels + drf‑spectacular | 8000 | The single source of truth. PostgreSQL `highlit`. |
| Public site | `frontend/` | Next.js 14 (App Router) + React 18 + TS + Tailwind 3 + TanStack Query v5 | 3000 | The student/visitor experience. RTL Arabic. |
| Admin dashboard | `admin-dashboard/` | Vite + React 19 + TS + React Router 7 + Tailwind 4 | 5173 | Internal moderation/management. |

- API base path is **`/api/v1`**. Swagger lives at `/api/docs` (dev/staging only — see security).
- WebSocket base is **`ws://<host>/ws/...`** (Django Channels), e.g. `ws/spaces/<space_id>/`.
- The project was migrated from NestJS to Django ("hard replacement"). **Django is the only backend.**
  Any code/comment referencing Nest, `socket.io` namespaces, or old field names is legacy drift —
  fix it when you touch it, do not extend it.
- Docs are in `docs/` (Arabic). `docs/API_CONTRACT.md` is the human‑readable contract between
  backend and frontend; **update it in the same PR that changes a route or a JSON shape.**

---

## 1. Non‑negotiables — read this first

These apply to every file in every app.

### Reliability
- **Fail loudly at boundaries, never silently inside.** Validate all input at the system boundary
  (DRF serializer, request query params, webhook body, file upload, form submit). After validation,
  trust the data. A silent failure is always worse than a loud one.
- **Every error carries context.** Never `except: pass`, never `except Exception: pass`,
  never `catch (e) {}`, never `.catch(() => {})`. Catch the specific exception you expect, log it
  with context (request id, user id, relevant object ids), then handle it or re‑raise.
- **No fallback values that hide bugs.** `data?.user ?? defaultUser` masks a missing dependency.
  Return/raise an error instead. Fallbacks are for user‑facing display strings, not program logic.
- **External calls have timeouts.** Any outbound HTTP (GitHub Gist fetch, OAuth, future Stripe),
  Redis, and long DB work has an explicit timeout. No unbounded awaits or hanging requests.
- **Idempotency for anything retriable.** Reactions, enrollment/access grants, webhook handlers,
  background jobs — if it can run twice, the second run must be a no‑op. Enforce uniqueness at the
  DB level, not with app‑level "check then create" (which is racy).

### Readability
- **Names are the first documentation.** `processData` is a bug in disguise. Name it
  `grant_project_access`, `refresh_auth_token`, `compute_reaction_totals`. Verbs for functions,
  nouns for classes/types.
- **Functions do one thing.** If the description needs "and", split it. Target: fits on one screen.
- **No clever code.** Write the obvious thing. The next reader is in a hurry.
- **Comments explain WHY, never WHAT.** The code says what. A comment justifies a non‑obvious
  choice, a constraint, or an invariant. If deleting the comment wouldn't confuse a reader, delete it.
- **Consistent patterns beat marginally better ones.** Match the existing pattern in that app. A new
  pattern needs two real callers and a reason.

### Code quality
- **No dead code.** Delete it; git has history. No commented‑out blocks, unused vars, unreachable
  branches, or stray scratch files (e.g. `frontend/components/room/temp.txt` must not exist).
- **No debug/telemetry left in source.** No `#region agent log` blocks, no `fetch()` to
  `127.0.0.1:*` ingest endpoints, no stray `console.log`/`print` shipped to main. (These currently
  exist in `frontend/lib/audio.ts` and `frontend/components/ui/Button.tsx` — remove on sight.)
- **No premature abstraction.** Three similar lines is fine; three similar 30‑line blocks is a shared
  function. New abstraction needs two real callers first.
- **No over‑engineering.** Solve the problem in front of you. This is a student project, not FAANG —
  don't design for hypothetical scale, but don't ship insecure shortcuts either.
- **Type everything.** TypeScript strict mode, no `any` (use `unknown` + narrowing at boundaries).
  Python: type hints on public functions, DRF serializers fully typed; avoid bare `dict` returns.
- **No magic numbers or strings.** `5 * 1024 * 1024` is `MAX_UPLOAD_BYTES`. A role like `"ADMIN"`
  is a `User.Role` choice/enum, not a bare string scattered across files.

### Security (universal)
- **Never trust input.** URL params, headers, cookies, file names, form fields, JSON bodies — all
  adversarial until validated by a serializer/schema.
- **Treat every URL id as adversarial (IDOR).** Every endpoint that reads/writes a resource by id
  must verify ownership or role. See §6 — this is currently the biggest weakness in the codebase.
- **Principle of least privilege.** Default DRF permission should be authenticated, not `AllowAny`;
  open up specific public endpoints explicitly. Every key/role has only what it needs.
- **Secrets are never in code or committed env files.** They come from the environment at runtime.
  `backend/.env` must not be committed with real values, and `SECRET_KEY=change-me` is not allowed
  in any non‑local environment.
- **No security by obscurity.** Rate limits, ownership checks, and signature verification are always
  on. An `ALLOW_UNVERIFIED`‑style flag is a backdoor and is banned.

---

## 2. Backend — Django + DRF

### Layout & responsibilities
- Apps live under `backend/apps/<app>/` — `accounts`, `posts`, `room`, `student_projects`,
  `uploads`, `moderation`, `realtime`. One app per bounded domain.
- Settings are split: `config/settings/base.py` (+ `dev.py` / `prod.py`). Read all config from env
  via `os.getenv`; never hardcode environment‑specific values.
- **Views stay thin.** Business rules that aren't trivial CRUD go in a small service function or a
  model method, not inline in the view. Keep querysets in the view/manager, not duplicated across
  views.
- **Serializers are the boundary.** Validate and shape data here. Never return a raw model dict.
- URL modules per app are wired in `config/urls.py` under `/api/v1/...`. Keep that mapping the
  single routing source of truth. Note `APPEND_SLASH=False` — routes are slash‑less; be consistent.

### Database
- **Index every column used in `filter()` / `order_by()` / FK joins.** A new query that filters on a
  new column adds the index migration **in the same PR**. `university`, `major`, `status`,
  `created_at`, `type`, `user_id` on hot tables must be indexed.
- **No N+1.** Use `select_related` / `prefetch_related` for related objects you will read. Don't
  lazy‑load inside a loop or a serializer.
- **Counters under concurrency use `F()` expressions** (`F("view_count") + 1`), never
  read‑modify‑write in Python. This already bites `StudentProject.view_count`.
- **One transaction per logical operation.** A multi‑step write (e.g. grant access + write an audit
  row + bump a counter) runs inside `transaction.atomic()`; it all commits or all rolls back.
- **Enforce uniqueness in the DB, not the app.** Examples that must be `UniqueConstraint` /
  `unique_together`: one reaction per `(post, user, type)` (already present), one
  `(user, lesson/project)` progress row, one access grant per `(user, resource)`. Replace any
  "query then create" race with a DB constraint + `get_or_create` / `ON CONFLICT`.
- **`select_for_update()`** when you read a row then write it under concurrency (e.g. redeeming a
  code, fulfilling a payment, granting access).
- **Every FK declares `on_delete` intentionally.** Prefer `PROTECT`; use `CASCADE` only for true
  detail rows; `SET_NULL` only for nullable audit fields (`reviewed_by`, `granted_by`).
- **Datetimes are timezone‑aware** (`USE_TZ=True`, `DateTimeField`). Naive datetimes are banned.
- **Money (if/when added) is integer minor units + `CHAR(3)` currency.** Never `float`.
- **JSONField is only for genuinely unstructured data.** If a field is filtered, sorted, or
  validated, it's a normalized table — not `JSONField(default=list)`.
- **Migrations are reviewed, never blindly autogenerated to main.** Autogenerate to a scratch file,
  then hand‑write the real migration. Adding a `NOT NULL` column uses a server default or a
  two‑step migration so existing rows aren't locked out.
- **Soft‑delete user‑visible rows** (`retired_at` / `deleted_at`) and filter them out by default in
  shared query helpers; pass an explicit flag to include them in admin queries.

### API design
- **One screen → one call.** Don't make the frontend fan out. The project‑detail and "my room"
  screens should each be a single endpoint that returns everything that screen needs (object +
  related lists + the viewer's access/progress state).
- **Cursor pagination, hard `limit ≤ 200` (default 50)** on every list endpoint. `ORDER BY ?`
  (random) is banned beyond tiny bounded pools.
- **Status codes mean what they say.** 4xx for caller error, 5xx for server. Never `200 {error}`.
  Never put `str(e)` / tracebacks in a response — that's information leakage. Use a stable envelope:
  `{ "error": { "code": "...", "message": "...", "request_id": "..." } }`.
- **Explicit serializer fields.** No `fields = "__all__"` on response serializers — adding a model
  column must not silently expose it. (`posts`, `room`, `student_projects` serializers using
  `"__all__"` should be migrated to explicit field lists.)
- **Versioned at the path (`/api/v1`).** Breaking changes go to `/api/v2`. Update
  `docs/API_CONTRACT.md` whenever a route or shape changes.
- **Fix contract drift, don't add to it.** The frontend currently reads fields the API does not
  return (`post.is_anonymous`, `job.company_name`, `job.salary_range_min/max`,
  `review.culture_rating`, and a stress shape of `{level,message,percentage}` vs the API's
  `{stress_level,score}`). When you touch one of these flows, align frontend and backend and record
  the canonical shape in the contract.

### Auth & RBAC
- **JWT via SimpleJWT.** Access token short‑lived (≤ 60 min), refresh token long‑lived and rotated.
  `JWT`/`SECRET_KEY` come from env and the app must refuse to boot in prod if they're missing or
  insecure.
- **Roles are `USER`, `ADMIN`, `COMPANY`** (`accounts.User.Role`). Authorization decisions check the
  role and/or object ownership — never a client‑supplied value.
- **Default to authenticated.** `DEFAULT_PERMISSION_CLASSES` should be `IsAuthenticated`; mark the
  genuinely public endpoints (catalog reads, health, public profiles) with `AllowAny` explicitly.
  The current global `AllowAny` default is a footgun — invert it.
- **Ownership checks are mandatory on detail/update/delete.** See §6.
- **Account‑enumeration safe.** `register` / `login` / password‑reset return the same generic
  response and comparable timing whether or not the email exists.

### Realtime (Channels)
- Consumers live in `apps/realtime/`. Routing in `config/routing.py`. Keep consumers thin; reconstruct
  state from the DB, don't hold authoritative state in memory.
- **Authenticate the socket from an initial auth message**, not a query‑string token (tokens leak to
  logs). Reject within a few seconds if auth fails.
- **The channel layer is in‑memory in dev and Redis in prod.** Don't rely on in‑process state across
  workers; fan out via the channel layer / Redis pub‑sub.

### Background work
- There is no task queue yet. Anything slow (image processing beyond the inline path, email,
  notifications, future video) must **not** block the request. When a queue is introduced, prefer an
  async‑native one; every task must be idempotent, have a max‑retry with backoff, and an explicit
  timeout. Tasks take JSON‑serializable primitives (ids), never ORM objects.

---

## 3. Uploads & media
- **Validate uploads at three layers:** (1) extension allowlist, (2) magic‑byte sniff, (3) re‑encode
  images through Pillow (strip EXIF). The current `uploads` app checks content‑type and size — add
  magic‑byte sniffing and re‑encoding.
- **SVG uploads are banned.** Permanently. They are an XSS vector.
- **Store under randomized names** (already done via `uuid4().hex`). Serve with
  `Content-Disposition: attachment` unless the type is explicitly safe to inline.
- **Enforce the size cap server‑side** (`MAX_UPLOAD_BYTES`, currently 5 MB). Never trust a
  client‑reported size.
- **No fetching user‑supplied URLs without a host allowlist** (cover images, gist links, OAuth
  redirects) — SSRF prevention. The Gist fetch must validate the host is `gist.github.com`.
- Large media (when added) is served via direct/signed URLs, not proxied through Django.

---

## 4. Frontend (`frontend/`) — Next.js 14

### Structure & rendering
- App Router under `app/`; reusable UI under `components/<domain>/`; data hooks under `hooks/`;
  API + types under `lib/`. Keep one component per file.
- Default to Server Components; add `"use client"` only when you need state, effects, events, or
  browser APIs, and push the boundary as far down the tree as possible.

### Data fetching & state
- **TanStack Query v5 is the only server‑state layer.** No `useState` + `useEffect` + `fetch` for API
  data. Define typed query keys per domain and set an explicit `staleTime` (public catalog can be
  minutes; personal data is `0`).
- **Mutations invalidate the specific affected query keys on success.** Don't blanket‑invalidate.
- **Client‑only UI state** (menu open, current step, WS status) lives in component state or a small
  store — never mix server data into it.
- **All HTTP goes through the shared axios client in `lib/api.ts`.** It injects the token and
  normalizes errors. No hand‑rolled `fetch` for API calls.

### Auth (security‑critical change)
- **Do not store the access token in `localStorage`.** This is the current pattern (`lib/api.ts`,
  `hooks/useAuth.ts`) and is an XSS‑exfiltration risk. Move the access token to **in memory** and use
  an `HttpOnly Secure SameSite` refresh cookie, matching the backend. On a 401, run a single
  in‑flight refresh and replay the original request.

### Security
- **No `dangerouslySetInnerHTML` with unsanitized content.** Markdown/user HTML must be sanitized
  (e.g. DOMPurify) before render. `react-markdown` output that can contain raw HTML must disable raw
  HTML or sanitize it.
- **Validate user‑supplied `href`/`src`.** Reject `javascript:` and `data:` schemes via a URL parser,
  not `startsWith('http')`. Route content images through `next/image` with a `remotePatterns`
  allowlist.
- **No `eval`, `new Function`, or dynamic `import(userVar)`.** They bypass CSP.

### Performance & UX
- **Dynamic‑import heavy libraries** (Monaco/code editors, syntax highlighter, players) with
  `dynamic(() => import(...), { ssr: false })`.
- **`next/image` for content images**, never bare `<img>` for content.
- **Virtualize lists that can exceed ~100 rows.**
- **Accessibility:** real `<button>`/`<a>` for interactive elements (not `<div onClick>`), every
  image has `alt`, visible focus rings, and AA color contrast. The UI is RTL Arabic — keep `dir`
  handling correct and test both directions where relevant.

---

## 5. Admin dashboard (`admin-dashboard/`) — Vite + React

- **Architecture is strict: Page → Hook → Service.** No API calls inside components; all HTTP in a
  feature `*Service.ts` (axios via `services/client.ts`); all logic in a `use*.ts` hook. UI components
  are presentational and reused from `components/ui`. (This is the team's own rule in `TEAM_RULES.md`
  — follow it; finish the empty stub services/hooks rather than calling the API from pages.)
- **Remove the dev "quick login" mock‑token path before any non‑local deploy.** `LoginPage.tsx`
  currently mints fake tokens client‑side; that must never reach staging/prod.
- **The admin app trusts the server, not the client.** Role gating in `ProtectedRoute` is UX only —
  every privileged action is authorized again on the backend (`ADMIN` role + ownership). Never assume
  a hidden route is a security boundary.
- Same token rule as the public app: prefer in‑memory access token + HttpOnly refresh cookie over
  `localStorage`.

---

## 6. Security — issues this codebase must not repeat

Each rule maps to a real gap found in the current code.

- **IDOR: every by‑id read/write checks ownership or role.** `room` detail views
  (`CodeStorageDetailView`, `DevNoteDetailView`, `IdeaDetailView`) use `IsAuthenticated` but **do not
  scope to the owner** — any logged‑in user can read/update/delete another user's stored code and
  private notes. Scope every queryset to `request.user` (or `ADMIN`), or add an object‑level
  permission. Treat this as a P0.
- **Reputation/score mutation must be authorized.** `UserReputationView` lets any authenticated user
  add arbitrary points to any user. Restrict to the server's own logic / `ADMIN`, and clamp values.
- **No exception leakage.** Never return `str(e)` or tracebacks to clients. Log with context; respond
  with the generic error envelope and a `request_id`.
- **No committed secrets / insecure defaults.** Remove real values from `backend/.env`, keep only
  `.env.example` with placeholders, and make the app refuse to boot in prod with `SECRET_KEY=change-me`
  or `DEBUG=True`.
- **Parameterized queries only.** No f‑string SQL. Use the ORM or `params=` with `raw`/`text`.
- **Webhooks/integrations verify signatures** (no bypass flag), and any external URL fetch is
  allowlisted (SSRF).
- **CORS is an exact‑origin allowlist** (already env‑driven) — never `*` with credentials.
- **Security headers** on responses: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a minimal `Permissions-Policy`, and a CSP on
  any HTML responses.
- **`/api/docs`, `/api/schema` are dev/staging only.** Disable in production.
- **Rate‑limit auth and abuse‑prone endpoints** (login, register, password reset, reactions,
  comment/post creation) with a `Retry-After` on 429.
- **PII stays out of logs.** Log user **ids**, not emails/names. Audit privileged actions (role
  changes, bans, content deletion, moderation, access grants) to an append‑only audit trail.

---

## 7. Think before you build — checklist for every addition

If you can't answer these, you're not ready to write code.

**Data & API shape**
- How many DB queries does this add per request? Can related reads be batched (`select_related` /
  `prefetch_related` / `WHERE id IN (...)`)?
- Does a similar endpoint already exist? Extend it before adding a new one.
- What does the screen need to render fully? Return it in **one** response.
- Is the list paginated and the payload limited to the fields actually used?

**Performance**
- What happens to this query at 10k / 100k rows? Is the filter column indexed?
- Does this introduce an N+1? Walk the relationships you load.
- Must this block the request, or can it be deferred?

**Security**
- Is every id in the URL ownership‑checked? Is the permission class correct (not a stray `AllowAny`)?
- Is all input validated by a serializer/schema? Are uploads validated at all three layers?
- Does any response leak internals (exception text, fields the caller shouldn't see)?

**Frontend**
- Does this add network requests for data already on the current endpoint? (Target: zero.)
- Is server state in TanStack Query and ephemeral state in component/local store?
- Does it pull in a heavy library that should be dynamically imported?
- Is user‑rendered HTML/URL sanitized?

**The "is this necessary" check**
- Can a better query, a cache, or extending an existing endpoint solve it instead of new code?
- If a feature is more than ~200 lines, stop and check the design — large diffs usually mean the
  abstraction is wrong, not that the feature is big.

---

## 8. Testing & quality gates
- Backend: `pytest` (the docs already plan `pytest`/`pytest-django`). Test, per endpoint: success,
  auth failure, permission/ownership failure, validation failure, and idempotency where relevant.
  Test against a real Postgres in CI (not SQLite) for anything Postgres‑specific. Don't mock the ORM.
- Frontend/admin: test behavior, not implementation — query by role/label/text. Every form tests
  valid submit, invalid submit (field errors), server error mapping, and disabled‑while‑pending.
- CI must run lint + type‑check + build for each app that changed. `print`/`console.log` and `any`
  fail review.
- "Happy path only" PRs are rejected.

---

## 9. Git & workflow (per `docs/GIT_WORKFLOW.md`)
- Branch from `develop`; feature branches `feature/...`, fixes `fix/...`, docs `docs/...`.
- No direct pushes to `main`; open a PR and get a review. Keep commits small and conventional
  (`feat:`, `fix:`, `docs:`, `chore:`).
- A PR that changes the API updates `docs/API_CONTRACT.md` in the same PR.
- Never commit `.env`, secrets, `node_modules/`, `.venv/`, `.next/`, build artifacts, or scratch
  files.

---

## 10. Quick reference
- API base: `http://localhost:8000/api/v1` · Swagger: `/api/docs` (dev only) ·
  health: `/api/v1/auth/health`
- WS: `ws://localhost:8000/ws/spaces/<space_id>/`
- Public site: `http://localhost:3000` · Admin: `http://localhost:5173`
- Roles: `USER`, `ADMIN`, `COMPANY` · DB: PostgreSQL `highlit`
- Contract: `docs/API_CONTRACT.md` · Runbook: `docs/PROJECT_RUNBOOK.md`
