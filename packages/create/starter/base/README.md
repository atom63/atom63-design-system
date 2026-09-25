# {{title}}

A site built on the [Atom63 design system](https://system.atom63.io): React, Tailwind CSS and MDX,
with every color, space and radius coming from the system's tokens.

```bash
pnpm install
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Typecheck and build to `dist/` |
| `pnpm typecheck` | Typecheck only |
| `pnpm preview` | Serve the built site |

## Where things are

- `src/site.ts`: the site title and tagline.
- `src/pages`: the pages. `src/router.tsx` maps them to routes.
- `src/content`: the MDX content. Add a file to publish a post or page.
- `src/theme.tsx`: mode and theme, applied through `Atom63Theme` and remembered per browser.
- `src/styles.css`: Tailwind, the token stack and the component styles.

## Using the design system

Prefer components from `@atom63/ui-react`; the [component docs](https://system.atom63.io) list
them with their contracts. Tailwind utilities such as `bg-background` and `text-muted-foreground`
resolve to the same tokens, so custom layout follows every theme and mode.

For something the system does not offer, `npx shadcn add <component>` works in this project. The
shadcn bridge maps shadcn's variables onto the Atom63 tokens, so added components match.

`AGENTS.md` tells coding agents how to use the design system here.
