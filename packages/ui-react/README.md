# @atom63/ui-react

## What this package is

The primary React renderer for Atom63. It provides accessible components,
layout primitives, media, and theme controls backed by `@atom63/ui-foundation`
contracts and `@atom63/styles` tokens.

## Install

The package name is `@atom63/ui-react`, with React 19 and React DOM 19 as peer
dependencies. It is available as a public npm beta, not a stable API. Install
the explicit `beta` tags:

```sh
pnpm add @atom63/styles@beta @atom63/ui-react@beta
```

Add React 19 and React DOM 19 if the app does not already provide them. For the
complete external-consumer path, start with the
[public beta quickstart](../../docs/design-system/quickstart.md).

## Minimum setup

Load the shared CSS once, wrap your app with `Atom63Theme`, then render
components from the root entry point.

## CSS imports

Import the React stylesheet once from the application entry:

```tsx
import '@atom63/ui-react/styles.css'
```

The stylesheet includes the Atom63 foundation, reset, and component recipes.
Keep `@atom63/styles` installed because it is a package dependency, but no
second CSS import is needed for the standard React setup.

## First component

```tsx
import {
  Atom63Theme,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@atom63/ui-react'

export function Example() {
  return (
    <Atom63Theme mode="light" theme="modern">
      <Card>
        <CardHeader>
          <Badge>Preview</Badge>
          <CardTitle>Invite a collaborator</CardTitle>
        </CardHeader>
        <CardContent>
          <Input aria-label="Email address" placeholder="you@example.com" type="email" />
          <Button type="button" variant="primary">
            Send invite
          </Button>
        </CardContent>
      </Card>
    </Atom63Theme>
  )
}
```

These imports match the packed-package smoke path and the package root exports.

## Theming

`Atom63Theme` sets `data-a63-mode`, `data-a63-theme`, and the matching `light`
or `dark` class on its wrapper. It renders a `div` by default; use the `render`
prop when a different wrapper is needed.

```tsx
<Atom63Theme mode="dark" render={<main />} theme="modern">
  <App />
</Atom63Theme>
```

The bundled themes are `modern`, `aqua`, `retro`, and `terminal`. Use `light` or
`dark` for mode. Applications that need persisted appearance controls can use
the package's `@atom63/ui-react/theme` entry point after reviewing the theme
documentation.

## Stable vs preview

The production consumption path is verified by `pnpm check:ds-pack-smoke`
against packed tarballs, including the CSS imports and components above. The
package is publicly available under the `beta` tag, but it is not yet a
stable/latest compatibility promise.

For the first public beta, the package keeps the current broad root export to
avoid pre-release churn, but the support promise is tiered. Core controls are the
primary compatibility surface; monitor/preview-candidate exports may remain
importable while their evidence and API shape harden. Preview candidates are also
available from `@atom63/ui-react/preview`; that subpath is public but is not a
stable-compatibility promise. See the design-system handbook's root API audit
before treating a less common export as stable.

Preview escape hatches should use the explicit preview subpath:

```tsx
import { DialogPrimitive } from '@atom63/ui-react/preview'
```

The broad beta root still exports those names today, but stable/latest may narrow
the root. Treat `@atom63/ui-react/preview` as the safer import path for APIs that
are not part of the stable root promise.

## Docs

- [Public beta quickstart](../../docs/design-system/quickstart.md)
- [Support and governance policy](../../docs/design-system/support-governance.md)
- [Design system handbook](../../docs/design-system/README.md)
- [Preview migration guidance](../../docs/design-system/ui-react-preview-migration.md)
- [Component review and stability criteria](../../docs/design-system/ui-react-component-review.md)
- [Production readiness audit](../../docs/design-system/production-readiness-audit.md)
