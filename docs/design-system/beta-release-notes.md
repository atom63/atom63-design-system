# Atom63 Design System beta release notes

Status: public npm beta, not stable/latest.

## Current beta packages

Install from the npm `beta` dist-tag:

```bash
pnpm add @atom63/styles@beta @atom63/ui-foundation@beta @atom63/ui-react@beta
```

Current published beta versions:

| Package | Beta version | Notes |
| --- | --- | --- |
| `@atom63/styles` | `0.1.0-beta.0` | CSS tokens, themes, contracts, utilities |
| `@atom63/ui-foundation` | `0.1.1-beta.0` | Platform-neutral TypeScript contracts |
| `@atom63/ui-react` | `0.2.0-beta.2` | React components, layout/media/theme subpaths |

`@atom63/ui-react@0.2.0-beta.2` pins `@base-ui/react` to `1.6.0` so adopters do not resolve a newer Base UI release with incompatible Tooltip types.

## Dist-tag state

`beta` is the supported install tag for this release.

Current npm state:

| Package | `beta` | `latest` |
| --- | --- | --- |
| `@atom63/styles` | `0.1.0-beta.0` | `0.1.0-beta.0` |
| `@atom63/ui-foundation` | `0.1.1-beta.0` | `0.1.1-beta.0` |
| `@atom63/ui-react` | `0.2.0-beta.2` | `0.2.0-beta.2` |

The initial npm publishes created `latest` automatically. npm currently returns `403` for deleting `latest` with the available token/session, so the mitigation is to keep `latest` synchronized with the current safe beta. Production/stable docs should still instruct consumers to install with `@beta` until a real stable release exists.

## Release evidence

### Design-system repo

Repository: `https://github.com/atom63/atom63-design-system`

Relevant commits:

- `44f26b4 chore: version ui-react beta.2`
- `4368862 fix: pin Base UI for DS beta adopters`
- `62bf6e2 fix: keep ui-react workspace deps for CI`
- `7e6650e fix: publish registry-safe ui-react beta`

CI evidence:

- `https://github.com/atom63/atom63-design-system/actions/runs/35657779744`

Verified locally before publish:

```bash
pnpm --filter @atom63/ui-react build
pnpm check:ds-pack-smoke
pnpm build:example:vite-basic
```

Verified npm read-back:

```bash
npm view @atom63/ui-react@beta name version dist-tags dependencies --json
```

Expected critical dependency values:

```json
{
  "version": "0.2.0-beta.2",
  "dependencies": {
    "@atom63/styles": "0.1.0-beta.0",
    "@atom63/ui-foundation": "0.1.1-beta.0",
    "@base-ui/react": "1.6.0"
  }
}
```

### Real adopter evidence

Adopter branch:

- Repo: `https://github.com/atom63/atom63-vite`
- Branch: `chore/ds-beta-adopter`
- Worktree used locally: `/Users/yz/Projects/atom63-vite-ds-adopter`

Evidence commits:

- `f177031a test: consume DS beta packages in Vite fixture`
- `d2bd8df2 test: validate website against DS beta packages`
- `771c2c7b test: align Base UI for DS beta adoption`

Verified commands:

```bash
pnpm --filter @atom63/fixture-vite typecheck
pnpm --filter @atom63/fixture-vite build
A63_USE_PUBLISHED_DS=1 pnpm --filter @atom63/website typecheck
A63_USE_PUBLISHED_DS=1 pnpm --filter @atom63/website build
```

Browser/visual sanity was performed against the `atom63.io` preview with `A63_USE_PUBLISHED_DS=1`; homepage and `/ds-lab` rendered normally, and YZ confirmed the visual result looked correct.

## Known beta constraints

- This is a beta surface, not a stable/latest contract.
- Root `@atom63/ui-react` remains broad for beta ergonomics; stable should narrow or tier support.
- `@atom63/icons` is not a required first-wave dependency. `@atom63/ui-react` defaults to `lucide-react`, and consumers may provide their own icon system.
- `@atom63/agent`, `@atom63/widgets`, `@atom63/mdx`, `@atom63/ui-ios`, and Figma surfaces are not in the first-wave public npm runtime.
- `atom63-vite` still uses workspace packages by default; published DS consumption is opt-in through the adopter branch and `A63_USE_PUBLISHED_DS=1`.

## Stable-readiness checklist

Before promoting any package to stable/latest:

- [ ] Finish npm `latest` policy and stable promotion plan so prereleases do not accidentally become default installs.
- [x] Add a manual GitHub Actions beta release workflow scaffold for trusted publishing / npm provenance.
- [x] Configure npm trusted publishers and GitHub `npm-publish` environment reviewers before running `publish=true`.
- [ ] Keep `@base-ui/react` and other type-visible dependencies under an explicit dependency policy.
- [ ] Run clean external registry install/build smoke after publish.
- [ ] Keep `atom63-vite` adopter smoke green without root override workarounds.
- [x] Audit `@atom63/ui-react` root exports and define beta support tiers in `docs/design-system/ui-react-support-policy.json`; CI now checks the generated export inventory for drift.
- [x] Audit published file lists for CSS, dist output, and accidental test/internal files; CI now regenerates `docs/design-system/audits/package-surface.json` and fails on drift.
- [ ] Run a full visual QA matrix: homepage, `/ds-lab`, component gallery, mobile/desktop, light/dark, theme variants, keyboard/focus states, reduced motion.
- [ ] Complete Figma manual QA: variables sync, styleguide generation, idempotent rerun.
- [ ] Clean docs IA so beta/stable users can find install, theming, component, and migration guidance without reading internal planning docs.
