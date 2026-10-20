# AGENTS.md — Angular frontend

Scope: `photo-blog/photo-blog-front/`. Backend rules live in `photo-blog/AGENTS.md`.

## Stack

- **Angular 22.2** with standalone components, signal-based state, `inject()`, and built-in `@if`/`@for` control flow. NgModules have been removed.
- TypeScript 6.0 (`>=6.0 <6.1`), which Angular 22 requires.
- **Node 24 LTS**, installed with [fnm](https://github.com/Schniz/fnm). Angular 22 supports `^22.22.3 || ^24.15.0 || >=26.0.0`; Node 18/20 no longer work.
- SCSS with Angular Material 22. The theme is declared with the `mat.theme()` API in `src/styles.scss`; the old prebuilt Indigo/Pink CSS is gone.
- RxJS 7.8, `ngx-infinite-scroll` 22, `ngx-markdown` 22, `photoswipe` 5, Font Awesome 7.
- UI translations: `@ngx-translate/core` 18 with `@ngx-translate/http-loader` 18; JSON files live in `src/assets/i18n/`.
- Tests: Karma + Jasmine (`jasmine-core` 6.3) through the `@angular/build:unit-test` builder. No ESLint and no e2e project are configured.

Angular 22 is **zoneless by default**. This app keeps the previous zone-based behavior by calling `provideZoneChangeDetection({eventCoalescing: true})` in `main.ts`, so `zone.js` stays in the build polyfills. Components opt into `ChangeDetectionStrategy.OnPush` and render from signals; if you introduce non-signal mutable state that the template depends on, update it through a signal or call `markForCheck()`.

## Commands

Run from `photo-blog/photo-blog-front/`:

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server (`http://localhost:4200`) | `npm start` |
| Production build | `npm run build` or `npx ng build` |
| Watch build | `npm run watch` |
| Unit tests | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Generate Angular code | `npx ng generate <schematic> ...` (for example `npx ng generate component my-component`) |

The build uses the `@angular/build:application` builder. Production output is written to `dist/photo-blog-front/browser` (the server bundle would live next to it if SSR were enabled).

## Application structure

```text
src/
  app/
    app.routes.ts             Lazy-loads the feature components with `loadComponent`
    app.component.*           Standalone shell: header + router-outlet
    components/header/        Global navigation and language switcher
    main-page/                Homepage feature component
    category/                 Category gallery feature component
    image/                    Image details + PhotoSwipe feature components
      service/image.service.ts
    model/                    API and domain interfaces
    services/                 HTTP, URL, language, rendering services
      language.interceptor.ts Functional interceptor that adds `locale`
    config/url.config.ts      Strapi endpoint aliases and query strings
  environments/
    environment.ts            Production environment (used by `ng build`)
    environment.development.ts Development environment (used by `ng serve`)
  assets/i18n/                UI translation files (`en.json`, `pl.json`)
  styles.scss                 Global resets, CSS variables, utilities, Material theme
  styles/mixins.scss          Responsive breakpoint mixins
```

Feature components are lazy-loaded in `app.routes.ts`:

| URL | Component | Notes |
| --- | --- | --- |
| `/` | `MainPageComponent` | Loads the Strapi `page` with code `homepage`. |
| `/categories/:categoryCode` | `CategoryComponent` | Infinite-scroll gallery; `all` is special-cased. |
| `/images/:imageId` | `ImageDetailsComponent` | The route parameter is actually a post **slug**, not an ID. |

## Data access conventions

- All HTTP calls go through a service in `src/app/services/` (or a feature-local service such as `image/service/image.service.ts`).
- Build URLs with `UrlService.getUrl(alias, replacements)`. Endpoint aliases and Strapi query strings live in `src/app/config/url.config.ts`; add new endpoints there instead of inlining URLs.
- `UrlService` substitutes `{placeholder}` tokens and prefixes `environment.apiUrl`.
- The backend's transformer plugin flattens responses, so models use direct fields (`post.title`, `page.pageData`), not `attributes`. Keep `src/app/model/*.model.ts` in sync with the actual REST shape.
- Paginated endpoints are typed with `ApiPaginatedResponse<T>` (`data` plus `meta.pagination`).
- Media URLs returned by Strapi are relative (`/uploads/...`). Prefix them with `environment.baseUrl`; do not hardcode the host.
- Do not hardcode API hosts in components. `app.component.ts` contains a legacy direct request to the production API; do not copy that pattern.

### Language and i18n

- `LanguageService.currentLanguage` is a **readonly signal** holding the active ISO code. It is initialized from `localStorage['lang']`, then the browser language, then `'en'`; unsupported values are normalized to `'en'`. Only `en` and `pl` are supported. Update it with `changeLanguage()`, never by writing the signal directly.
- `languageInterceptor` (a functional `HttpInterceptorFn`) adds `locale=<current language>` to every outgoing HTTP request by reading the signal. It is registered in `main.ts` with `provideHttpClient(withInterceptors([languageInterceptor]))`. Do not use the legacy `HTTP_INTERCEPTORS` token and do not append `locale` manually.
- UI chrome strings live in `src/assets/i18n/en.json` and `src/assets/i18n/pl.json`, loaded by `@ngx-translate/core` 18. `main.ts` configures it with `provideTranslateService(...)` and `provideTranslateHttpLoader(...)`; there is no `TranslateModule` anymore. Import the standalone `TranslatePipe` into each component's `imports` array.
- Use the `translate` pipe in templates (`{{ 'main.browse' | translate }}`), and interpolate parameters with `translate: {year: currentYear}`.
- Add every new UI string to **both** language files. Keep the JSON key structure stable; `AppComponent` uses `meta.title` / `meta.description` to update the document title and description.
- Pluralized labels use the `units.frames.one|few|many` keys. `getFramesCountKey()` in the feature components selects the key from the count; the `translate` pipe renders it, so language switches update without extra subscriptions.
- Components that display localized content react to language changes by reading `languageService.currentLanguage()` inside a `computed`, an `effect`, or `toObservable(...)`. Follow the patterns in `CategoryComponent`, `MainPageComponent`, and `HeaderComponent`.
- Strapi i18n handles **content** translations; ngx-translate handles **UI chrome**. Keep those concerns separate.

## Component and style conventions

- Keep the Angular CLI file layout: `name.component.ts`, `.html`, `.scss`, `.spec.ts`; `name.service.ts`. There are no `*.module.ts` or `*-routing.module.ts` files.
- Components use `templateUrl`/`styleUrls` rather than inline templates/styles.
- New components must be standalone (the Angular 22 default): do **not** add `standalone: false`, and do not add an NgModule. List every pipe, directive, and child component in the component's `imports` array.
- Use `inject()` for dependencies, typically in `readonly` field initializers. Services shared across features use `providedIn: 'root'`; feature-only services are scoped through the consumer's `providers` (see `ImageService` in `ImageDetailsComponent`).
- Model view state with `signal()`/`computed()`. Use `toSignal()` to expose an HTTP stream to the template and `toObservable()` when a signal must drive an RxJS pipeline. Keep RxJS for HTTP and event streams.
- Convert HTTP subscriptions with `takeUntilDestroyed()` or manage them through `toSignal()`. Do not leave subscriptions without cleanup.
- Use built-in control flow (`@if`, `@for`, `@else`) in templates. `@for` requires a `track` expression; pipe the array in a `computed` signal rather than using `SlicePipe` inside `@for`.
- Use the existing global design tokens (`--clr-*`, `--fs-*`, `--ff-*`) and utility classes from `styles.scss`. Responsive rules should use the mixins in `styles/mixins.scss` where practical.
- Angular Material 22 uses the MDC-based components and the `mat.theme()` Sass API. Keep the existing dark theme; do not swap in a different Material theme as part of an unrelated change. `@angular/animations` and `BrowserAnimationsModule` are intentionally absent — do not re-add them.
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

- `npx ng test` uses the `@angular/build:unit-test` builder with `runner: "karma"` and launches Chrome. In headless/CI environments use `--browsers=ChromeHeadless`.
- Tests are compiled ahead-of-time. Import the **standalone component** directly into `TestBed.configureTestingModule({imports: [...]})`. There are no NgModules to import or `declarations` arrays to populate.
- Add `provideHttpClient()` and `provideHttpClientTesting()` so HTTP calls are intercepted. Never make real network calls in tests. Add `provideRouter([])` for components that use router directives, and provide `TranslateService` / `provideMarkdown()` when the template uses them.
- `jasmine-core` is pinned to `~6.3.0` and `@types/jasmine` to `~6.0.0` (the versions Angular 22 scaffolds). Jasmine 7 breaks the `zone.js` Jasmine patch at runtime.
- The existing specs cover the shell, header, feature components, and services. Use them as the regression signal and extend the relevant spec when changing behavior.

## Build and deployment

- `ng build` outputs to `dist/photo-blog-front/browser`.
- `ngx-markdown` declares `katex` and `marked-katex-extension` as optional peers. They are installed so Vite's dev-server prebundling can resolve the library's static `import('marked-katex-extension')`. The resulting katex chunk is lazy and is never requested unless katex rendering is configured. Do not remove those packages while `ngx-markdown` remains installed.
- The production Docker image (`Dockerfile`) builds with Node 24 Alpine and serves `dist/photo-blog-front/browser` with nginx using `conf/nginx.conf` and `conf/security-headers.conf`.
- nginx is configured for SPA routing (`/index.html` fallback), long-lived caching for JS/CSS, and no-store caching for HTML/JSON.
- The full-stack Compose setup publishes this app on port `8090`.

## Pitfalls

- **Node version:** use Node 24 LTS through fnm (`fnm use 24`). The app's `package.json` declares no engine range, but Angular 22 refuses to run on Node 18/20.
- **Strict templates:** new template expressions must type-check. Use signals and `@if`/`@for`; avoid `any` where a model exists.
- **Standalone scope:** every pipe, directive, and child component used by a template must be in that component's `imports` array. There is no module-level shared scope.
- **`useDefineForClassFields: false`:** `tsconfig.json` keeps this setting for compatibility with the existing class layout. Field initializers now use `inject()`, but do not flip the setting without verifying the whole build.
- **Lazy loading:** register new feature routes in `app.routes.ts` with `loadComponent`; do not eagerly import feature components there.
- **`all` category behavior:** `CategoryComponent` treats any category code containing `all` as "show everything" and calls `getAllImages()`. That endpoint (`allPostsExcept`) excludes category codes containing `nature`. Confirm product intent before changing this filter.
- **`imageId` naming:** the route parameter is named `imageId` but contains a post slug and is passed to `filters[slug][$contains]`. Preserve the existing contract when editing routes.
- **PhotoSwipe import:** `ImageService.openGallery` uses a dynamic `import('photoswipe')`; keep the library lazy-loaded rather than importing it at module top level.
- **ngx-markdown:** `MarkdownModule` still works but is deprecated. Provide the service with `provideMarkdown()` in the root providers (already done in `main.ts`) and import the standalone `MarkdownComponent` where the `<markdown>` element is used.
- **Legacy duplication:** `app.component.ts` makes an unused direct HTTP request. Do not clean it up unless the task is specifically about that code; keep unrelated diffs focused.
