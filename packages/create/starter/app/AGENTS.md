This app is built on the Atom63 design system. Components come from `@atom63/ui-react` and tokens
from `@atom63/styles`. Its pages started as Atom63 page templates.

## Project

- `pnpm dev` runs the app; `pnpm typecheck` and `pnpm build` must pass before a change is done.
- Routes live in `src/router.tsx`. The signed-in pages render inside `src/components/app-layout.tsx`,
  which holds the app shell and its navigation; sign-in sits outside it.
- `src/templates` holds the page and block templates this app was created from. They are the
  app's own code now: edit them in place, and replace their sample data (invoices, customers,
  activity) with the product's.
- Start a new page from the closest template (see below), render its content inside the shell
  route, and add it to the navigation in `app-layout.tsx`.
- Mode and theme are set once in `src/theme.tsx` through `Atom63Theme`. Style with tokens and the
  Tailwind utilities mapped onto them (`bg-background`, `text-muted-foreground`, `border-border`).
- `npx shadcn add <component>` works (see `components.json`). Use it only for something the design
  system does not offer; its components pick up the same tokens through the shadcn bridge.
