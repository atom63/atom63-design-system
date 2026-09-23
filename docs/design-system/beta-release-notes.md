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
| `@atom63/styles` | `0.1.0-beta.2` | CSS tokens, themes, contracts, utilities, the token manifest (`./tokens.json`), and the Figma variable model (`./figma-sync.json`) |
| `@atom63/ui-foundation` | `0.1.1-beta.1` | Platform-neutral TypeScript contracts |
| `@atom63/ui-react` | `0.2.0-beta.6` | React components, layout/media/theme subpaths |

These versions are the first published from GitHub Actions through npm trusted publishing, with provenance. `@atom63/ui-react@0.2.0-beta.6` resolves `vite dev` consumers to `dist`, ships the Tailwind utilities its components use in `styles.css`, and types `FeedbackState` icons. It still pins `@base-ui/react` to `1.6.0`.

## Dist-tag state

`beta` is the supported install tag for this release.

Current npm state:

| Package | `beta` | `latest` |
| --- | --- | --- |
| `@atom63/styles` | `0.1.0-beta.2` | `0.1.0-beta.2` |
| `@atom63/ui-foundation` | `0.1.1-beta.1` | `0.1.1-beta.1` |
| `@atom63/ui-react` | `0.2.0-beta.6` | `0.2.0-beta.6` |

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

Registry-only consumer evidence is now generated from a clean temporary Vite/React app outside the repository. The smoke requests all three first-wave packages through the public npm `beta` dist-tag, rejects local dependency protocols, reads the resolved versions from the consumer's `node_modules`, then runs `tsc --noEmit` and `vite build`:

```bash
pnpm check:ds-registry-smoke
```

The deterministic readback is checked in at [audits/registry-consumer-smoke.json](./audits/registry-consumer-smoke.json). CI and beta release preflight rerun the registry-only smoke and fail if the published resolutions or verification evidence drift. After an approved publish, refresh the readback explicitly with `pnpm check:ds-registry-smoke -- --write`.

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

Product adopter PR:

- Repo: `https://github.com/atom63/atom63-vite`
- PR: [`#416`](https://github.com/atom63/atom63-vite/pull/416)
- Merge commit: `9d6bad116094cc6974e8eb721938ae6f569ba457`

Verified commands:

```bash
pnpm check:fixture-published-ds
pnpm check:website-ds-resolution
pnpm check:website-published-ds
A63_USE_PUBLISHED_DS=1 pnpm --filter @atom63/website build
```

The merged adopter checks cover a fixture published-package smoke, an `atom63.io` resolver check, and a temp-repo website smoke that consumes the published DS beta packages while keeping non-DS workspace packages local. Browser/visual sanity compared published and default DS paths across `/`, `/ds-lab`, and `/design-system` on desktop and mobile; no published-path-only visual regression was observed.

## Known beta constraints

- This is a beta surface, not a stable/latest contract.
- Root `@atom63/ui-react` remains broad for beta ergonomics; stable should narrow or tier support.
- `@atom63/icons` is not a required first-wave dependency. `@atom63/ui-react` defaults to `lucide-react`, and consumers may provide their own icon system.
- `@atom63/agent`, `@atom63/widgets`, `@atom63/mdx`, `@atom63/ui-ios`, and Figma surfaces are not in the first-wave public npm runtime.
- `atom63-vite` still uses workspace packages by default for local development; published DS consumption is verified through repeatable adopter checks and `A63_USE_PUBLISHED_DS=1`.

## Stable-readiness checklist

Before promoting any package to stable/latest:

- [x] Generate the [benchmark-parity stable-readiness board](./benchmark-parity.md) from a machine-readable source and enforce drift checks in CI and the beta release dry-run.
- [ ] Finish npm `latest` policy and stable promotion plan so prereleases do not accidentally become default installs.
- [x] Add a manual GitHub Actions beta release workflow scaffold for trusted publishing / npm provenance.
- [x] Configure npm trusted publishers and GitHub `npm-publish` environment reviewers before running `publish=true`.
- [x] Keep `@base-ui/react` and other type-visible dependencies under an explicit dependency policy; `pnpm check:dependency-version-policy` now audits React peers, runtime dependencies, type-visible dependency ranges, and stable semver categories.
- [x] Run a clean external registry install, typecheck, and production-build smoke for the current first-wave beta packages; CI and beta release preflight now enforce the checked-in registry readback.
- [ ] Keep the registry smoke green after every approved beta or stable publish and add a stable/latest readback when stable promotion is approved.
- [x] Keep `atom63-vite` adopter smoke green without root override workarounds; PR [#416](https://github.com/atom63/atom63-vite/pull/416) added fixture, resolver, and website temp-repo published DS checks.
- [x] Audit `@atom63/ui-react` root exports and define beta support tiers in `docs/design-system/ui-react-support-policy.json`; CI now checks the generated export inventory for drift.
- [x] Generate a stable/latest action matrix for `@atom63/ui-react` root exports and public subpaths in `docs/design-system/ui-react-stable-action-matrix.md`; CI now checks it for drift.
- [x] Record and enforce non-breaking stable-promotion decisions for every P0 root/source family and P0/P1 public subpath; beta root exports remain unchanged pending stable approval.
- [x] Draft preview-symbol cleanup plan for `Primitive` aliases, imperative handles, internal helpers, conformance evidence, and raw motion constants.
- [x] Implement preview cleanup Slice A: add `@atom63/ui-react/preview`, keep root unchanged, and add packed-consumer preview import coverage.
- [x] Implement preview cleanup Slice B: document root-to-preview migration examples and deprecation language before stable narrowing is explicitly approved.
- [x] Generate a monitor-high-risk evidence matrix for Autocomplete, Calendar, Carousel, media/color extraction, and other high-risk `@atom63/ui-react` APIs.
- [x] Record partial forms-lane evidence for Autocomplete, Calendar, and InputOTP; keep all three monitor-high-risk pending browser, mobile, and assistive-technology QA.
- [x] Record partial media-lane evidence for Carousel, useExtractColor, and extract-color; keep all three monitor-high-risk pending real-browser gesture, CORS/canvas, performance, and assistive-technology QA. See [ui-react-media-evidence.md](./ui-react-media-evidence.md).
- [x] Record partial infrastructure-lane evidence for PortalContainer, completing partial evidence for all 7/7 high-risk families; keep it monitor-high-risk pending real-browser overlay, Shadow DOM, and SSR/hydration QA. See [ui-react-portal-evidence.md](./ui-react-portal-evidence.md).
- [x] Audit published file lists for CSS, dist output, and accidental test/internal files; CI now regenerates `docs/design-system/audits/package-surface.json` and fails on drift.
- [x] Run a versioned visual QA matrix definition and published/default product-adopter sanity pass; full stable component-state screenshot baselines remain pending.
- [ ] Complete Figma manual QA: variables sync, styleguide generation, idempotent rerun.
- [x] Create a public adopter [quickstart](./quickstart.md) covering beta install, CSS, theme/mode, a first component, preview policy, and consumer verification.
- [x] Publish the public [support and governance policy](./support-governance.md) covering beta scope, compatibility tiers, deprecation, reporting, lifecycle evidence, and human release gates.
- [ ] Enforce support-tier and human-approval boundaries in release and API-change checks, and adopt the final stable browser/runtime/assistive-technology support matrix.
- [ ] Complete stable docs IA with component reference pages and accessibility guidance.
