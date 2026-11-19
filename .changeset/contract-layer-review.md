---
'@atom63/ui-foundation': minor
'@atom63/ui-react': patch
'@atom63/cli': patch
---

Add the Progressive Blur contract (`progressiveBlurContract`, `progressiveBlurPositions`, `ProgressiveBlurPosition`), marked preview; `ProgressiveBlur` takes its defaults and position type from it. Amount becomes a cross-renderer contract with `AtomAmountText`. Map the iOS axes of Amount, Alert, Avatar, Button shape, Card, Carousel dots, Input, Item group surface, Message, Progress, Toaster and Toggle Group onto the contract intent; the contract check fails when a mapped Swift enum drifts. The badge cross-renderer required states use `primary`, matching the iOS rename. The catalog and the agent index now fail on a component without a contract maturity instead of calling it stable.
