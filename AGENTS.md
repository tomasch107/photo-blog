# AGENTS.md — Strapi backend

Scope: everything under `photo-blog/` **except** `photo-blog/photo-blog-front/`. For frontend work, see `photo-blog/photo-blog-front/AGENTS.md`.

## Stack

- **Strapi 4.9.1** (this is Strapi v4, not v5 — do not use v5 APIs or documentation blindly).
- Node: `>=14.19.1 <=18.x`; use **Node 18 LTS**.
- CommonJS (`require`/`module.exports`), 2-space indentation (the generated `config/env/*/database.js` files currently use tabs), single quotes, semicolons.
- Plugins: `@strapi/plugin-i18n`, `@strapi/plugin-users-permissions`, `strapi-plugin-populate-deep`, `strapi-plugin-transformer`.
- Database: PostgreSQL for normal development/production (via `config/env/*/database.js`), with a SQLite fallback in `config/database.js`.
- Uploads: local provider, stored in `public/uploads/` (ignored by Git).

## Commands

Run from `photo-blog/`:

| Task | Command |
| --- | --- |
| Install | `yarn install` (matches Docker) or `npm install` |
| Dev server with auto-reload | `npm run develop` |
| Build admin panel | `npm run build` |
| Start production build | `npm run start` |
| Strapi CLI | `npx strapi <command>` or `yarn strapi <command>` |
| Start Postgres only | `docker compose up -d photo-blogDB` |
| Full stack | `docker compose up --build` |

There is **no test script and no lint script**. `.eslintrc` is a legacy config; ESLint is not installed as a dependency. Verify changes by starting Strapi and exercising the REST endpoints.

## Directory map

```text
config/
  admin.js            Admin JWT and API token salts
  api.js              REST defaults: limit 25, max 100, withCount true
  database.js         Multi-client DB config; defaults to SQLite
  env/development/    Development DB override (Postgres)
  env/production/     Production DB override (Postgres)
  middlewares.js      Standard Strapi middleware stack (CORS, body, etc.)
  plugins.js          Transformer plugin configuration
  server.js           Host, port, app keys
src/
  index.js            register/bootstrap hooks (currently empty)
  api/<name>/
    content-types/<name>/schema.json
    controllers/<name>.js
    routes/<name>.js
    services/<name>.js
public/uploads/       Uploaded media (do not commit)
database/migrations/  Empty; Strapi manages the schema automatically
```

All controllers, routes, and services currently use the standard factories:

```js
const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController('api::post.post');
```

Follow that pattern unless the task requires custom behavior.

## Content model

| Type | Kind | Key fields | Notes |
| --- | --- | --- | --- |
| `post` | Collection | `title`, `description` (richtext), `date`, `images` (media, multiple), `thumbnail` (media, single), `category` (oneToOne), `slug` (required) | Draft & publish, i18n localized. `date`, `images`, `slug`, `thumbnail` are not localized. |
| `category` | Collection | `name`, `code` (required), `order`, `background` (media), self-relations `category`/`categories` | Draft & publish, i18n. `code`, `order`, `background` are not localized. Self-relation models a category hierarchy. |
| `page` | Collection | `title`, `code` (required), `pageData` (JSON), `background` (media, required) | Draft & publish, i18n. Used for editable page content; the homepage is code `homepage`. |
| `tag` | Collection | `name` | Draft & publish, no i18n. |

Schema files are the source of truth for content types. Edit `schema.json`; do not edit the database directly.

## REST API behavior

- Endpoints are the standard Strapi routes: `/api/posts`, `/api/categories`, `/api/pages`, `/api/tags`.
- `config/api.js` sets `defaultLimit: 25`, `maxLimit: 100`, `withCount: true`. The frontend paginates with `pagination[page]` and `pagination[pageSize]`.
- The **transformer** plugin (`config/plugins.js`) removes the `attributes` key and flattens relation `data` wrappers. The top-level `data`/`meta` envelope remains. If you add a content type, make sure the frontend model matches the flattened shape.
- `populate-deep` is installed but the frontend uses explicit `populate[...]` query strings. Prefer explicit populate for new queries so response size stays predictable.
- Draft & publish is enabled on all collection types. Public API requests only see published entries.
- The i18n plugin is enabled. Localized fields are returned for the requested `locale`; requests default to Strapi's default locale. Non-localized fields are shared across locales. The frontend exposes English (`en`) and Polish (`pl`).
- Public permissions are managed in **Settings → Users & Permissions → Roles → Public** in the admin panel. A new content type is not publicly readable until `find` (and usually `findOne`) is granted.
- CORS uses the default Strapi middleware. If a new frontend origin is blocked, configure it in `config/middlewares.js` rather than disabling CORS.

## Common tasks

### Add a content type

1. Create `src/api/<singular-name>/content-types/<singular-name>/schema.json` with the correct `kind`, `collectionName`, `info`, and `attributes`.
2. Add the standard controller, route, and service files using `createCore*` factories.
3. Restart `npm run develop` so Strapi registers the type and updates the schema.
4. Grant the public role the required permissions in the admin panel.
5. Add or update the frontend endpoint alias in `photo-blog-front/src/app/config/url.config.ts`, the model in `src/app/model/`, and a service method.

### Add or change a field

1. Update the relevant `schema.json`.
2. Decide whether the field is localized (`pluginOptions.i18n.localized`) and whether it is required.
3. Restart Strapi and verify the admin editor accepts the field.
4. If the frontend needs it, update the query's `populate`/fields in `url.config.ts` and the TypeScript model.
5. Re-check both locales and both draft/published states.

### Add custom endpoint behavior

Implement it in the existing controller/service for that API rather than adding an unrelated global route. Keep the standard factory result as the base when extending:

```js
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  // custom actions here
}));
```

## Database and environment

- `.env` is untracked and may contain real secrets. Do not print, commit, or copy its values into docs.
- `.env.example` lists the minimum Strapi secrets (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`).
- `config/env/development/database.js` and `config/env/production/database.js` **override** `config/database.js` for their respective `NODE_ENV` and force PostgreSQL.
- Those two files currently contain a hard-coded fallback database password. Treat them as sensitive; when touching them, move the fallback to an environment variable and do not add new literals.
- Strapi manages schema migrations automatically. `database/migrations/` is empty. Back up data before destructive schema changes.
- `public/uploads/` is persisted in Docker as a volume and ignored by Git. Do not commit uploaded files.

## Docker and deployment

- `Dockerfile` is the development image: Node 16 Alpine, installs dependencies, builds, and runs `yarn develop`.
- `Dockerfile.prod` is the production image: Node 16 Alpine, production dependencies, `yarn build`, then `yarn start`.
- `docker-compose.yml` uses the development `Dockerfile` and mounts `config/`, `src/`, `.env`, and uploads for live reload. It also starts PostgreSQL 14.5 and Adminer.
- If you change dependencies, update the lockfile used by the Dockerfile (`yarn.lock`). Do not switch package managers without an explicit request.

## Verification checklist

- `schema.json` files are valid JSON.
- Strapi boots without registration or schema errors.
- The endpoint returns the expected flattened shape with `?populate=...`.
- Entries are published and available in the requested locale.
- Public permissions are set for any new endpoint.
- No generated files (`build/`, `.cache/`, `.tmp/`, uploads) or secrets are staged in Git.
