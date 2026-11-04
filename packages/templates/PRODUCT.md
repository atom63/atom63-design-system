# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are coding agents building web product interfaces with Atom63. Human developers who copy and adapt reviewed templates are a secondary audience.

## Product Purpose

`@atom63/templates` provides reviewed, copyable page and block implementations that reduce layout decisions and visual drift when a product interface is generated. Success means a builder can start from an appropriate template and preserve clear behavior across viewports and material states.

## Positioning

Templates encode reviewed composition and responsive behavior on top of Atom63 components and tokens. They are a source to copy into products, not another runtime component layer.

## Operating Context

Builders query Atom63 for a build kit, choose the closest page template and blocks, copy their source into a product, and adapt realistic product data and actions. Templates are evaluated in Storybook and through visual benchmarks that cover multiple states and viewport sizes.

## Capabilities and Constraints

- Compose existing Atom63 components and tokens before adding a new generic component.
- Keep templates web-only and copyable; do not turn them into a published runtime abstraction.
- Define desktop, tablet and phone behavior when a pattern changes topology across widths.
- Cover the material states a builder would otherwise have to invent, including selected, empty, loading or progress, success and overflow where applicable.
- Preserve semantic HTML, keyboard behavior and accessible composition when combining primitives.

## Evidence on Hand

The three-sample CRM visual benchmark in `docs/design-system/audits/vibe-crm-three-sample-synthesis-2026-11-03.md` is the current evidence for responsive list/detail weaknesses. No customer, market or outcome claims are established by that benchmark.

## Product Principles

- Encode reviewed decisions where generated implementations repeatedly drift.
- Prefer a complete responsive pattern over a larger catalog of underspecified parts.
- Keep product structure and state behavior explicit enough that builders do not infer them from a desktop screenshot.
- Treat implementation discipline and visual fidelity as separate outcomes and verify both.

## Accessibility & Inclusion

Templates must preserve native semantics, keyboard navigation, visible focus and valid accessible composition. Accessible primitives alone are not sufficient; template-level combinations must also pass automated accessibility checks.
