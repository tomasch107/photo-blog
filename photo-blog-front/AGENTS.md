# AGENTS.md — Angular frontend

Scope: `photo-blog/photo-blog-front/`. Backend rules live in `photo-blog/AGENTS.md`.

## Stack

- **Angular 15.2** with NgModules (not standalone components).
- TypeScript 4.9 with `strict`, `strictTemplates`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, and `noImplicitReturns`.
- SCSS with Angular Material 15 (dark gray theme, prebuilt Indigo/Pink CSS plus custom theme).
- RxJS 7, `ngx-infinite-scroll`, `ngx-markdown`, `photoswipe` 5, Font Awesome 6.
- UI translations: `@ngx-translate/core` 14 with `@ngx-translate/http-loader` 7; JSON files live in `src/assets/i18n/`.
- Tests: Karma + Jasmine. No ESLint and no e2e project are configured.

## Commands

Run from `photo-blog/photo-blog-front/`:

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server (`http://localhost:4200`) | `npm start` |
| Production build | `npx ng build` |
| Watch build | `npm run watch` |
| Unit tests | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Generate Angular code | `npx ng generate <schematic> ...` (for example `npx ng generate component my-component`) |

`npm run build` is declared as `./node_modules/.bin/ng build`. That POSIX path can fail on Windows; use `npx ng build` when verifying locally.

## Application structure

```text
src/
  app/
    app.module.ts             Root module; declares AppComponent + HeaderComponent
    app-routing.module.ts     Lazy-loads main-page, category, image modules
    app.component.*           Shell: header + router-outlet
    components/header/        Global navigation and language switcher
    main-page/                Homepage feature module
    category/                 Category gallery feature module
    image/                    Image details + PhotoSwipe feature module
      service/image.service.ts
    model/                    API and domain interfaces
    services/                 HTTP, URL, language, rendering services
    config/url.config.ts      Strapi endpoint aliases and query strings
  environments/
    environment.ts            Production environment (used by `ng build`)
    environment.development.ts Development environment (used by `ng serve`)
  assets/i18n/                UI translation files (`en.json`, `pl.json`)
  styles.scss                 Global resets, CSS variables, utilities, Material theme
  styles/mixins.scss          Responsive breakpoint mixins
```

Feature modules are lazy-loaded in `app-routing.module.ts`:

| URL | Module | Component | Notes |
| --- | --- | --- | --- |
| `/` | `MainPageModule` | `MainPageComponent` | Loads the Strapi `page` with code `homepage`. |
| `/categories/:categoryCode` | `CategoryModule` | `CategoryComponent` | Infinite-scroll gallery; `all` is special-cased. |
| `/images/:imageId` | `ImageModule` | `ImageDetailsComponent` | The route parameter is actually a post **slug**, not an ID. |

## Data access conventions

- All HTTP calls go through a service in `src/app/services/` (or a feature-local service such as `image/service/image.service.ts`).
- Build URLs with `UrlService.getUrl(alias, replacements)`. Endpoint aliases and Strapi query strings live in `src/app/config/url.config.ts`; add new endpoints there instead of inlining URLs.
- `UrlService` substitutes `{placeholder}` tokens and prefixes `environment.apiUrl`.
- The backend's transformer plugin flattens responses, so models use direct fields (`post.title`, `page.pageData`), not `attributes`. Keep `src/app/model/*.model.ts` in sync with the actual REST shape.
- Paginated endpoints are typed with `ApiPaginatedResponse<T>` (`data` plus `meta.pagination`).
- Media URLs returned by Strapi are relative (`/uploads/...`). Prefix them with `environment.baseUrl`; do not hardcode the host.
- Do not hardcode API hosts in components. `app.component.ts` contains a legacy direct request to the production API; do not copy that pattern.

### Language and i18n

- `LanguageService.currentLanguage$` is a `BehaviorSubject` holding the active ISO code. It is initialized from `localStorage['lang']`, then the browser language, then `'en'`; unsupported values are normalized to `'en'`. Only `en` and `pl` are supported.
- `LanguageInterceptor` adds `locale=<current language>` to every outgoing HTTP request. Do not append `locale` manually.
- UI chrome strings live in `src/assets/i18n/en.json` and `src/assets/i18n/pl.json`, loaded by `@ngx-translate/core` (`TranslateModule.forRoot` in `app.module.ts`). Use the `translate` pipe in templates (`{{ 'main.browse' | translate }}`), and interpolate parameters with `translate: {year: currentYear}`.
- Add every new UI string to **both** language files. Keep the JSON key structure stable; `AppComponent` uses `meta.title` / `meta.description` to update the document title and description.
- Pluralized labels use the `units.frames.one|few|many` keys. `getFramesCountKey()` in the feature components selects the key from the count; the `translate` pipe renders it, so language switches update without extra subscriptions.
- Components that display localized content should react to language changes, typically by composing `languageService.currentLanguage$.pipe(switchMap(...))`. Follow the pattern in `CategoryComponent` or `MainPageComponent`.
- Strapi i18n handles **content** translations; ngx-translate handles **UI chrome**. Keep those concerns separate.

