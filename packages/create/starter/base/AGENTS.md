This app is built on the Atom63 design system. Components come from `@atom63/ui-react`, tokens
from `@atom63/styles`, and long-form content from `@atom63/mdx`.

## Project

- `pnpm dev` runs the site; `pnpm typecheck` and `pnpm build` must pass before a change is done.
- Routes live in `src/router.tsx`, pages in `src/pages`, and shared pieces in `src/components`.
- Posts are MDX files in `src/content/blog`. The file name is the slug, and the frontmatter holds
  `title`, `description` and `date`.
- Mode and theme are set once in `src/theme.tsx` through `Atom63Theme`. Style with tokens and the
  Tailwind utilities mapped onto them (`bg-background`, `text-muted-foreground`, `border-border`).
- `npx shadcn add <component>` works (see `components.json`). Use it only for something the design
  system does not offer; its components pick up the same tokens through the shadcn bridge.

