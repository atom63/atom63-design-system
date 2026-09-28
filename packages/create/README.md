# @atom63/create

Create a new project on the Atom63 design system. The plans and their decisions are in
[`docs/design-system/starter-plan.md`](../../docs/design-system/starter-plan.md) and, for the
`app` kind, [`starter-app-plan.md`](../../docs/design-system/starter-app-plan.md).

```bash
pnpm create @atom63 my-site     # once published
pnpm create:app my-site         # in this repo, today
```

The generated app follows the [quickstart](../../docs/design-system/quickstart.md):

- **Stack:** Vite, React 19, TypeScript and TanStack Router.
- **Styling:** `@atom63/styles`, `@atom63/ui-react` and `Atom63Theme`, with Tailwind CSS v4
  wired to the tokens. `bg-background` and `text-muted-foreground` resolve to `--a63-*`, and the
  `dark:` variant follows `Atom63Theme`.
- **Content** (`site` and `docs`): MDX through `@mdx-js/rollup` and `@atom63/mdx`. Posts are
  `.mdx` files with frontmatter, and the list and post pages are generated from the folder.
- **Templates** (`app`): the page templates and the blocks they use, copied from the agent index
  into `src/templates` as the app's own code.
- **shadcn:** the bridge in `@atom63/styles/compat/shadcn`, plus `components.json`, the `cn`
  helper and `class-variance-authority`, so `npx shadcn add <component>` works and the component
  takes the system's colors, radius and modes.
- **Agents:** `AGENTS.md` with the rules from the `atom63` rule table. It points agents at the
  published docs (`llms.txt` and the per-page Markdown), because the CLI is not published yet.

## Kinds

| Kind | Pages |
| --- | --- |
| `site` (default) | A landing page (hero, features, latest posts, sign-up) and an MDX blog |
| `docs` | MDX documentation: a sidebar grouped from the pages' frontmatter, the docs typography, an "On this page" table of contents, and previous and next links |
| `app` | A product app from the page templates: the app shell (rendered once, in a layout route) around an overview, an invoice list with its detail view, settings and a first-run page, plus sign-in and a not-found page. The sample data stays until you replace it |

Each kind is a folder in `starter/`, layered over shared layers: `starter/base` is what every app
shares (the entry, the theme, TypeScript and shadcn setup), `starter/content` adds MDX and the
site header and footer to `site` and `docs`, and `starter/app` is the app kind's router, layout and
config. Choose a kind with `--kind`, for example
`pnpm create:app my-docs --kind docs`.

## How it works

`src/generate.mjs` copies the kind's layers in order (`kindLayers`; a later layer's file replaces
an earlier one at the same path) and fills `{{title}}` and `{{date}}`. It builds `package.json`
itself from the packages each layer adds (`layerPackages`): the `@atom63/*` packages take their exact versions
from this repo (only the release that publishes them changes those), and every other package
takes the range the repo already uses. Packages no workspace package uses are listed in
`starterOnly`.

For a kind with templates (`kindTemplates`), it also copies those page templates and every block
they use from the agent index (`@atom63/cli/agent-index.json`) into `src/templates`, keeping the
`pages/<id>/` and `blocks/<id>/` layout as `atom63 copy` does.

`pnpm check:starter` proves the starter works, and CI runs it:

1. pack the design system packages;
2. generate an app of every kind and install each against the tarballs;
3. run `typecheck` and `build`;
4. hold the generated source to the craft rules;
5. for the `app` kind, open every route at a desktop and a phone width in light and dark mode
   (axe, console errors, one `h1`, no horizontal overflow);
6. with `--shadcn`, add a shadcn button to the first kind's app and build again.

The generated app installs from npm only after `@atom63/mdx` has been published.
