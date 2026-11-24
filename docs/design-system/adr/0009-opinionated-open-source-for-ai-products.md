# ADR 0009: An opinionated, open-source design system for building AI products

**Status:** Proposed, 2026-11-24 (roadmap discussion with the maintainer). Accepted when YZ
approves this record. It changes the goal order and phase order of
[roadmap-next.md](../roadmap-next.md), replaces part of [ADR 0004](./0004-shadcn-close-not-identical.md)'s
2026-11-21 positioning and widens [ADR 0007](./0007-readiness-bar-and-review.md)'s goal. The
sections "What this supersedes" and "Open questions" list exactly what changes and what is not
settled.

## Context

- [roadmap-next.md](../roadmap-next.md) (2026-10-09) ranks three goals: commercial-grade quality
  first, the maintainer's own products second, open-source adoption third, "nice, not required".
  Open-source distribution (N11, phase F5) waits until F1 and F2 are done.
- [ADR 0004](./0004-shadcn-close-not-identical.md) records the 2026-11-21 positioning as "an
  in-house-grade system, with shadcn compatibility as one integration".
- [ADR 0007](./0007-readiness-bar-and-review.md) chose "internal products and AI builders" as the
  goal of the readiness bar, over a public 1.0 stable bar.
- In the 2026-11-24 roadmap discussion, the maintainer described the system differently: an
  opinionated design system they built entirely themselves, open source and friendly to vibe
  coding; usable out of the box and extendable; its edge is ownership, full control for making AI
  products; the project should also prove their design-system skill to the open-source community.
  Their own products are its dogfood consumers: OS63, the website, learn and this documentation,
  each a different form of consumer.
- What the system is built on today, checked in this repository on 2026-11-24:
  - It builds on Tailwind CSS and Base UI, and its component APIs follow shadcn/ui conventions
    ([README](../../../README.md), Acknowledgements; [ADR 0001](./0001-base-ui-primitive-layer.md)).
    So "not Tailwind" is not a difference from shadcn/ui.
  - It already ships AI-product surfaces: chat components in `@atom63/ui-react`
    (`ChatComposer`, `ChatMessage`, `ChatSteps`, `ChatTypingIndicator`) and the headless agent
    runtime `@atom63/agent`, beside `@atom63/widgets` and `@atom63/inform`.
  - The registry at `system.atom63.io/r` lists 21 items, 8 pages and 13 blocks, and no component
    source ([ADR 0004](./0004-shadcn-close-not-identical.md), consequences).
  - The starter apps carry an `AGENTS.md` (`packages/create/starter/*/AGENTS.md`); the docs site
    has no `llms.txt`.

## Decision

1. **Positioning.** Atom63 is an opinionated design system for building AI products, designed and
   owned end to end by one maintainer, open source, made to be used by coding agents as well as
   people. It works out of the box and can be extended.
2. **The difference is ownership, not a look or a stack.** One owner controls the whole chain:
   DTCG tokens, component contracts, React and SwiftUI components, the AI-product patterns (chat,
   agent runtime, widgets, inform) and the checks around them. Brand recognisability is not a
   goal. Tailwind, Base UI and the shadcn-like API stay; they are what makes the system familiar to
   agents, not what sets it apart.
3. **The opinion lives in the API and the defaults.** Each component has one right way to use it:
   only the axis values its contract lists, spacing, states and accessibility correct by default,
   and checks that catch misuse (`check:craft`, the AGENTS.md rules, type errors on unknown axis
   values). The test for a new API is whether an agent can use it wrongly; if it can, narrow it.
4. **Extension is at the token layer (assumption).** Products extend Atom63 through the theme
   axes already public under N4: brand colour, radius, density, font and the theme presets.
   Components are extended by composition and slots, not by editing recipes. The maintainer was
   not sure about this point, so it stays an assumption until a dogfood consumer needs more (see
   "Open questions").
5. **Dogfood and open source run in parallel, not in sequence.**
   - Dogfood: OS63, the website, learn and the documentation consume the published packages, each
     a different form (an OS-style shell, a portfolio site, a tutorial app, a docs site).
   - Open source: adoption is now a goal, not a bonus, because the project is meant to show the
     community what the maintainer can build. Distribution work (phase F5) starts beside F1
     instead of after F2.
6. **Distribution is shaped for coding agents.**
   - npm stays the main install path.
   - The registry also serves component source, for components whose contract is `stable` or
     `candidate`, so an agent or a shadcn user can add an Atom63 component the way they add a
     shadcn one. Copied source is labelled with the Atom63 version it came from.
   - The docs site publishes `llms.txt`, generated from the same index as the `atom63` CLI.
   - A consumer `AGENTS.md`, the rules from this repository's AGENTS.md that apply in an app, is
     published with the docs and kept in sync with the starter's.
7. **No consumer-facing promo site.** The docs homepage states the positioning in a few lines and
   links to install, the CLI and the templates.

## What this supersedes

- **roadmap-next.md, premise 1 (goal order):** open-source adoption moves from "nice, not
  required" to a goal of its own, pursued beside the maintainer's own products. Quality stays
  first.
- **roadmap-next.md, N11 option B and phase F5's dependency on F1 and F2:** replaced by item 5.
  The parts of F5 that would lock names before F1 freezes them (`registry:base`, the preset
  generator) still wait for F1.
- **ADR 0004, the 2026-11-21 positioning line:** "in-house-grade system" becomes "opinionated,
  open-source system for AI products". Kept from ADR 0004: the API close to shadcn but not
  identical, the role bridges, and shadcn compatibility as one integration among others. Changed:
  the registry is no longer templates and blocks only (item 6).
