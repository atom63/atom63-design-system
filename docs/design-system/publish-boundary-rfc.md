# Atom63 Design System Publish Boundary RFC

**Status:** First-wave public beta boundary approved / no publish authorized
**Decision owner:** YZ  
**Scope:** The first-wave boundary, public access, and `beta` channel are approved for release preparation. This RFC does not authorize versioning, a release workflow change, or an npm publish.

## Decision

Atom63 should prepare a small design-system runtime surface for public beta while keeping internal tooling private. The initial public boundary is `@atom63/styles`, `@atom63/ui-react`, and `@atom63/ui-foundation`. `@atom63/icons` is not part of the default first wave unless Atom63 explicitly decides to ship an icon library.

The monorepo remains the source repository. A repository split is not required before beta and should be reconsidered only after external adoption creates a concrete maintenance or distribution need. YZ has approved public package access and the `beta` dist-tag for the first wave. No package may be published until the final preflight, npm organization/security checks, exact Changesets output, and publish commands receive a separate approval.

## Benchmark-informed rationale

The recommendation combines the useful parts of five established approaches:

| Benchmark | Relevant lesson for Atom63 |
| --- | --- |
| Whop Frosted UI | A public repository and package can ship with a clear work-in-progress warning. Lean file and CSS entry points plus explicit public access make the adoption boundary legible. |
| Meta Astryx | Public beta can coexist with a deliberate split between publishable packages and internal surfaces. Its core, theme, and CLI separation, agent-ready documentation, and distinction between examples and templates show how to expose adoption paths without publishing the whole toolchain. |
| Radix Themes | A single install, one CSS import, and one provider keep the first-use model easy to understand. Atom63 should preserve a similarly low-cognitive-load path even though its implementation spans several packages. |
| Primer | A stable root can coexist with `experimental`, `deprecated`, or `next` subpaths. Atom63 can use an explicit preview subpath when instability cannot remain private. |
| Shopify Polaris | A package ecosystem creates long-term API and support obligations. Atom63 should publish fewer packages and exports than the monorepo happens to contain. |

These references support a narrow beta boundary, not a claim that Atom63 is ready for a stable or comprehensive public platform.

## Recommended public boundary

| Package or surface | Recommended state | Supported purpose and boundary |
| --- | --- | --- |
| `@atom63/styles` | Public beta; strongest future `latest` candidate | Foundation CSS, tokens, semantic roles, contracts, and documented CSS entry points. This is the lowest-risk adopter surface, but its first publish still follows the beta policy below. |
| `@atom63/ui-react` | Public beta | Primary adopter value: supported React components and documented root exports. React and React DOM remain peer dependencies; every other runtime dependency must be bundled or publicly resolvable. |
| `@atom63/ui-foundation` | Public beta or preview contract package | Typed contracts for renderer authors and maintainers. It is not the UI runtime and should not be positioned as the default adopter entry point. |
| `@atom63/icons` | Optional / not first-wave by default | Do not publish only to satisfy internal default icons. Consumers should be able to use their own icon system. For first-wave public `ui-react`, prefer `lucide-react` for tiny default control icons plus icon slots/render props for overrides. Publish `@atom63/icons` later only if Atom63 intentionally ships a supported icon library. |
| Figma plugin, audits, scripts, QA harness, and examples | Repository-visible; not published to npm | These remain maintainer tools, verification evidence, or learning surfaces. Repository visibility does not make them supported package APIs. |

Everything else remains private by default. A package becomes public only through a later boundary decision; being useful inside the monorepo is not sufficient.

## Layer 2: headless and agent UX candidates

`@atom63/agent` and `@atom63/widgets` can become part of the public design-system ecosystem, but they are not part of the first runtime publish boundary. Treat them as Layer 2 candidates after the core packages prove installability and support discipline.

| Package | Future state | Required boundary before public beta |
| --- | --- | --- |
| `@atom63/widgets` | Candidate Layer 2 public beta | Decide whether it is truly headless, renderer-bound product widgets, or reusable product patterns. Add at least two external examples, document the headless versus rendered contract, and prove it does not depend on private app data. |
| `@atom63/agent` | Candidate Layer 2 public beta | Stabilize agent UX contracts: run states, tool-call timelines, approval/interruption affordances, evidence schemas, and privacy/data boundaries. Publish only when the package can be consumed without OS63 or private application runtime assumptions. |
| `@atom63/app-services` | Private | Application/service integration layer; too app-specific for the public design-system surface. |
| `@atom63/os63` | Private or showcase only | Product runtime and desktop shell; useful as proof of taste, not a reusable design-system package by default. |

Layer 2 packages should follow the same beta, smoke, README, and human-approval gates as Layer 1. They should not be used to broaden the first publish set.

