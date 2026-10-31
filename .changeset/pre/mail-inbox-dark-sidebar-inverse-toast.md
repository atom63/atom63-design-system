---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

A nested mode scope now recolours what is inside it. The Sidebar declares its `--sidebar-*` aliases again on every `[data-a63-mode]` scope inside its wrapper, so `<UIProvider mode="dark"><Sidebar>` draws a dark sidebar, with dark-mode text and active items, on a light app; before, the aliases kept the wrapper's light values. `Atom63Theme` sets `color: var(--a63-text-primary)`, so inherited text follows a nested scope too. Toaster takes `variant` (`default` or `inverse`): `inverse` draws a compact pill in `--a63-action-neutral` with the status icon after the message, for a short status such as "Scheduling message…" with `toast.loading`. ToggleGroup takes `variant="ghost"`: plain text items with a small gap, only the selected one on `--a63-selected-background` (the accent wash with `tone="accent"`), for quiet toolbar filters. SwiftUI `AtomToast` takes `variant: .inverse`, the same pill in `actionNeutral` with the symbol after the message.