- **ADR 0007, the goal:** "internal products and AI builders" stays, and open-source adopters are
  added. ADR 0007's rejection of a public 1.0 stable bar is unchanged; open-source distribution
  ships as beta, with each component's maturity shown.

## Options considered

- **Sequence: self-use first, open source after F1 and F2** (the 2026-10-10 decision on N11). Why
  not: adoption is now a goal, outside users find problems the dogfood apps do not, and the first
  distribution steps (llms.txt, a consumer AGENTS.md, a positioning line) are cheap and lock no
  names.
- **Sequence: open source first, dogfood later.** Why not: real products using the system are the
  strongest proof of its quality, and they find the gaps first (the 2026-10-10 pilot found most of
  the gaps the roadmap now plans for).
- **Sequence: both in parallel** (chosen).
- **Difference: a recognisable brand look.** Not chosen; the maintainer said it is not the point.
- **Difference: "not built on Tailwind".** Not true; the system builds on Tailwind.
- **Difference: ownership of the whole chain for AI products** (chosen).
- **Registry: npm only.** Simplest, but an agent working in a shadcn project cannot add a single
  Atom63 component. **Copied source only.** Loses updates. **Both** (chosen), with npm as the
  default and copied source labelled with its version.

## Consequences

- Good: one sentence explains what Atom63 is for, and the docs homepage, the README and
  `llms.txt` can repeat it.
- Good: the AI-product patterns, which shadcn/ui does not cover, become the reason to choose the
  system instead of a side package.
- Good: outside feedback starts before the vocabulary freeze, while names can still change.
- Bad: shipping component source before F1 freezes the contract vocabulary means some copied
  components will drift when names change. The maturity label and the version stamp limit this;
  they do not remove it.
- Bad: open-source users bring issues and support load to a one-person project. The
  [support and governance policy](../support-governance.md) needs to say what the beta covers for
  copied source.
- Bad: the registry must build and test component source as a second distribution path
  (`check:registry`, `check:starter --shadcn`).

## Related work: Vercel Labs UI SDK

Vercel Labs released an open-source UI SDK in beta in November 2026. What it is, from its
[README](https://github.com/vercel-labs/ui) and an
[InfoQ report](https://infoq.com/news/2026/11/vercel-ui-sdk) dated 2026-11-18:

- Unstyled interaction behaviors for agents to compose (keyboard navigation, focus, selection,
  dismissal, popups, drag and drop, with their ARIA) in `@ui-sdk/core`, with adapters for React,
  Vue, Svelte, Solid and Web Components. InfoQ counts more than 50 behaviors, such as
  `createPopup`, `createSelection`, `createTypeahead` and `createFocusRecovery`, and gives the
  version as 0.1.0-beta.1 under Apache 2.0.
- An agent skill installed with `npx skills add`, which points the agent at Markdown docs shipped
  inside the installed packages.
- A runtime agent bridge, `createAgent`, which lets an agent read component state and call actions
  (snapshot, act, query) instead of reading screenshots. Changes made by the agent carry the
  source "agent" and the app can refuse them. The same methods can be offered to a browser's
  built-in agent through WebMCP.
- Styling is left to the app. InfoQ places shadcn/ui one level above it.

What Atom63 could borrow:

- **Docs inside the package.** Ship the agent index (or the component docs) in the npm tarballs,
  so an agent finds them in `node_modules` without network access. The CLI already answers from a
  generated index; this would put the same data where the agent looks first.
- **An installable skill.** Package the AGENTS.md rules and the CLI workflow as a skill, beside
  `llms.txt` and the MCP server.
- **Components an agent can operate.** The snapshot, act and query bridge fits the AI-product
  difference: an Atom63 chat or widget surface that an in-app agent can read and drive, with the
  app able to refuse a step. This is worth a study in `@atom63/agent`, not a commitment.

What it leaves to Atom63:

- It is a behavior layer, the same level as Base UI ([ADR 0001](./0001-base-ui-primitive-layer.md)).
  The tokens, themes, contracts, visuals, opinionated defaults, AI-product patterns and checks are
  all above it, and that is where Atom63's difference sits. Its arrival suggests behaviors are
  becoming shared infrastructure, which supports placing the opinion in the layer above.
- Replacing Base UI is not proposed. UI SDK is a 0.1 beta; a switch would be its own ADR, after it
  stabilises.

## Open questions

1. **Extension.** Is token-layer theming enough, or do adopters need to add their own component
   variants? This decides whether contracts need an extension point.
2. **Which components go into the registry as source first.** Proposed: the `stable` ones and the
   chat components; the rest stay npm-only until F1.
3. **Pattern packages (N12).** Should `@atom63/agent` and the chat components move out of
   "patterns, beta only" and into the core promise, since they carry the AI-product difference?
4. **License for copied source.** MIT covers it; the version stamp and attribution header need a
   format.

## Evidence

- Maintainer's answers in the 2026-11-24 roadmap discussion (internal record).
- [roadmap-next.md](../roadmap-next.md): premises, N11, phase table and decision table, updated in
  the same pull request as this record.
- Registry contents: [`apps/docs/public/r/registry.json`](../../../apps/docs/public/r/registry.json)
  (21 items: 8 pages, 13 blocks, 2026-11-24).
- Starter agent rules: [`packages/create/starter/app/AGENTS.md`](../../../packages/create/starter/app/AGENTS.md).
- Vercel Labs UI SDK: [repository](https://github.com/vercel-labs/ui) and
  [InfoQ, 2026-11-18](https://infoq.com/news/2026/11/vercel-ui-sdk).
