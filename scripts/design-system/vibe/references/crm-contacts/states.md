# Required states

The page selects a state from the `state` query parameter. With no parameter, use `complete`.

| State | Required result |
| --- | --- |
| `default` | Twelve contacts, no selected row, details panel closed, no status message. |
| `selected` | Avery Chen selected and the details panel open. |
| `empty` | The toolbar and active saved filter remain. Replace the rows with a useful empty result and Clear filters. |
| `importing` | Keep the table visible. Show an import status with determinate progress and an accessible label. |
| `complete` | Keep Avery Chen selected and show a dismissable “12 contacts imported” message without moving the table. |

Actions do not need a backend. They must update local UI state enough to demonstrate selection,
dismiss, clear filters and details-panel close behavior.
