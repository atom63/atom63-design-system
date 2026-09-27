# Atom63 product-shell example

Tally, a small invoicing app composed only from the pages in `@atom63/templates`: the dashboard, the invoice list with its detail sheet, settings, a first-run page and sign-in. It proves the templates fit together in one product, with one app shell, one token stack and one theme boundary. It does not import atom63.io routes, content or portfolio policies; code that needs them belongs in `atom63-vite`.

Routes are hashes, which is also what the templates' navigation links point at: `#overview`, `#invoices`, `#settings`, `#welcome` and `#sign-in`. The app follows the system light or dark setting.

The app sets up Tailwind the way an `@atom63/create` app does, and adds `@source` lines for the workspace component and template sources. A product that copies a template into its own source gets its utilities from its own `@source`.

```bash
pnpm --filter atom63-product-shell-example dev
pnpm check:product-shell
```

`pnpm check:product-shell` builds the app and opens every route at a desktop and a phone width in light and dark mode. It fails on axe violations, console errors, a page without exactly one `h1`, or a page wider than the viewport. CI runs it on every pull request.
