# {{title}}

A portfolio built on the [Atom63 design system](https://system.atom63.io): React, TanStack Router,
Tailwind CSS and MDX, with every color, space and radius coming from the system's tokens.

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

All the sample content is about a fictional person, Rowan Vale, and fictional companies. Replace it
with yours: start with `src/portfolio.config.ts`, then the folders under `src/content`.

## Pages

| Route | Page | Content from |
| --- | --- | --- |
| `/` | Home: the hero plate, your headline and intro, featured projects, writing and experience | `portfolio.config.ts`, projects with `featured: true` |
| `/projects` | Every project | `src/content/projects/*.mdx` |
| `/projects/<slug>` | A case study: role, timeline, team, tools, cover, then problem, role, process and outcome | One `.mdx` file |
| `/writing` | Every post | `src/content/writing/*.mdx` |
| `/writing/<slug>` | A post | One `.mdx` file |
| `/timeline` | Projects, writing, roles and milestones in one line, by year | `src/content/timeline.ts` |
| `/resume` | The resume, ready to print or save as a PDF | `src/content/resume.ts` |

A file's name is its slug. The frontmatter fields a project needs are listed in
`src/content/projects.ts`; a post needs `title`, `description` and `date`.

## Modules

Optional modules are switched in one place, `modules` in `src/portfolio.config.ts`. A module adds
its own route, link or section when it is on; nothing else needs to change.

| Module | Default | What it adds | Code |
| --- | --- | --- | --- |
| `assistant` | on | An "Ask" button and a chat sheet that answers questions about you | `src/modules/assistant` |
| `slides` | off | `/slides` and a deck viewer at `/slides/<slug>`, with a Slides link | `src/modules/slides` |
| `widgetBoard` | off | A "Right now" board of widgets on the home page: local time, current role, latest post | `src/modules/widgets` |
| `dock` | off | A bottom dock with the site's sections and two mini apps, a clock and a notepad | `src/modules/dock` |

### The assistant

The assistant runs on [`@atom63/agent`](https://system.atom63.io/patterns/pattern-agent) and draws
with the chat panel block (`src/templates/blocks/chat-panel`), so it streams, stops and clears like
a real chat. Out of the box it answers offline from your own content (`answers.ts`), with no model
and no API key.

To answer with a model, replace `transport` in `src/modules/assistant/transport.ts` with one that
calls your own server. Never put an API key in the browser. A transport is any object with a
`stream()` that yields `response-start`, `text-delta` and `finish` events:

```ts
import type { AgentTransport } from '@atom63/agent'

export const transport: AgentTransport = {
  async *stream(request, { signal }) {
    const response = await fetch('/api/chat', {
      body: JSON.stringify({ messages: request.messages }),
      method: 'POST',
      signal,
    })
    if (!response.body) throw new Error('No response body')
    yield { runId: request.runId, type: 'response-start' }
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      yield { delta: chunk.value, runId: request.runId, type: 'text-delta' }
    }
    yield { runId: request.runId, type: 'finish' }
  },
}
```

### Mini apps and widgets

A mini app is a `<MiniApp>` in `src/modules/dock/dock.tsx`: a dock button that opens a small
window. A widget is a `<Tile>` in `src/modules/widgets/widget-board.tsx`, built on the
[`@atom63/widgets`](https://system.atom63.io/patterns/pattern-widgets) card.

## The creative layer

The structure (pages, navigation, accessibility, themes) comes from the design system. The look is
yours, and changing it keeps the quality: everything below goes through tokens, so contrast, dark
mode and focus rings keep working.

### Brand, surface, radius and font

`appearance` in `src/portfolio.config.ts` sets four axes of the system around the whole site:

| Key | Values | What it changes |
| --- | --- | --- |
| `brand` | `auto`, `b1` to `b6` | The accent ramp: primary buttons, links, focus rings |
| `surface` | `n1` to `n6` | The neutral family: page, cards, borders |
| `radius` | `none`, `subtle`, `default`, `round` | Every corner, from buttons to the hero plate |
| `font` | `sans`, `serif`, `mono`, `pixel` | The type personality |

`src/components/site-layout.tsx` stamps them as `data-a63-*` attributes; the
[personalization page](https://system.atom63.io/foundations/foundation-personalization) lists every
axis.

### Theme and mode

Theme (`modern`, `aqua`, `retro`, `terminal`) and mode (light, dark) are the visitor's choice, in
the appearance menu in the header. `src/theme.tsx` holds them, remembers them per browser and
applies them through `Atom63Theme`. Change the starting theme there (`'modern'`).

### The hero plate

The home page leads with a plate: one picture that sets the tone, with the text below it rather
than over it, so any image works. To swap it, put your image in `public/plates/` and point `hero`
in `src/portfolio.config.ts` at it (`plate: '/plates/my-plate.jpg'`). Give it `plateAlt` if it
shows something a visitor should know about; leave it empty if it is decoration. A wide image
(21:9) fills it on a desktop; the phone crops it to 4:3 from the centre.

Project covers work the same way: the `cover` in each project's frontmatter.

### MDX blocks

Projects and posts are MDX: Markdown that can hold components. Every file can use the
[`@atom63/mdx` blocks](https://system.atom63.io/patterns/pattern-mdx-blocks) (`Callout`, `KeyIdea`,
`Steps`, `StatGrid` and `StatCard`, `FigureBlock`, `Timeline`, `Tabs`, `CodeBlock` and more), plus
the site's own `Quote`, without importing them.

To add a block of your own, write a component in `src/components/mdx-components.tsx` and add it to
the `createMdxComponents({ … })` call there. `Quote` is the example.

## Where things are

- `src/portfolio.config.ts`: who you are, the creative axes, the hero plate and the modules.
- `src/router.tsx`: the routes. Every page shares the header and footer through `siteRoute`.
- `src/pages`: the pages. `src/components`: the header, footer, layout, project card and MDX map.
- `src/content`: projects, writing, the timeline and the resume.
- `src/modules`: the optional modules.
- `src/templates`: the chat panel block the assistant is drawn with, now the site's own code.
- `src/theme.tsx`: theme and mode. `src/styles.css`: Tailwind, the token stack and the styles.

## Using the design system

Prefer components from `@atom63/ui-react`; the [component docs](https://system.atom63.io) list
them with their contracts. Tailwind utilities such as `bg-background` and `text-muted-foreground`
resolve to the same tokens, so custom layout follows every theme and mode.

For something the system does not offer, `npx shadcn add <component>` works in this project. The
shadcn bridge maps shadcn's variables onto the Atom63 tokens, so added components match.

`AGENTS.md` tells coding agents how to use the design system here.
