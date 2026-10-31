---
'@atom63/styles': minor
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

The phone form factor (`[data-a63-form-factor='phone']`) gives Switch the iOS 26 shape: a 1.375rem pill knob 1.6 times as wide as it is tall, on a track of about 63 by 28px. A new `--a63-switch-thumb-aspect` token (1 by default, a round knob) sets the knob's width over its height, and the Switch track is the knob plus one knob height of travel. `ItemGroup` gains `surface` (`card` | `muted`, default `card`, `data-surface`): `surface="muted"` fills an inset group with `--a63-surface-muted`, the grey card for a white page. SwiftUI `AtomListSection(surface: .muted)` mirrors it.
