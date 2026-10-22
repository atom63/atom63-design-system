---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Components now accept the `variant` values their contracts list. `ResizableHandle` takes `variant="line" | "grip"` (`withHandle` is deprecated), `TextTicker` takes `variant="truncate" | "marquee"` (`animationType` is deprecated) and `AnimatedCheck` takes `variant="animated" | "static"` (`animate` is deprecated); each sets `data-variant`. The Table contract drops its `plain`/`framed` variants, because the framed look comes from sitting inside a `Frame`, so `tableVariants` and `TableVariant` are no longer exported from `@atom63/ui-foundation`. A test now fails when a contract lists `variants` that its React component does not accept.
