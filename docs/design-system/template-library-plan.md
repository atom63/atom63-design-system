# Template library plan: templates, example app and `atom63 build`

Status: deferred, 2026-09-25. A project starter comes first (`starter-plan.md`). This plan
covers phase C's "templates" and "productized example app" items, plus the agent trial left over
from the agent interface plan (step 5). Its decisions are still open.

## Goal

Give people and agents known-good starting points above the component level: whole pages
(dashboard, settings, list and detail) and the blocks they are made of (page header, stat row,
filter bar, settings section). Each one is built only from system components and tokens, and each
passes the same bar as a component: themes, modes, axe and visual tests, and zero craft
violations. Then prove the pipeline end to end:

1. A product app composed from those templates shows that they fit together.
2. `atom63 build <idea>` hands an agent the closest templates, blocks and components for what it
   is asked to build.
3. A trial measures whether agents with the tools produce better UI than agents without them.
   This previews the phase E vibe tests.

This is the Astryx lesson the roadmap ranks first: give agents curated examples to follow, with
hard rules attached.

## What exists today

- **Components:** 68 families, enough for common product pages (Table, Sidebar, Tabs, Card, Field,
  Form, Select, Switch, Empty, Sheet, Dialog, Command, Pagination, …). There are also layout
  primitives (`Page`, `Section`, `SectionHeader`, `Grid`, `Container`) and the `@atom63/mdx`
  blocks for prose.
- **`examples/product-shell`:** its README already scopes it as the design-system-owned app
  example, free of portfolio content. Today it is one 240-line `App.tsx`. CI does not build it;
  only `vite-basic` is built.
