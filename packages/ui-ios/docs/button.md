# Button iOS Contract

## Foundation Contract

The iOS Button contract mirrors `@atom63/ui-foundation`:

- shared intent: action variants, loading/disabled states, semantic color slots
- native variants: `primary`, `neutral`, `secondary`, `destructive`, `outline`,
  `ghost`
- native sizes: `compact`, `regular`, `large`, `icon`
- states: `rest`, `pressed`, `focusVisible`, `disabled`, `loading`
- anatomy: `root`, `label`, `icon`, `spinner`

The native vocabulary is deliberately smaller than the web renderer. Web-only
variants such as `link`, `overlay`, and `glass` should use native navigation or
material patterns instead of forcing CSS anatomy onto iOS.

## SwiftUI API

```swift
enum AtomButtonVariant {
  case primary
  case neutral
  case secondary
  case destructive
  case outline
  case ghost
}

enum AtomControlSize {
  case compact
  case regular
  case large
  case icon
}

AtomButton("Continue", variant: .primary, fullWidth: true) {
  continueFlow()
}
```

## Behavior Notes

- Touch target should be at least 44 pt.
- Pressed feedback should use native scale/opacity rather than web hover.
- Loading state should preserve button width and expose progress semantics where
  appropriate.
- Disabled state should preserve contrast while clearly reducing affordance.
- Dynamic Type should scale label typography before changing component anatomy.
- Keyboard/focus handling should follow iPadOS and macOS Catalyst conventions
  when applicable.

## Token Mapping

The JSON token map uses conceptual slots from `@atom63/ui-foundation`, not CSS
variable names. SwiftUI may map these slots to generated values, design tokens,
or direct `ShapeStyle` definitions.
