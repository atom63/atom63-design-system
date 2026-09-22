# Atom63 Design System quickstart

Atom63 Design System is available as a public npm beta. It is not yet a stable
API, and the `latest` tag does not indicate stable support. Install the explicit
`beta` tags until a stable release is announced.

## 1. Install

For a React app:

```bash
pnpm add @atom63/styles@beta @atom63/ui-react@beta
```

`@atom63/ui-react` expects React 19 and React DOM 19 as peer dependencies. Add
them if the app does not already provide them.

## 2. Load the CSS

Import the foundation and React component recipes once in the application
entry:

```tsx
import '@atom63/styles'
import '@atom63/ui-react/styles.css'
```

The first import makes the token dependency explicit. The React stylesheet also
includes the foundation and reset, so do not add either import in multiple app
entry points.

## 3. Set theme and mode

Set the attributes on `<html>` so every component inherits them:

```html
<html class="light" data-a63-mode="light" data-a63-theme="modern">
```

Modes are `light` and `dark`. Bundled themes are `modern`, `aqua`, `retro`, and
`terminal`. Keep the class and `data-a63-mode` value in sync.

## 4. Render a component

Core controls come from the package root:

```tsx
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@atom63/ui-react'

export function InviteCard() {
  return (
    <Card>
      <CardHeader>
        <Badge>Beta</Badge>
        <CardTitle>Invite a collaborator</CardTitle>
      </CardHeader>
      <CardContent>
        <label htmlFor="invite-email">Email address</label>
        <Input id="invite-email" name="email" type="email" />
        <Button type="button">Send invite</Button>
      </CardContent>
    </Card>
  )
}
```

If the app uses Tailwind v4 or shadcn variables, optional adapters are available
from `@atom63/styles/tailwind` and `@atom63/styles/compat/shadcn`. They are not
required for Atom63 components.

## 5. Use preview APIs intentionally

Import low-level primitives and other preview escape hatches from the explicit
preview subpath:

```tsx
import { DialogPrimitive } from '@atom63/ui-react/preview'
```

Preview APIs do not carry a stable compatibility promise. The broad beta root
still exports some preview candidates, but stable/latest may narrow that root.
Do not treat an existing root export as evidence that it is stable.

## 6. Verify the consumer app

Run the app's normal typecheck and production build after installation:

```bash
pnpm typecheck
pnpm build
```

Use the equivalent package-filtered commands if the consumer is a monorepo.

## Where to go next

- [`@atom63/styles` package guide](../../packages/styles/README.md)
- [`@atom63/ui-react` package guide](../../packages/ui-react/README.md)
- [Support and governance policy](./support-governance.md)
- [Preview migration guidance](./ui-react-preview-migration.md)
- [`@atom63/ui-react` beta support policy](./ui-react-support-policy.json)
- [Beta release notes](./beta-release-notes.md)
- [Benchmark-parity board](./benchmark-parity.md)
