# Atom63 support and governance policy

Atom63 Design System is a public beta. This policy tells adopters and
contributors which surfaces are supported now, how compatibility decisions are
made, and what evidence is required before a surface becomes stable.

## Release status and authority

The supported install channel is the explicit `beta` dist-tag. The npm `latest`
tag currently resolving to a beta version does not make that version stable and
must not be treated as a stable compatibility promise. A stable release exists
only after it is announced in release notes, has an approved support matrix,
and is intentionally promoted to the stable/`latest` channel.

YZ is the final approver for:

- declaring a package or API stable;
- publishing to npm or changing npm dist-tags;
- adding, removing, or changing a public API support promise; and
- exceptions to this policy.

Maintainers, contributors, and agents may propose changes, assemble evidence,
run dry-runs and preflight checks, and verify a release candidate. They must not
silently promote a component, package, export, or release channel. Passing an
automated check is evidence for approval, not approval itself.

## Support tiers

| Tier                 | Current promise                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stable (future)      | Versioned public API with the approved compatibility matrix and stable deprecation rules. Atom63 has not declared this tier yet.                                                                              |
| Beta-supported       | Public beta install, import, type, CSS, and documented behavior paths. Changes may occur before stable, with release notes and migration guidance when adopters must act.                                     |
| Monitor-high-risk    | Public beta surface that needs additional browser, interaction, accessibility, performance, or SSR evidence. Use is supported for evaluation, but stable promotion is pending recorded evidence and approval. |
| Preview/experimental | Explicit evaluation surface, including `@atom63/ui-react/preview`. It may change or be removed during beta and carries no stable compatibility promise.                                                       |
| Private/internal     | Repository implementation, scripts, planning docs, fixtures, and unexported code. It is not a consumer API.                                                                                                   |

The machine-readable `@atom63/ui-react` assignments live in
[`ui-react-support-policy.json`](./ui-react-support-policy.json). An export being
available from the broad beta root does not by itself promote that export to a
future stable tier.

## What beta support covers

For the first-wave packages documented in the
[quickstart](./quickstart.md), beta support covers:

- installation through the documented `@beta` package path;
- documented CSS entries, including their token and theme contracts;
- documented package-root and public-subpath imports, subject to their assigned
  beta, monitor, or preview tier;
- exported TypeScript declarations as part of the API for the corresponding
  supported import path; and
- accessibility and interaction behavior that a component's public docs or
  recorded evidence explicitly describe.

Report regressions against these paths. During beta, support is best-effort and
does not include a response-time or resolution-time SLA.

Beta support does not guarantee:

- that every export in the broad `@atom63/ui-react` beta root will enter the
  stable root unchanged;
- compatibility for `@atom63/ui-react/preview` or another explicitly
  experimental surface;
- internal scripts, planning documents, fixtures, or unexported modules;
- examples as reusable public API contracts; or
- Figma output before its required manual QA has been completed and recorded.

## Browser and runtime scope

The beta React renderer targets React 19 and React DOM 19. It targets current
modern evergreen Chrome, Edge, Firefox, and Safari releases; Internet Explorer
and obsolete embedded browsers are out of scope. Components with motion must
honor reduced-motion behavior where documented. Browser-only behavior and
server rendering or hydration support apply only where the component docs or
evidence packet describe that boundary.

These are beta targets, not a completed compatibility certification. Before a
stable release, Atom63 must adopt and publish an explicit tested matrix of
React/runtime versions, browser versions, SSR/hydration coverage, and relevant
assistive-technology combinations.

## Changes, deprecation, and removal

Stable APIs must not receive silent breaking changes. Once stable exists, a
deprecated API must be identified in release notes and accompanied by migration
guidance. It will remain available for at least one subsequent stable minor
release, and removal requires a major release unless a security or correctness
issue makes that unsafe. Any emergency exception requires explicit YZ approval
and public release notes.

Beta-supported APIs may change or be removed before stable. When an adopter
must change code, the release must include release notes and a migration path;
the change must not be presented as a stable-compatible update. Preview and
experimental APIs may move faster, but their public changes must still be
called out in release notes when they affect a documented import path.

## Component promotion and retirement

A proposal to promote a component or API must identify an owner lane and attach
an evidence packet appropriate to its risk. The packet must include:

- the intended public API and assigned support tier;
- passing unit, type, package, and contract checks that apply to the surface;
- public usage and accessibility documentation;
- visual, real-browser, keyboard, pointer/touch, reduced-motion,
  assistive-technology, and SSR/manual QA where relevant; and
- the corresponding benchmark-parity board update, including remaining gaps.

Promotion occurs only after the evidence is reviewed and YZ explicitly approves
the public support change. Missing applicable evidence keeps the surface in
monitor-high-risk or preview.

A retirement proposal must name the owner, affected imports and consumers,
rationale, replacement or migration path, release-note plan, and benchmark
impact. Stable retirement follows the deprecation rules above. Beta retirement
may happen sooner, but requires documented migration guidance when adopters
must act. Private/internal code may be retired through normal review when no
public contract is affected.

## Contributions and reporting

Use [GitHub issues](https://github.com/atom63/atom63-design-system/issues) for
bugs, accessibility problems, documentation corrections, compatibility
reports, and component proposals. Include the smallest reproduction possible,
the Atom63 package and version, runtime and browser versions, and expected and
actual behavior. For accessibility reports, also include the input method,
assistive technology and version, operating system, and relevant component
state when available. Pull requests may propose and verify a change, but do not
themselves change its support tier or authorize a release.

Do not report suspected vulnerabilities in a public issue. Use GitHub's private
vulnerability-reporting route from the repository's **Security** tab. If that
route is unavailable, contact YZ privately through the contact route on the
[repository owner profile](https://github.com/atom63) and avoid disclosing
details publicly until the report has been acknowledged and a disclosure plan
has been agreed.

## Release and human gates

Automation may build packages, run tests, produce packed-tarball smoke results,
prepare release notes, and execute dry-run or preflight checks. It may not make
the final human decision. An npm publish, a change to `latest` or another
dist-tag, a stable promotion, or a change to public API support requires
explicit YZ approval for that action. Approval must be recorded in the release
or review trail; prior approval for a different version or surface does not
carry forward.