- **The agent interface:** the index, `atom63` CLI and MCP server (#61–#64) are ready for a new
  kind of entry.
- **Quality gates** a template can reuse: Storybook render, axe, cross-browser and visual tests,
  `check:craft`, and typecheck against the contracts.

## Reference

- **Astryx:** templates come in two kinds, page and block. Each carries `id`, `name`,
  `description`, `kind`, owning package, optional `category`, `componentsUsed` and readiness
  flags. `template show` returns the source; `template copy` writes the files into a project and
  returns a receipt. `build <idea>` returns a `build.kit`: the closest page templates, drop-in
  blocks, idea-specific components, and an always-on list of frame and foundation components.
  With no idea, it returns the build playbook.
- **shadcn registry:** `registry.json` lists items (`registry:block`, `registry:component`,
  `registry:page`, …) with `files`, `dependencies` and `registryDependencies`. `shadcn add`
  installs them. D4 of the roadmap chose to offer one in phase C.

## Proposed shape

```
packages/templates          @atom63/templates: page and block sources + metadata
  src/blocks/<id>/<id>.tsx       one block, imports only @atom63/* and react
  src/blocks/<id>/<id>.stories.tsx
  src/pages/<id>/…               a page composes blocks + components
      │
      ├─► Storybook: render, axe, visual, themes × modes, mobile and desktop widths
      ├─► docs site: a Templates gallery generated from the metadata
      ├─► agent index: kind "template" → atom63 template list | show | copy, atom63 build <idea>
      └─► examples/product-shell: the app, composed from the pages
```

Each template file exports its metadata next to the component:

```ts
export const template = {
  id: 'settings-section',
  kind: 'block', // or 'page'
  title: 'Settings section',
  description: 'A titled group of labeled settings with helper text and a save action.',
  category: 'forms',
  tags: ['preferences', 'account', 'form'],
  readiness: 'ready', // or 'draft'
} as const
```

`componentsUsed` is not written by hand. The index generator derives it from the file's
`@atom63/ui-react` imports, so it cannot drift.

## Decisions

### T1. Where templates live

- **Background:** templates need the same gates as components (stories, axe, visual, craft,
  typecheck), and they must stay separate from the component API.
- **Options:**
  - **A. A new package, `@atom63/templates`**, with the source files and metadata above. It is
    rendered by Storybook and indexed by the CLI.
  - **B. Inside `@atom63/ui-react`** as exported components.
  - **C. Only as shadcn registry JSON.**
- **Trade-offs:** A keeps templates out of the component API: a template changes as freely as
  an example, while an export would be a contract. It still reuses every gate. B makes each
  template a public component to support. C gives up the Storybook gates and the typecheck.
- **Recommendation: A**, private at first, like `@atom63/cli`.

### T2. How a product uses a template

- **Background:** a template is a starting point, and the product owns what it becomes.
- **Options:**
  - **A. Copy:** `atom63 template copy <id> <dir>` writes the source into the project (as
    shadcn and Astryx do). The product edits it freely.
  - **B. Import:** the product imports the page or block from the package.
- **Trade-offs:** A matches how pages really evolve and never locks a product to a template's
  props. B would turn templates into components with a support burden (see T1-B). The example
  app can still import them from the workspace, which is how it proves they compose.
- **Recommendation: A** for products; direct workspace imports only for `examples/product-shell`.

### T3. The example app

- **Background:** the roadmap asks for a productized example that runs the whole pipeline (DS,
  patterns, templates). It belongs in this repo, not in the portfolio.
- **Options:**
  - **A. Grow `examples/product-shell`** into that app: routed pages composed from the
    templates, built and render-tested in CI.
  - **B. A new app** next to it.
- **Trade-offs:** product-shell already has exactly this charter, and it is small enough to
  rebuild around the templates. A second app would split the same purpose.
- **Recommendation: A.** Keep its rule: anything that needs portfolio content belongs in
  atom63-vite.

### T4. The first template set

- **Background:** the set should cover common product screens and use each block more than once,
  so the blocks prove they are reusable.
- **Proposal:**
  - **Pages (5):** dashboard, list and detail, settings, sign-in, empty-state onboarding.
  - **Blocks (10):** app shell (sidebar and top bar), page header, stat row, filter bar,
    data table section, detail panel, settings section, empty state, activity list, auth card.
- **Recommendation:** start with this set. Every block must be used by at least one page; a
  check enforces it.

### T5. The quality bar for a template

- **Background:** templates are what agents copy most, so a flaw in one spreads fastest.
- **Proposal:** a template is `ready` only when:
  - its story renders in every theme × mode and passes axe;
  - it has visual baselines at a phone width and a desktop width;
  - `check:craft` finds nothing in it;
  - a new `check:templates` passes. It checks that imports come only from `@atom63/*`, `react`
    and `lucide-react`, that the metadata is complete, and that every block is used by a page.
  - you have reviewed it in the Storybook gallery.
- Anything short of that stays `draft`. `build` and `template list` show `ready` templates by
  default.
- **Recommendation:** adopt it. The last gate is the "taste" step: a person with design judgment
  signs off. The checks enforce mechanics and nothing more.

### T6. `atom63 build <idea>`

- **Background:** agents describe an idea ("a billing settings page"), not a template id.
- **Proposal:** a `build.kit` envelope with:
  - the top page templates and top blocks for the idea;
  - the idea-specific components;
  - the always-on foundation (`Atom63Theme` or `UIProvider`, `Page`, `Section`,
    `SectionHeader`, `Grid`);
  - the rules;
  - the follow-up commands (`template show`, `template copy`, `component`).

  Ranking reuses the search scoring over template metadata, tags and the derived
  `componentsUsed`, and golden queries pin it. With no idea, `build` returns the playbook:
  search, pick a page, copy it, adapt it with components, and follow the rules.
- **Recommendation:** adopt it, including the golden queries.

### T7. The agent trial

- **Background:** step 5 of the agent interface plan. We need evidence that the tools improve
  output before investing further.
- **Proposal:**
  - **Tasks:** three product tasks in the example app (a settings page, a list with filters, an
    onboarding empty state).
  - **Runs:** each task is done twice by a fresh agent, once without and once with the `atom63`
    MCP server and AGENTS.md.
  - **Measures, all mechanical:**
    - `check:craft` violations in the new code
    - typecheck errors against the contracts
    - axe violations in a render of the page
    - the share of UI built from system components rather than raw elements
    - literal values that should have been tokens
  - **Report:** results go into `docs/design-system/audits/agent-trial-<date>.md`.
- **Recommendation:** run it once after the templates and `build` land. If the numbers justify
  it, turn it into the scheduled vibe test of phase E.

### T8. shadcn registry

- **Background:** D4 chose to offer a shadcn registry in phase C, for teams that live in shadcn.
- **Options:**
  - **A. Generate `registry.json` from the templates** (blocks as `registry:block`, pages as
    `registry:page`, with `@atom63/ui-react` as a dependency) and serve it from the docs site.
  - **B. Skip it.**
- **Trade-offs:** A reaches shadcn users at almost no extra cost once the metadata exists, but it
  needs a hosted URL and a check that the generated items install cleanly.
- **Recommendation: A, as the last step,** after the templates have settled.

## Implementation steps

Each step is its own pull request and ends green in CI.

1. **Package and gates.** `@atom63/templates` with the metadata convention, Storybook glob,
   `check:templates` (imports, metadata, block usage) and craft coverage. Seed it with 3 blocks
   and the page that uses them, with phone and desktop visual baselines.
   *Verify:* the gates fail on a template that imports a raw color or an app module; stories pass
   axe in every theme × mode.
2. **The first set.** The remaining pages and blocks from T4, and a Templates gallery page on the
   docs site generated from the metadata. Hand the set to you for the taste review; what you
   approve becomes `ready`.
3. **The example app.** Rebuild `examples/product-shell` as a routed app composed from the pages.
   CI builds it and render-tests every route with axe.
4. **CLI and MCP.** Index the templates; add `atom63 template list | show | copy`, search kind
   `template` and `atom63 build [idea]`, with golden queries. MCP gets them from the command
   table.
5. **The agent trial** (T7), with the report committed.
6. **shadcn registry** (T8).

## Out of scope for now

- **SwiftUI screen templates.** The iOS demo catalog covers components. Screen templates with
  the same ids come after the web set proves its shape.
- **Charts and data visualization.** No chart component exists yet; the dashboard uses stats,
  progress and tables.
- **Publishing** `@atom63/templates` and `@atom63/cli`. Release work is on hold.

## Sources

- Astryx CLI (`build`, `template`): <https://astryx.atmeta.com/docs/cli>
- shadcn registry format: <https://ui.shadcn.com/docs/registry/registry-json>
