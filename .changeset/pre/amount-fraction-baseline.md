---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
'@atom63/styles': minor
---

Amount takes `fraction="raised" | "baseline"` (default `raised`): `baseline` keeps the half-size fraction on the baseline of the integer digits. The amount contract lists the values as `amountFractions`, and `@atom63/styles/tailwind` adds the `amount-fraction-baseline` utility. On iOS, `AtomAmountText` takes `fraction: .raised | .baseline` (`AtomAmountFraction`).
