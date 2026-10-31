---
'@atom63/styles': minor
'@atom63/ui-foundation': patch
'@atom63/ui-react': minor
---

The phone form factor (`[data-a63-form-factor='phone']`) gives grouped lists the iOS 26 Settings proportions. Two new tokens are declared only in the phone scope: `--a63-inset-row-min-size` (52px) and `--a63-inset-group-radius` (`--radius-2xl`, 18px at defaults). `ItemGroup variant="inset"` reads them with fallbacks: its default and `sm` rows, static or interactive, are at least 52px tall on a phone, and the card takes the 18px corner; outside a phone the rows keep their control-height floor and the card keeps `--radius-lg`. SwiftUI `AtomListSection` rows are at least 52pt tall, scaled with Dynamic Type, on an 18pt continuous corner, and `AtomToggle` and `AtomSelectionRow` drop their own 44pt floor inside a section so every row is the same height.
