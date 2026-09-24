# Design system handbook

**Public adopters:** start with the [public beta quickstart](./quickstart.md) for
install, CSS, theming, a first component, preview policy, and verification.

**Contributors:** start here if you are joining the team, reviewing a PR, or an
agent about to change tokens, themes, contracts, or shared UI.

Executable styles package: [`packages/styles/README.md`](../../packages/styles/README.md).
Runnable adopter example: [`examples/vite-basic`](../../examples/vite-basic).
Current direction and progress: [roadmap.md](./roadmap.md) (phases A–E) and
[token-single-source.md](./token-single-source.md) (DTCG as the only token source).

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

### Public adopters

1. [quickstart.md](./quickstart.md) — install through first themed component
2. [`@atom63/styles` package guide](../../packages/styles/README.md) or [`@atom63/ui-react` package guide](../../packages/ui-react/README.md) — package details
3. [support-governance.md](./support-governance.md) — support scope, compatibility, reporting, deprecation, and approval policy
4. [ui-react-preview-migration.md](./ui-react-preview-migration.md) and [ui-react-support-policy.json](./ui-react-support-policy.json) — beta API boundaries
5. [beta-release-notes.md](./beta-release-notes.md) and [benchmark-parity.md](./benchmark-parity.md) — current status and stable-readiness gaps

### Humans (new teammate)

1. This page
2. [roadmap.md](./roadmap.md) — direction, phases and what is done
3. [authoring-surfaces.md](./authoring-surfaces.md) — where to edit
4. Design-system site: Architecture → Overview, then Foundation → Designing in code
5. [cross-renderer-contracts.md](./cross-renderer-contracts.md) for React/SwiftUI parity
6. [theme-authoring.md](./theme-authoring.md) if you touch skins
7. [personalization-axes.md](./personalization-axes.md) if you touch `data-a63-*`
8. [package-governance.md](./package-governance.md) + [ui-react-component-review.md](./ui-react-component-review.md) when shipping components
9. [release-automation.md](./release-automation.md), [beta-release-notes.md](./beta-release-notes.md) and [ui-react-root-api-audit.md](./ui-react-root-api-audit.md) before a release

### Agents / AI

1. This page + [authoring-surfaces.md](./authoring-surfaces.md)  
2. [CONTRIBUTING.md](../../CONTRIBUTING.md) — DTCG sources, generated files, and the checks CI runs  
3. [token-single-source.md](./token-single-source.md) — how tokens, resolvers, and derived values are structured  
4. Design-system page **Architecture → Agent instructions** for product boundaries  
5. Verify `@atom63/ui-react` props via Storybook MCP when using components — never invent props  

## Where to edit (cheat sheet)

