# Exodex

A browsable explorer for the confirmed exoplanets in the **NASA Exoplanet
Archive**, with procedurally generated planet and star artwork on the client.

- Front end: Angular 21 (standalone components, signals, `@if`/`@for`),
  Nx monorepo, English and Spanish.
- Back end: NestJS on Express. One ADQL/TAP query against NASA, cached on disk
  and in memory.
- Renderer: a dependency-free TypeScript library that draws each planet as SVG
  from its physical parameters (see [`libs/planet-renderer`](libs/planet-renderer)).

Live at <https://exodex.zemios.dev> (API at <https://apiexodex.zemios.dev/api>).

## What it is, and what it is not

**Every planet shown comes from the NASA Exoplanet Archive.** There is no
database of ours, no seeded catalogue and no invented data. `apps/web` contains
a mock dataset, but it is compiled out of production builds (see
[Mock data](#mock-data-development-only)).

**Data is not guaranteed complete or current.** The archive only holds *confirmed*
planets (candidates and disputed entries are excluded by the query), the cache
can be up to 24 hours old, and the archive is updated continuously. Treat
Exodex as a way of browsing a public dataset, not as an authoritative catalogue.

**It is a free public property.** There is no account, no paywall, no payment
path and no premium tier, and none is planned. The data is public-domain NASA
output, so there is nothing to license. The value is in the interface, the
renderer and the search experience; monetisation, if it ever happens, would be
institutional (sponsorship, a curated newsletter) rather than a paid tier bolted
onto the app.

## Data pipeline

```
NASA Exoplanet Archive TAP/ADQL  →  ExoplanetService  →  JSON on disk  →  memory index
   (ps table, default_flag = 1)      transform + index     (24 h TTL)      (filters, search)
```

1. **Fetch.** On boot the service runs one ADQL `SELECT` over the `ps`
   (Planetary Systems) table with `WHERE default_flag = 1`, transforming each row
   and keeping the archive's asymmetric `err1`/`err2` uncertainties instead of
   rounding them away. Fields the table does not provide (inclination, telescope,
   stellar age) are `null` — never guessed.
2. **Cache on disk.** The full result is written to `data/exoplanets-cache.json`.
   A cache younger than `DISK_CACHE_TTL_HOURS` (default 24) is used directly, so
   a restart does not re-query NASA.
3. **Index in memory.** A `Map` by planet id plus a tokenised search index over
   planet and host-star names power lookups and multi-word search.
4. **Refresh.** A timer (`CACHE_TTL_SECONDS`, default 3600) re-checks the disk
   cache; when it has expired the NASA query runs again. If a refresh fails but
   previous data is loaded, the stale data keeps being served and the failure is
   logged.
5. **Query.** Filters, sorting and pagination run in memory. Identical filter
   combinations are memoised for 30 s in a bounded cache (50 entries).

### When NASA is unreachable

The API answers **503 Service Unavailable** on every data endpoint
(`/api/exoplanets`, `/api/exoplanets/:id`, `/api/exoplanets/meta/stats`) with a
message naming the reason. It never answers `200` with an empty list, because
that reads as "there are no exoplanets".

`/api/exoplanets/meta/status` stays up and is the diagnostic endpoint:

```json
{
  "lastUpdated": "2026-10-01T20:43:46.792Z",
  "totalPlanets": 6375,
  "cacheAge": 78971,
  "state": "ready",
  "lastError": null
}
```

`state` is `loading`, `ready` or `error`; `lastError` carries the upstream
message when it is `error`.

The web app renders a visible "NASA data unavailable" panel with a retry button
in that case. It shows no planets rather than placeholder ones.

## API

Read-only, no auth, no database. Public JSON at `/api`:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/exoplanets` | Filtered, sorted, paginated list. `page` (≥1), `pageSize` (1–96, default 48), `sort`, `order`, `q`, `types`, `methods`, `habitability`, `stellarClasses`, `minYear`/`maxYear`, `minRadius`/`maxRadius`. |
| `GET /api/exoplanets/:id` | One planet, by its normalised id (`kepler-186-f`). |
| `GET /api/exoplanets/meta/stats` | Totals and distributions by type, method, year and radius. |
| `GET /api/exoplanets/meta/status` | Cache age, planet count and dataset state. |

Responses are gzipped. Security headers come from `helmet` (strict CSP,
nosniff, frameguard, no-referrer, HSTS) and requests are rate limited to 120 per
60 s per IP, with `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` to tune it. CORS is
restricted to `CORS_ORIGIN` (default `https://exodex.zemios.dev`).

The archive needs no credentials, so there is no API key anywhere in this
project.

## Running it

Requires Node 22 and pnpm 10 (`corepack enable`).

```bash
pnpm install

# API on http://localhost:3000 — first boot queries NASA and writes the disk cache
pnpm exec nx serve api

# Web on http://localhost:4200
pnpm exec nx serve web
```

On Windows, pnpm needs `CI=true` or it aborts with
`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`:

```powershell
$env:CI='true'; pnpm install
```

Docker runs both, with nginx in front and the cache in a volume:

```bash
cp .env.example .env
docker compose up --build   # web on :8089, api on :3039
```

### Configuration

Copy `.env.example` to `.env` (docker compose) or `apps/api/.env` (local
`nx serve api`). Neither file is ever committed.

| Variable | Default | Meaning |
| --- | --- | --- |
| `CORS_ORIGIN` | `https://exodex.zemios.dev` | Allowed browser origin. |
| `PORT` | `3000` | API port. |
| `NASA_TAP_BASE_URL` | NASA TAP `/TAP/sync` | Upstream endpoint. |
| `DISK_CACHE_TTL_HOURS` | `24` | Age at which the disk cache is refetched. |
| `DISK_CACHE_PATH` | `./data/exoplanets-cache.json` | Cache file location. |
| `CACHE_TTL_SECONDS` | `3600` | In-memory refresh check interval. |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | `120` / `60000` | Rate limit. |

`CACHE_MAX_ENTRIES` appears in older local `.env` files and is **not read by any
code**; the filter cache bound is hard-coded.

### Quality gates

```bash
pnpm exec nx run-many -t lint    # red today, see Known gaps
pnpm exec nx run-many -t test    # 223 tests, green
pnpm exec nx run-many -t build   # planet-renderer, api, web
```

`.github/workflows/ci.yml` runs all three on Node 22 for every push and pull
request against `main`.

## Mock data (development only)

`apps/web/src/app/core/services/exoplanet-mock.service.ts` holds ~20 invented
planets so the UI can be worked on without the API. It is gated twice:

1. A compile-time flag, `MOCK_DATA_ENABLED` in
   `apps/web/src/app/core/config/mock-data.config.ts`. The production build
   swaps in `mock-data.config.prod.ts`, which hard-codes `false`, so the bundler
   folds every guarded fallback away.
2. An explicit runtime opt-in. Even with the flag on, the mock dataset is only
   used if the developer has set `localStorage["exodex:allow-mock-data"] = "true"`.
   When it happens, the console prints a loud warning and the app's data state
   becomes `mock`.

The production build also replaces the mock service module itself with
`exoplanet-mock.service.prod.ts`, a stub whose every method throws. The
fabricated dataset is therefore not in the production module graph at all, and
does not appear in the built output:

```bash
pnpm exec nx build web
grep -rl "Kepler-186 f" dist/apps/web/browser --include=*.js   # dataset markers
```

`apps/web/src/app/core/services/exoplanet-api.service.prod.spec.ts` asserts that
a production build returns no mock rows and surfaces the degraded state instead.

## Layout

```
apps/api        NestJS: ADQL query, disk cache, in-memory index, search, filters
apps/web        Angular: explorer, filters, detail pages, i18n (es/en)
apps/*-e2e      Playwright scaffolding
libs/planet-renderer   procedural SVG planet/star generation (pure functions)
libs/shared-types      Exoplanet, filter and atmosphere types + detected atmospheres
libs/ui-components     planet card, pagination, filter chip, skeletons, empty state
libs/i18n              translation service and strings
fixtures/nasa          ps-table export, kept as a data-model reference
```

## Known gaps

Stated plainly rather than left to be discovered:

- **`nx run-many -t lint` fails: 46 pre-existing errors**, all in code that
  predates CI. `planet-renderer` 24 (12 `no-inferrable-types` on defaulted
  parameters, 3 `prefer-const`, 6 module-boundary violations from
  `shared-types` having no build target), `ui-components` 21 (component
  selectors use the `app-` prefix where the project declares `lib-`, `ngIf`
  instead of built-in control flow, one `no-output-native`), `web` 1 (an `ngIf`
  in `planet-detail-page.component.ts`). CI runs lint as a blocking gate, so it
  is red until these are fixed. Warnings do not fail the build.
- **No unit tests for the Angular components** beyond the pagination, empty
  state and planet-grid specs. Template behaviour is largely unverified.
- **The two Playwright e2e projects are scaffolding** and are not run by CI.
- **Cache staleness is not surfaced in the UI.** A user cannot see how old the
  data they are looking at is, even though the API reports it.
- **`planet-detail` and `system-detail` show a "not found" state for any error**,
  including the 503 above, because they were written before the degraded state
  existed. Only the main explorer grid distinguishes the two.

## Data source and attribution

Data courtesy of the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/),
which asks for attribution. Please cite it. The archive is maintained by Caltech
under NASA contract; its own use policies apply to anything you build on top of
it.
