# PhotoBlogFront

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) and is now on **Angular 22.2** with **Node 24 LTS**.

## Development server

Run `npm start` (or `npx ng serve`) for a dev server. Navigate to `http://localhost:4200/`. The application reloads automatically when you change source files.

The dev server uses `src/environments/environment.development.ts`. It currently points at the production API; switch it to `http://localhost:1337/api` for local full-stack work.

## Code scaffolding

Run `npx ng generate component component-name` to generate a new component. You can also use `npx ng generate directive|pipe|service|class|guard|interface|enum|module`.

This app uses standalone components and signals. New components should be standalone (the Angular 22 default), declare their own `imports`, and model view state with signals.

## Build

Run `npm run build` to build the project. The production artifacts are stored in `dist/photo-blog-front/browser`.

## Running unit tests

Run `npx ng test --watch=false --browsers=ChromeHeadless` to execute the unit tests via [Karma](https://karma-runner.github.io) and Jasmine.

## Running end-to-end tests

There is no e2e project configured. Add a runner (for example Playwright or Cypress) before using `ng e2e`.

## Toolchain

- Node 24 LTS via [fnm](https://github.com/Schniz/fnm): `fnm install 24`, `fnm use 24`.
- Angular 22 requires Node `^22.22.3 || ^24.15.0 || >=26.0.0` and TypeScript `>=6.0 <6.1`.

## Further help

To get more help on the Angular CLI use `npx ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/cli) page.