## Release-channel policy

- The first publication must use a `beta` dist-tag. Do not publish `1.0.0` or assign `latest` unless YZ explicitly approves that exception.
- Use `canary` for automated prereleases if an automated prerelease path is added later. Canary builds are disposable validation artifacts, not supported releases.
- Promote a package to `latest` only after external-consumer evidence shows that installation, imports, CSS, runtime dependencies, upgrades, and documentation work outside the monorepo, and YZ approves the promotion.
- Version and tag choices must be recorded in the approved Changesets plan before publication.

## Public API rules

1. For the first `@atom63/ui-react` beta, keep the current broad root export to avoid pre-release churn, but do not imply that every root name has the same support level. The root is available; the support promise is tiered by [`ui-react-root-api-audit.md`](./ui-react-root-api-audit.md) and the machine-readable export inventory.
2. Beta-supported core families should keep prop, composition, accessibility, and exported-type compatibility through beta except for documented breaking changes delivered through the approved versioning and migration policy.
3. Conditional, monitor, and preview-candidate exports may remain importable during beta, but they require clearer evidence and may change, move to `./preview` or `./experimental`, or be removed before a stable/latest release.
4. Internal and private modules must not appear in package exports, packed files, generated references, or public examples unless they are intentionally classified as public beta, monitor, or preview surface.
5. Runtime dependencies must either be bundled into the published artifact or be publicly resolvable from the registry under the approved access policy. A public package must not depend on a private workspace package.
6. Icons are not a required design-system dependency by default. Components that need default controls should use a small, common default set such as `lucide-react` and still expose slots, render props, or prop overrides so adopters can bring their own icon system. Atom63 should publish `@atom63/icons` only as an intentional icon-library product, not as an accidental dependency leak.
7. Examples demonstrate supported APIs but are not themselves published packages. Internal tooling may inspect public packages; public packages must not import internal tooling.

## Required pre-publish gates

All automated gates below must pass before asking YZ to approve a real beta publish. Figma manual QA remains a separate stable/`latest` promotion gate.

| Gate | Required evidence |
| --- | --- |
| Package metadata and packed contents | Audit package name, description, version, `files`, export map, `repository.directory`, license, `sideEffects`, peer dependencies, runtime dependencies, and packed tarball contents for every proposed public package. |
| Packed consumer smoke test | `pnpm check:ds-pack-smoke` passes using packed artifacts rather than workspace source links. |
| External example build | `pnpm build:example:vite-basic` passes against the intended packed-package consumption path. |
| Adopter documentation | Each public package README includes an install and minimal quickstart that matches its supported entry points. The combined path should remain close to install, CSS import, and provider setup. |
| Token manifest drift | `pnpm check:token-manifest` passes and generated token/Figma artifacts are clean. |
| Figma manual QA | Complete the separate manual Figma verification before stable/`latest`. It does not block the first npm beta, and package automation does not imply code/Figma parity. |

The gates establish publish readiness; they do not authorize publishing.

## Explicit human approval gates

YZ has approved public access, the first-wave package list, the recommended version plan, and the `beta` dist-tag for release preparation. The following still require approval before publication:

- npm organization and `@atom63` scope ownership;
- the exact versions produced by the final Changesets dry-run;
- the first real publish and any later promotion to `latest`;
- repository split or package extraction timing.

Maintainers may add the approved first-wave `publishConfig.access: "public"` values and coordinated Changeset as preparation artifacts. They must not execute versioning, create or change a publishing workflow, push a release, or publish a package without the next human gate.

## Approved preparation sequence

The approved preparation sequence is:

1. Perform a metadata and `files` audit only. Record gaps without changing release behavior.
2. Rehearse extraction and packed consumption in a temporary repository to expose hidden workspace dependencies and repository-path assumptions.
3. Prepare a Changesets beta plan covering package order, prerelease versions, and the `beta` dist-tag. Do not execute it.
4. Present the audit, rehearsal evidence, gate results, and beta plan to YZ for explicit publishing approval.

Do not add a repository split, change a release workflow, execute Changesets versioning, or publish ahead of the next approval. The approved first-wave package manifests may declare public access explicitly.

## Related documents

- [Production readiness audit](./production-readiness-audit.md)
- [Package metadata audit](./package-metadata-audit.md)
- [`@atom63/ui-react` root API support audit](./ui-react-root-api-audit.md)
- [Changesets beta plan](./changesets-beta-plan.md)
- [Extraction rehearsal](./extraction-rehearsal.md)
- [First-wave public beta approval packet](./publish-approval-packet.md)
- [Package governance](./package-governance.md)
- [Authoring surfaces and value ownership](./authoring-surfaces.md)
