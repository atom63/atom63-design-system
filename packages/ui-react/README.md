# @atom63/ui-react

## What this package is

The primary React renderer for Atom63. It provides accessible components,
layout primitives, media, and theme controls backed by `@atom63/ui-foundation`
contracts and `@atom63/styles` tokens.

Built by You Zhang through Hermes Agent

## Install

The package name is `@atom63/ui-react`, with React 19 and React DOM 19 as peer
dependencies. Public npm availability is not promised yet: the currently
verified paths are workspace dependencies or locally packed tarballs. Public
publishing requires YZ approval and confirmation of the npm organization policy.

After an approved public release, install by package name:

```sh
pnpm add @atom63/ui-react @atom63/styles react react-dom
```

Until then, use workspace dependencies:

```json
{
  "dependencies": {
    "@atom63/styles": "workspace:*",
    "@atom63/ui-react": "workspace:*",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

For a non-workspace consumer, use the packed artifacts for `@atom63/ui-react`
and its Atom63 package dependencies. The repository smoke test exercises that
exact installation shape before building a fresh Vite consumer.

## Minimum setup

Load the shared CSS once, then render components from the root entry point.

## CSS imports

Import the Atom63 foundation and the React recipe bundle once from the
application entry:

```tsx
import '@atom63/styles'
import '@atom63/ui-react/styles.css'
```

The full React stylesheet also includes the foundation and reset; the explicit
foundation import is retained here because it is the verified package smoke
path and makes the token dependency visible.

## First component

```tsx
import {
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
  )
}
```

These imports match the packed-package smoke path and the package root exports.

## Theming

Set theme and mode on a shared ancestor, normally `<html>`:

```html
<html class="dark" data-a63-mode="dark" data-a63-theme="modern">
```

The bundled themes are `modern`, `aqua`, `retro`, and `terminal`. Use `light` or
`dark` for mode. Applications that need persisted appearance controls can use
the package's `@atom63/ui-react/theme` entry point after reviewing the theme
documentation.

## Stable vs preview

The production consumption path is verified by `pnpm check:ds-pack-smoke`
against packed tarballs, including the CSS imports and components above. Public
publishing still requires YZ approval and npm organization policy.

For the first public beta, the package keeps the current broad root export to
avoid pre-release churn, but the support promise is tiered. Core controls are the
primary compatibility surface; monitor/preview-candidate exports may remain
importable while their evidence and API shape harden. See the design-system
handbook's root API audit before treating a less common export as stable.

## Docs

- [Design system handbook](../../docs/design-system/README.md)
- [Component review and stability criteria](../../docs/design-system/ui-react-component-review.md)
- [Production readiness audit](../../docs/design-system/production-readiness-audit.md)
