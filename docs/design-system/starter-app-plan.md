# Starter app plan: an `app` kind for `@atom63/create`

Status: decided, 2026-09-28 (A1–A7 take their recommendations). Step 1 in progress.

## Goal

`pnpm create:app my-app --kind app` creates a product app, not a site: a sidebar shell, a dashboard,
a list with a detail view, settings, a first-run page and sign-in. It is built from the page
templates, so a person or an agent starts from reviewed pages instead of an empty router.

The starter has two kinds today, and both are content sites:

| Kind | What it makes |
| --- | --- |
| `site` | A landing page and an MDX blog |
| `docs` | MDX documentation with a sidebar, a table of contents and previous and next links |

The app-shaped reference is `examples/product-shell` (Tally), which imports the pages from the
workspace package `@atom63/templates`. A generated app cannot do that: `@atom63/templates` is
private and meant to be copied, not installed.

## What exists

- **`packages/create`** layers `starter/base` and `starter/<kind>`, fills `{{title}}` and `{{date}}`,
  and writes `package.json` with one dependency list for every kind. It appends the agent rules
  (`agentsBlock({ variant: 'docs' })`) to `AGENTS.md`.
- **`starter/base`** holds more than an app needs: the MDX plugin chain in `vite.config.ts`,
  `mdx.d.ts`, and the site header and footer.
- **The page templates** (`dashboard-page`, `list-page`, `settings-page`, `onboarding-page`) each
  render the `AppShell` block themselves, with their own copy of the navigation and a hard-coded
  `current` item. `sign-in-page` has no shell. Their links are hashes (`#invoices`), which
  product-shell routes on.
- **The agent index** (`packages/cli/generated/agent-index.json`) holds every template's files and
  the packages they import. `atom63 copy` writes a template and its blocks from it, keeping the
  `pages/<id>/` and `blocks/<id>/` layout so relative imports resolve.
- **`check:starter`** generates every kind against packed tarballs, then typechecks, builds and
  runs the craft rules. **`check:product-shell`** opens every route of the built example at two
  widths and two modes, and fails on axe violations, console errors, a page without one `h1`, or
  horizontal overflow.

## Decisions

### A1. Where the app's pages come from

- **Options:**
  - **A. Copy the templates at generation time** from the agent index, the way `atom63 copy`
    does, into `src/templates/pages/<id>/` and `src/templates/blocks/<id>/`.
  - **B. Install them after generation** with `npx shadcn add` from the published registry.
  - **C. Hand-written pages** in `starter/app`, maintained next to the templates.
- **Trade-offs:** A keeps the templates the only source, works offline, and `check:starter`
  catches a template that stops building in a real app. B needs the network at creation time and
  installs whatever the registry serves, which can differ from the starter's package versions. C
  duplicates five pages and drifts from them.
- **Recommendation: A.**

### A2. Who owns the app shell

- **Background:** each page template renders `AppShell`. In an app, navigating between routes then
  remounts the shell (its collapsed state resets), and the navigation list lives in four files.
- **Options:**
  - **A. Split each shell page into content and page:** `DashboardContent` holds what is inside
    the shell, and `DashboardPage` stays as today (`AppShell` around the content). Apps render the
    shell once, in a layout route, around the content. Stories, the registry and product-shell
    keep working with `*Page`.
  - **B. Keep the pages as they are;** each route renders a whole page with its own shell.
  - **C. Give pages no shell at all;** stories and registry users wrap them themselves.
- **Trade-offs:** A changes four templates slightly and keeps both uses. B needs no template change
  but ships the remount and the repeated navigation into every generated app. C breaks the page
  previews and makes a registry install of a page incomplete.
- **Recommendation: A.**

### A3. Routing and links

- **Background:** the other kinds use TanStack Router with real paths. `AppShell` renders plain
  `<a href>` links, which would reload the whole app on every click, and marks the current item
  from a prop.
- **Options:**
  - **A. TanStack Router with a layout route.** `AppShell` takes an optional link renderer, so the
    app passes the router's `Link`, and the current item comes from the route.
  - **B. Hash routes,** as in product-shell, with no router.
- **Trade-offs:** A matches the other kinds, gives real URLs and client-side navigation, and the
  renderer is a small, optional prop. B needs no template change but gives the app URLs unlike the
  rest of the starter, and a product would have to replace them.
- **Recommendation: A.** Paths: `/` (overview), `/invoices`, `/settings`, `/welcome`, `/sign-in`
  (outside the shell) and a not-found page.

### A4. The base layer

- **Options:**
  - **A. Move the content pieces out of `base`** into a `content` layer that `site` and `docs`
    share: the MDX plugins, `mdx.d.ts`, the site header and footer, and their dependencies. Each
    kind lists its layers and its dependencies.
  - **B. Leave `base` as it is;** the app carries an unused MDX setup and site header.
- **Trade-offs:** A gives the app only what it uses and keeps `site` and `docs` byte-for-byte the
  same. B is no work now, but the app's `package.json` and `vite.config.ts` show MDX to every
  reader and agent, who will assume it matters.
- **Recommendation: A.**

### A5. Product name and sample data

- **Background:** the templates are an invoicing product named Tally, with sample invoices,
  customers and activity.
- **Options:**
  - **A. The shell shows the app's title** (`{{title}}`); the sample data stays and is marked as
    sample. The README and `AGENTS.md` say where it lives and to replace it.
  - **B. Replace "Tally" everywhere** in the copied files.
  - **C. Neutral sample data** ("Item 1") in the templates.
- **Trade-offs:** A needs one prop and keeps realistic pages. B is text replacement over source
  files, which breaks silently when copy changes. C makes every template worse to review and to
  learn from.
- **Recommendation: A.**

### A6. Appearance controls

- **Recommendation:** the shell's top bar holds the theme and mode controls that `base` already
  has (`AppearanceControls`), through `AppShell`'s `topBarActions`, as the site header does for
  the other kinds. Every axis is then visible from the first run.

### A7. Checks, and the future of product-shell

- **Options:**
  - **A. `check:starter` covers the app kind** (it loops over the kinds), and the route check from
    `check:product-shell` runs against the generated app too. Once that is green, product-shell
    retires, and the generated app is the single app-shaped reference.
  - **B. Keep both** product-shell and the app kind.
- **Trade-offs:** A leaves one app to maintain and tests the thing people actually get. B keeps a
  fast workspace-sourced example with hot reload for template work, at the cost of two apps that
  show the same pages.
- **Recommendation: A**, in its own last step, so the app kind proves itself first.

## Steps

Each step is its own pull request and ends green in CI.

1. **Layers** (done). Split `base` into `base` and `content`; each kind names its layers and
   dependencies. *Verify:* generated `site` and `docs` projects match the files they have today,
   and `check:starter` passes.
2. **Templates.** `*Content` exports for the four shell pages, and an optional link renderer on
   `AppShell`. *Verify:* `check:templates`, the stories and `check:product-shell` pass unchanged.
3. **The app kind.** `starter/app` (router with the layout route, not-found page, README and
   `AGENTS.md` additions) plus the template copy from the agent index at generation time.
   *Verify:* `check:starter` builds the app; the route check passes at both widths and modes.
4. **Product-shell.** Point the route check at the generated app and retire
   `examples/product-shell`, if A7-A is taken.

## Out of scope

- Authentication, data fetching or a backend: the pages keep their sample data.
- Publishing: the app kind installs from npm only once `@atom63/create` and the packages it uses
  are released.
- Promoting the templates from draft to ready; that is the separate taste review.
