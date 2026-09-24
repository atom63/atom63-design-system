# Atom63 Design System

[![npm](https://img.shields.io/npm/v/@atom63/ui-react/beta?label=%40atom63%2Fui-react)](https://www.npmjs.com/package/@atom63/ui-react)
[![CI](https://github.com/atom63/atom63-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/atom63/atom63-design-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

One token architecture for React, SwiftUI, and Figma. Atom63 defines its design tokens once, in
CSS, and delivers them to every platform: React components on the web, SwiftUI components on iOS,
and Figma variables for designers.

**Documentation:** [system.atom63.io](https://system.atom63.io)

> Atom63 is in public beta. APIs can change before the stable release; install from the `beta`
> tag and read the [release notes](./docs/design-system/beta-release-notes.md) when upgrading.

## Packages

| Package                                          | Platform | What it provides                                                    |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| [`@atom63/ui-react`](./packages/ui-react)        | Web      | React components, layout primitives, media, and theme controls      |
| [`@atom63/styles`](./packages/styles)            | Web      | CSS tokens, themes, contracts, and utilities                        |
| [`@atom63/ui-foundation`](./packages/ui-foundation) | Any   | Platform-neutral TypeScript contracts and environment types         |
| [`Atom63UI`](./packages/ui-ios)                  | iOS      | SwiftUI components generated from the same tokens, via SwiftPM      |
| [Figma plugin](./apps/figma-plugin)              | Figma    | Syncs the tokens into Figma variables, one collection per theme axis |

## Quick start: React

```bash
pnpm add @atom63/styles@beta @atom63/ui-react@beta
```

`@atom63/ui-react` needs React 19. Import the stylesheet once, wrap the app in `Atom63Theme`, and
use components from the package root:

```tsx
import '@atom63/ui-react/styles.css'
import { Atom63Theme, Button, Card, CardContent, CardHeader, CardTitle } from '@atom63/ui-react'

export function App() {
  return (
    <Atom63Theme mode="light" theme="modern">
      <Card>
        <CardHeader>
          <CardTitle>Hello, Atom63</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button">Get started</Button>
        </CardContent>
      </Card>
    </Atom63Theme>
  )
}
```

Modes are `light` and `dark`; bundled themes are `modern`, `aqua`, `retro`, and `terminal`. The
[quickstart](./docs/design-system/quickstart.md) covers forms, preview APIs, and verification.

## Quick start: SwiftUI

Add the package in Xcode (**File → Add Package Dependencies**) or in `Package.swift`:

```swift
.package(url: "https://github.com/atom63/atom63-design-system", branch: "main")
```

Then depend on the `Atom63UI` product:

```swift
import Atom63UI

AtomButton("Continue", variant: .primary) {
    continueFlow()
}
```

`Atom63UI` targets iOS 17+ and macOS 14+. See the [package guide](./packages/ui-ios/README.md).

## Examples

- [`examples/vite-basic`](./examples/vite-basic): the smallest React and Vite app.
- [`examples/product-shell`](./examples/product-shell): a responsive app shell built from cards, tabs, inputs, and
  empty states.
- [`examples/ios-demo`](./examples/ios-demo): a SwiftUI demo app with UI tests.

## Contributing

Bug reports, accessibility reports, and proposals are welcome. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) to set up the repository, and report security issues as
described in [SECURITY.md](./SECURITY.md). Everyone taking part follows the
[Code of Conduct](./CODE_OF_CONDUCT.md). The
[support and governance policy](./docs/design-system/support-governance.md) explains what the beta
covers.

## Acknowledgements

Atom63 builds on [Base UI](https://base-ui.com) for accessible primitives and
[Tailwind CSS](https://tailwindcss.com) for utilities, and its component APIs follow conventions
popularized by [shadcn/ui](https://ui.shadcn.com).

## License

[MIT](./LICENSE). Created by You Zhang.
