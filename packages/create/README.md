# @atom63/create

Create a new project on the Atom63 design system. The plan and its decisions are in
[`docs/design-system/starter-plan.md`](../../docs/design-system/starter-plan.md).

```bash
pnpm create @atom63 my-site     # once published
pnpm create:app my-site         # in this repo, today
```

The generated app follows the [quickstart](../../docs/design-system/quickstart.md):

- **Stack:** Vite, React 19, TypeScript and TanStack Router.
- **Styling:** `@atom63/styles`, `@atom63/ui-react` and `Atom63Theme`, with Tailwind CSS v4
  wired to the tokens. `bg-background` and `text-muted-foreground` resolve to `--a63-*`, and the
  `dark:` variant follows `Atom63Theme`.
- **Content:** MDX through `@mdx-js/rollup` and `@atom63/mdx`. Posts are `.mdx` files with
  frontmatter, and the list and post pages are generated from the folder.
- **shadcn:** the bridge in `@atom63/styles/compat/shadcn`, plus `components.json`, the `cn`
  helper and `class-variance-authority`, so `npx shadcn add <component>` works and the component
  takes the system's colors, radius and modes.
- **Agents:** `AGENTS.md` with the rules from the `atom63` rule table. It points agents at the
  published docs (`llms.txt` and the per-page Markdown), because the CLI is not published yet.

## Kinds

| Kind | Pages |
| --- | --- |
| `site` (default) | A landing page (hero, features, latest posts, sign-up) and an MDX blog |

`docs` comes next. Each kind is a folder in `starter/` layered over `starter/base`.

## How it works

`src/generate.mjs` copies `starter/base` and `starter/<kind>` and fills `{{title}}` and
`{{date}}`. It builds `package.json` itself: the `@atom63/*` packages take their exact versions
from this repo (only the release that publishes them changes those), and every other package
takes the range the repo already uses. Packages no workspace package uses are listed in
`starterOnly`.

`pnpm check:starter` proves the starter works, and CI runs it:

1. pack the design system packages;
2. generate an app and install it against the tarballs;
3. run `typecheck` and `build`;
4. hold the generated source to the craft rules;
5. with `--shadcn`, add a shadcn button and build again.

The generated app installs from npm only after `@atom63/mdx` has been published.
