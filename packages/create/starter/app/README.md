# {{title}}

A product app built on the [Atom63 design system](https://system.atom63.io): React, TanStack Router
and Tailwind CSS, with every color, space and radius coming from the system's tokens. It starts
from the Atom63 page templates: an overview, a list with a detail view, settings, a first-run page
and sign-in.

```bash
pnpm install
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Typecheck and build to `dist/` |
| `pnpm typecheck` | Typecheck only |
| `pnpm preview` | Serve the built app |

## Where things are

- `src/app.ts`: the product name.
- `src/router.tsx`: the routes. `/`, `/invoices`, `/settings` and `/welcome` share the app shell;
  `/sign-in` sits outside it.
- `src/components/app-layout.tsx`: the app shell, its navigation and the appearance controls.
- `src/templates`: the page and block templates the app was created from, now the app's own code.
  Their data is sample data: replace it with yours.
- `src/theme.tsx`: mode and theme, applied through `Atom63Theme` and remembered per browser.
- `src/styles.css`: Tailwind, the token stack and the component styles.

## Using the design system

Prefer components from `@atom63/ui-react`; the [component docs](https://system.atom63.io) list
them with their contracts. Tailwind utilities such as `bg-background` and `text-muted-foreground`
resolve to the same tokens, so custom layout follows every theme and mode.

More page and block templates are in the [template registry](https://system.atom63.io/r/registry.json),
and `npx shadcn add https://system.atom63.io/r/<id>.json` adds one.

`AGENTS.md` tells coding agents how to use the design system here.
