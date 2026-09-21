# Design system handbook

**Start here** if you are joining the team, reviewing a PR, or an agent about to change tokens, themes, contracts, or shared UI.

Executable styles package: [`packages/styles/README.md`](../../packages/styles/README.md).
Runnable adopter example: [`examples/vite-basic`](../../examples/vite-basic).
For this extracted workspace's local-only scope and first-wave package boundary, see
[extracted-repo-status.md](./extracted-repo-status.md).

## What this system is

Three first-wave packages own the extracted public-beta surface:

| Package | Role |
| --- | --- |
| `@atom63/styles` | CSS: shared scales, semantic roles, contracts, themes, OS chrome styles, adapters |
| `@atom63/ui-foundation` | TypeScript contracts + personalization axis SSOT (`axes.ts`) |
| `@atom63/ui-react` | React renderer, recipes, layout/media/theme subpaths, and appearance UI |

Product apps such as `atom63-vite` should eventually consume these packages from the published npm beta instead of redefining or importing their source workspace directly.

## Mental model (5 minutes)

```txt
App JSX          → Tailwind / shadcn roles   (bg-background, text-muted-foreground)
Shared component → ui-react recipe           reads --a63-*
Roles            → semantics / brand         what “primary” means
Shared scales    → foundation                palette, space, radius, type, blur…
Skin character   → themes/*.css              gel / bevel / CRT under [data-a63-theme]
```

**Foundation owns shared dictionaries.** Themes may keep skin-private material in the theme file. Do not dump every px into foundation, and do not invent a second global palette in a theme or contract.

Full policy: [authoring-surfaces.md](./authoring-surfaces.md) ← **canonical for where to edit**.

## Reading order

### Humans (new teammate)

1. This page
2. [extracted-repo-status.md](./extracted-repo-status.md) — current repository boundary
3. [authoring-surfaces.md](./authoring-surfaces.md) — where to edit
4. Design-system site: Architecture → Overview, then Foundation → Designing in code
5. [cross-renderer-contracts.md](./cross-renderer-contracts.md) for React/SwiftUI parity
6. [theme-authoring.md](./theme-authoring.md) if you touch skins
7. [personalization-axes.md](./personalization-axes.md) if you touch `data-a63-*`
8. [package-governance.md](./package-governance.md) + [ui-react-component-review.md](./ui-react-component-review.md) when shipping components
9. [publish-boundary-rfc.md](./publish-boundary-rfc.md), [ui-react-root-api-audit.md](./ui-react-root-api-audit.md), [changesets-beta-plan.md](./changesets-beta-plan.md), [extraction-rehearsal.md](./extraction-rehearsal.md), [publish-approval-packet.md](./publish-approval-packet.md), then [changesets-backlog-isolation.md](./changesets-backlog-isolation.md), before executing any public package release

### Agents / AI

1. Repo root [`AGENTS.md`](../../AGENTS.md) (always-on) — styles authoring bullet  
2. This page + [authoring-surfaces.md](./authoring-surfaces.md)  
3. Skill: `design-tokens` (Claude) / Cursor rule `.cursor/rules/styles-authoring.mdc`  
4. Design-system page **Architecture → Agent instructions** for product boundaries  
5. Verify `@atom63/ui-react` props via Storybook MCP when using components — never invent props  

## Where to edit (cheat sheet)

| You want to… | Open |
| --- | --- |
| Change blue-500 / spacing / radius / blur ladder | `packages/styles/src/tokens/foundation/*` |
| Change what “primary” means | `tokens/brand.css` / `semantics.css` |
| Make Aqua glossier / Retro chunkier / Terminal glow | `packages/styles/src/themes/<id>.css` |
| Add a shared Button+Input size knob | Contract growth rule → maybe `contracts/control.css` |
| Style a page in an app | Tailwind / shadcn roles only |
| Wire a shared component | Recipe in `@atom63/ui-react` reading `--a63-*` |

**Promote** a theme value into foundation only when a second theme, a contract default, or an adapter needs the same stop.

## Compat bridges (do not confuse)

| Import | Direction | Who |
| --- | --- | --- |
| `@atom63/styles/compat/shadcn` | `--a63-*` → shadcn names | Atom63 apps |
| `@atom63/styles/compat/a63-from-shadcn` | shadcn → `--a63-*` | External shadcn hosts only |

Never both in one Atom63 app (`pnpm check:app-consumption` enforces this).

## Checks that guard the system

```bash
pnpm check:control-alignment    # same size rung => same rendered height, and real touch targets, in a browser
pnpm check:app-consumption      # app CSS imports + no reverse compat in apps
pnpm check:component-contracts  # shared registry → React/Swift generated metadata
pnpm check:ios-tokens           # shared CSS foundation → generated Swift tokens
pnpm check:harness-architecture # theme authoring + package gates (umbrella)
pnpm --filter @atom63/styles test
```

Deferred shared-scale debt in contracts: [foundation-value-drift.md](./foundation-value-drift.md). Do **not** mass-migrate; harden when you already touch that pocket.

Web ↔ iOS component-token gap (including two commands above that are documented but not defined): [web-ios-token-parity.md](./web-ios-token-parity.md).

## Team norms

- Prefer the smallest owner (app → package → foundation).  
- Themes never fork component anatomy in React.  
- Docs track shipped behavior; archive plans that no longer describe reality.  
- When unsure, open [authoring-surfaces.md](./authoring-surfaces.md) — it wins on value ownership.

## Doc index

| Doc | Use for |
| --- | --- |
| [extracted-repo-status.md](./extracted-repo-status.md) | Local-only status, first-wave boundary, and `atom63-vite` follow-up |
| [authoring-surfaces.md](./authoring-surfaces.md) | Where to edit / value ownership |
| [theme-authoring.md](./theme-authoring.md) | Theme file guardrails |
| [personalization-axes.md](./personalization-axes.md) | `data-a63-*` ownership |
| [foundation-value-drift.md](./foundation-value-drift.md) | Known contract drift backlog |
| [attribute-runtime.md](./attribute-runtime.md) | Who stamps which attributes |
| [cross-renderer-contracts.md](./cross-renderer-contracts.md) | React/SwiftUI parity levels and authoring flow |
| [web-ios-token-parity.md](./web-ios-token-parity.md) | Assessment: where the iOS renderer diverges from the web component-token layer |
| [ui-react-component-review.md](./ui-react-component-review.md) | Component PR checklist |
| [package-governance.md](./package-governance.md) | Package boundaries |
| [publish-boundary-rfc.md](./publish-boundary-rfc.md) | Proposed public beta boundary and pre-publish approval gates |
| [ui-react-root-api-audit.md](./ui-react-root-api-audit.md) | Proposed support tiers for the broad `@atom63/ui-react` root and public subpaths |
| [package-metadata-audit.md](./package-metadata-audit.md) | First-wave package metadata and packed-content gaps |
| [changesets-beta-plan.md](./changesets-beta-plan.md) | First-wave prerelease order, coordinated unexecuted Changeset, and approval gates |
| [extraction-rehearsal.md](./extraction-rehearsal.md) | Local external-repo tarball rehearsal evidence before versioning or publish approval |
| [publish-approval-packet.md](./publish-approval-packet.md) | Approved first-wave beta decisions, evidence, risks, preflight, and exact no-publish boundary |
| [changesets-backlog-isolation.md](./changesets-backlog-isolation.md) | Why the current Changesets backlog must be isolated before DS beta versioning |
| [react-first-status.md](./react-first-status.md) | Historical checkpoint (not primary policy) |
