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

Import the React stylesheet once in the application entry:

```tsx
import '@atom63/ui-react/styles.css'
```

The stylesheet includes the Atom63 foundation, reset, and component recipes.
Keep `@atom63/styles` installed because it is a package dependency, but the
standard React setup needs only this CSS import.

## 3. Set theme and mode

Wrap the application with `Atom63Theme`:

```tsx
import { Atom63Theme } from '@atom63/ui-react'

export function Root() {
  return (
    <Atom63Theme mode="light" theme="modern">
      <App />
    </Atom63Theme>
  )
}
```

Modes are `light` and `dark`. Bundled themes are `modern`, `aqua`, `retro`, and
`terminal`. The wrapper keeps the mode class and attributes in sync. It renders
a `div` by default and accepts the package-standard `render` prop for a custom
wrapper.

## 4. Render a component

Core controls come from the package root:

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

export function InviteCard() {
  return (
    <Atom63Theme mode="light" theme="modern">
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
    </Atom63Theme>
  )
}
```

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