## Component and style conventions

- Keep the Angular CLI file layout: `name.component.ts`, `.html`, `.scss`, `.spec.ts`; `name.service.ts`; `name.module.ts`; `name-routing.module.ts`.
- Components use `templateUrl`/`styleUrls` rather than inline templates/styles.
- Use constructor injection. Services shared across features use `providedIn: 'root'`; feature-only services are provided by their module (see `ImageService` in `ImageModule`).
- Manage RxJS subscriptions explicitly. Several existing components store them in a `Subscription` and unsubscribe in `ngOnDestroy`; when touching a component without that pattern, add proper cleanup rather than creating leaks.
- Use the existing global design tokens (`--clr-*`, `--fs-*`, `--ff-*`) and utility classes from `styles.scss`. Responsive rules should use the mixins in `styles/mixins.scss` where practical.
- Angular Material 15 uses the MDC-based components. Keep the existing dark theme; do not swap in a different Material theme as part of an unrelated change.
- `RenderingService` sets the page background on `document.body` using `Renderer2`. Prefer it over direct DOM manipulation in components.
- `ImageService` owns the PhotoSwipe instance and closes it on `NavigationEnd`. Use the `PhotoswipeComponent` wrapper / `openImage()` flow instead of creating ad-hoc galleries.

## Environment configuration

- `environment.ts` (production) and `environment.development.ts` currently both point to `https://photoblogapi.bieda.it`.
- For local full-stack development, set `environment.development.ts` to:
  ```ts
  export const environment = {
    apiUrl: 'http://localhost:1337/api',
    baseUrl: 'http://localhost:1337'
  };
  ```
  `ng serve` uses the `development` configuration and replaces `environment.ts` with this file.
- Do not commit local API URLs that would break production builds; change only the environment file that matches the intended environment.

## Testing

- `npx ng test` uses Karma and launches Chrome. In headless/CI environments use `--browsers=ChromeHeadless`.
- The generated specs are placeholder-only. `app.component.spec.ts` asserts the old Angular welcome markup, and several service specs (for example `PageService`) omit `HttpClientTestingModule`/providers and will fail as-is. Do not use the existing suite as a regression signal; fix or add the spec relevant to your change.
- When adding tests, use `TestBed` and provide `HttpClientTestingModule` or mock services; never make real network calls.

## Build and deployment

- `ng build` outputs to `dist/photo-blog-front/`.
- The production Docker image (`Dockerfile`) builds with Node 16 Alpine and serves the output with nginx using `conf/nginx.conf` and `conf/security-headers.conf`.
- nginx is configured for SPA routing (`/index.html` fallback), long-lived caching for JS/CSS, and no-store caching for HTML/JSON.
- The full-stack Compose setup publishes this app on port `8090`.

## Pitfalls

- **Strict templates:** new template expressions must type-check. Use `*ngIf`/`async` patterns already present and avoid `any` where a model exists.
- **No standalone components:** Angular 15 supports them, but this app uses NgModules throughout. Add new components to the appropriate module's `declarations`.
- **Lazy loading:** register new feature routes in `app-routing.module.ts`; do not eagerly import feature components there.
- **`all` category behavior:** `CategoryComponent` treats any category code containing `all` as "show everything" and calls `getAllImages()`. That endpoint (`allPostsExcept`) excludes category codes containing `nature`. Confirm product intent before changing this filter.
- **`imageId` naming:** the route parameter is named `imageId` but contains a post slug and is passed to `filters[slug][$contains]`. Preserve the existing contract when editing routes.
- **PhotoSwipe import:** `ImageService.openGallery` uses a dynamic `import('photoswipe')`; keep the library lazy-loaded rather than importing it at module top level.
- **Legacy duplication:** `app.component.ts` makes an unused direct HTTP request, and `image.module.ts` imports `MarkdownModule` twice. Do not clean these up unless the task is specifically about that code; keep unrelated diffs focused.
- **Node version:** use Node 18 LTS. Angular 15 does not officially support the newest Node majors.
