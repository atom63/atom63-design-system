# @atom63/ui-react Portal Evidence Packet

**Status:** partial evidence recorded; no stable promotion or export changes.

**Owner lane:** `design-system-infrastructure`

This packet records the current stable-readiness evidence for the monitor-high-risk
PortalContainer family. It is evidence for review, not a stable API promise. The family remains
importable from the beta root and remains monitor-high-risk until the manual and real-browser QA
below is completed and reviewed. Recording this packet gives all 7/7 high-risk families partial
evidence; it does not make any of them stable.

## API contract

The family consists of the `PortalContainer` type, `PortalContainerProvider`,
`PortalContainerProviderProps`, and `usePortalContainer`. The provider carries an existing
`HTMLElement`, `ShadowRoot`, `null`, or `undefined` through React context. Consumers outside a
provider read `undefined`; an explicit `null` is preserved so consumers can distinguish a known
but not-yet-available target if their own behavior requires it. Nested providers use the nearest
value, and provider value changes propagate through normal React context updates.

The provider does not create, own, append, remove, or choose a DOM node, and the hook does not
call `createPortal`. Overlay consumers own their fallback and portal lifecycle. This slice makes
no prop, runtime behavior, package-version, or root-export changes.

## Dependency and browser policy

- The implementation uses React context and adds no runtime dependency. Overlay consumers use
  their renderer's portal API; the automated harness uses the package's existing `react-dom`
  peer dependency.
- `HTMLElement` and `ShadowRoot` are browser DOM contracts. Callers own target creation and must
  not pass a node from a disposed document or shadow tree.
- The source is marked `use client`. It performs no DOM lookup or global access during module
  evaluation, but a real portal target only exists after client DOM setup. SSR-capable consumers
  should render a non-portalled fallback or no overlay while the context is `undefined`/`null`,
  then provide the target after mount.
- jsdom supports `attachShadow` and exercises the context and `createPortal` wiring used here. It
  does not prove browser layout, event retargeting across a shadow boundary, focus behavior,
  top-layer behavior, cross-document adoption, or server rendering and hydration.

## Automated evidence

```bash
pnpm --filter @atom63/ui-react exec vitest run \
  src/components/portal-container/portal-container.test.tsx
pnpm --filter @atom63/ui-react typecheck
pnpm --filter @atom63/ui-react lint
pnpm check:ui-react-monitor-evidence
```

Recorded coverage:

- `undefined` outside a provider and preservation of an explicit `null` value.
- `HTMLElement` and jsdom `ShadowRoot` values.
- Nearest-value behavior for nested providers and propagation after the provider value changes.
- Child rendering independent of the context value.
- A small `react-dom/createPortal` consumer harness that renders into a provided element or
  ShadowRoot and removes its portal content on unmount.
- Consumer-owned inline fallback behavior for both missing (`undefined`) and pending (`null`)
  targets, without asserting ReactDOM implementation details.

## Remaining manual and browser QA

- Exercise the actual Atom63 Dialog and Popover integrations with a body-level target, a nested
  provider, a missing target, and a target that becomes available after mount.
- Verify focus entry, focus restoration, Escape/outside interaction, scroll locking, stacking,
  and accessible naming in current Chrome, Safari, and Firefox.
- Verify a real open and closed Shadow DOM host for event retargeting, focus, styles/theme
  inheritance, cleanup when the host is removed, and expected overlay stacking.
- Run an SSR and hydration fixture in a supported framework: no target on the server, initial
  client fallback matching server markup, target installation after mount, and no hydration
  warning.
- Decide and document whether cross-document/iframe targets are supported. They are accepted by
  the structural type when represented by an `HTMLElement`, but are not covered by this packet.

**Stable decision:** remain monitor-high-risk. Context identity, update, nesting, ShadowRoot, and
basic portal-consumer behavior now have automated evidence, while real overlay integration,
cross-browser focus/events, Shadow DOM behavior, and SSR/hydration evidence remain incomplete.
