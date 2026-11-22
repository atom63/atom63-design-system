This portfolio is built on the Atom63 design system. Components come from `@atom63/ui-react`,
tokens from `@atom63/styles`, long-form content from `@atom63/mdx`, the assistant from
`@atom63/agent` and the widgets from `@atom63/widgets`.

## Project

- `pnpm dev` runs the site; `pnpm typecheck` and `pnpm build` must pass before a change is done.
- `src/portfolio.config.ts` is the one config file: the person, the creative axes (brand, surface,
  radius, font), the hero plate and the optional modules. Read it first.
- Routes live in `src/router.tsx`. Every page is a child of `siteRoute`, which renders
  `src/components/site-layout.tsx`: the header, footer, assistant and dock, and the `data-a63-*`
  attributes from the config. A module's routes are added only when it is on.
- Content is in `src/content`: case studies in `projects/*.mdx`, posts in `writing/*.mdx` (the file
  name is the slug; `projects.ts` and `writing.ts` list the frontmatter fields), the resume in
  `resume.ts` and the timeline in `timeline.ts`. The sample content is about a fictional person;
  replace it rather than adding to it.
- MDX files can use the blocks in `src/components/mdx-components.tsx` without importing them. Add a
  block there.
- Optional modules live in `src/modules/<name>` and are switched in the config. Keep a module's code
  in its folder, and keep the site working with it off.
- The assistant's transport is `src/modules/assistant/transport.ts`. It answers offline from the
  content; a real transport calls the site's own server, never a model API with a key in the browser.
- `src/templates` holds the chat panel block the assistant draws with. It is the site's own code now.
- Mode and theme are set once in `src/theme.tsx` through `Atom63Theme`. Style with tokens and the
  Tailwind utilities mapped onto them (`bg-background`, `text-muted-foreground`, `border-border`).
- `npx shadcn add <component>` works (see `components.json`). Use it only for something the design
  system does not offer; its components pick up the same tokens through the shadcn bridge.

