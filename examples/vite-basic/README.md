# Atom63 Vite basic example

A small release-readiness workspace that demonstrates direct consumption of
`@atom63/styles` and `@atom63/ui-react` from a Vite + React application.

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter atom63-vite-basic-example dev
```

Build the production bundle with:

```bash
pnpm --filter atom63-vite-basic-example build
```

The mode and theme controls write `data-a63-mode` and `data-a63-theme` to the
document root, so the same component composition can exercise multiple Atom63
theme states without app-specific component copies.

Built by You Zhang through Hermes Agent