| You want to… | Open |
| --- | --- |
| Change blue-500 / spacing | `packages/styles/src/tokens/foundation/*.tokens.json` |
| Change the radius or blur ladder | `packages/styles/src/tokens/foundation/radius.tokens.json`, `effects.resolver.json` |
| Change the type scale | `packages/styles/src/tokens/foundation/typography.resolver.json` |
| Change what “primary” means | `tokens/brand-action.resolver.json` / `tokens/semantics.resolver.json` |
| Make Aqua glossier / Retro chunkier / Terminal glow | `packages/styles/src/themes/<id>.resolver.json` |
| Add a shared Button+Input size knob | Contract growth rule → maybe `contracts/control.tokens.json` |
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
| [quickstart.md](./quickstart.md) | Public beta install, CSS, theme/mode, first component, preview policy, and consumer verification |
| [support-governance.md](./support-governance.md) | Public support tiers, compatibility scope, reporting routes, deprecation rules, lifecycle gates, and release authority |
| [authoring-surfaces.md](./authoring-surfaces.md) | Where to edit / value ownership |
| [theme-authoring.md](./theme-authoring.md) | Theme file guardrails |
| [personalization-axes.md](./personalization-axes.md) | `data-a63-*` ownership |
| [foundation-value-drift.md](./foundation-value-drift.md) | Known contract drift backlog |
| [attribute-runtime.md](./attribute-runtime.md) | Who stamps which attributes |
| [cross-renderer-contracts.md](./cross-renderer-contracts.md) | React/SwiftUI parity levels and authoring flow |
| [web-ios-token-parity.md](./web-ios-token-parity.md) | Assessment: where the iOS renderer diverges from the web component-token layer |
| [ui-react-component-review.md](./ui-react-component-review.md) | Component PR checklist |
| [visual-qa-matrix.json](./visual-qa-matrix.json) | Versioned visual QA route, viewport, theme, state, and reduced-motion matrix |
| [package-governance.md](./package-governance.md) | Package boundaries |
| [dependency-version-policy.json](./dependency-version-policy.json) | Machine-readable React peer, runtime dependency, type-visible dependency, and stable semver policy |
| [beta-release-notes.md](./beta-release-notes.md) | Current public beta versions, npm dist-tags, adopter evidence, and stable-readiness checklist |
| [benchmark-parity.md](./benchmark-parity.md) | Generated benchmark-parity board for stable-readiness gates, evidence, gaps, owners, and next actions |
| [benchmark-parity-source.json](./benchmark-parity-source.json) | Human-authored machine-readable source for the benchmark-parity board |
| [ui-react-support-policy.json](./ui-react-support-policy.json) | Machine-readable `@atom63/ui-react` beta support tiers, symbol overrides, public subpath policy, and stable blockers |
| [ui-react-stable-promotion-decisions.json](./ui-react-stable-promotion-decisions.json) | Human-authored stable API decision register for every P0 root/source family and P0/P1 public subpath; keeps the beta root unchanged |
| [ui-react-stable-action-matrix.md](./ui-react-stable-action-matrix.md) | Stable/latest action matrix for broad `@atom63/ui-react` root exports and public subpaths |
| [ui-react-monitor-evidence-matrix.md](./ui-react-monitor-evidence-matrix.md) | Stable-readiness evidence matrix for monitor/high-risk `@atom63/ui-react` families |
| [ui-react-forms-evidence.md](./ui-react-forms-evidence.md) | Partial stable-readiness evidence packet for Autocomplete, Calendar, and InputOTP |
| [ui-react-media-evidence.md](./ui-react-media-evidence.md) | Partial stable-readiness evidence packet for Carousel, useExtractColor, and extract-color |
| [ui-react-portal-evidence.md](./ui-react-portal-evidence.md) | Partial stable-readiness evidence packet for PortalContainer |
| [ui-react-preview-cleanup-plan.md](./ui-react-preview-cleanup-plan.md) | Preview-symbol cleanup plan for root exports that should move to preview/private before stable |
| [ui-react-preview-migration.md](./ui-react-preview-migration.md) | Root-to-preview import guidance for beta adopters and stable/latest root narrowing |
| [roadmap.md](./roadmap.md) | Direction for phases A–E, decisions D1–D5 and progress |
| [token-single-source.md](./token-single-source.md) | Phase B design: DTCG as the only token source, CSS-native values, themes in Figma and iOS |
| [release-automation.md](./release-automation.md) | GitHub Actions beta release workflow, stable/latest no-publish preflight, and npm trusted publishing setup notes |
| [stable-release-policy.json](./stable-release-policy.json) | Machine-readable stable/latest dist-tag, registry readback, and rollback policy |
| [ui-react-root-api-audit.md](./ui-react-root-api-audit.md) | Proposed support tiers for the broad `@atom63/ui-react` root and public subpaths |
| [../../examples/product-shell/README.md](../../examples/product-shell/README.md) | DS-owned application presentation layer; keeps `atom63-vite` as the real portfolio consumer |
| [react-first-status.md](./react-first-status.md) | Historical checkpoint (not primary policy) |
