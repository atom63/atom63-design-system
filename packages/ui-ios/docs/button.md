# Button iOS Contract

## Foundation Contract

The iOS Button contract comes from the intent in
`packages/ui-foundation/contracts/components/button.json`, the same source as the
web renderer's:

- tone: `neutral`, `primary`, `destructive`
- emphasis: `solid`, `soft`, `outline`, `ghost`
- native sizes: `compact`, `regular`, `large` (the intent's sm, md and lg) and
  `icon` (an icon-only md)
- states: `rest`, `pressed`, `focusVisible`, `disabled`, `loading`
- anatomy: `root`, `label`, `icon`, `spinner`

`AtomButtonTone`, `AtomButtonEmphasis`, `AtomControlSize` and the older
`AtomButtonVariant` are generated from that file. Web-only variants such as
`link` and `overlay` should use native navigation or material patterns instead
of forcing CSS anatomy onto iOS.

## SwiftUI API

```swift
AtomButton("Continue", tone: .primary, fullWidth: true) {
  continueFlow()
}

AtomButton("Delete", tone: .destructive, emphasis: .soft) {
  delete()
}

// The same look on a native Button:
Button("Save", action: save)
  .buttonStyle(AtomButtonStyle(tone: .primary))
```

`variant:` still works and is deprecated: each `AtomButtonVariant` stands for one
tone × emphasis (`secondary` is neutral × soft, `outline` neutral × outline).

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
