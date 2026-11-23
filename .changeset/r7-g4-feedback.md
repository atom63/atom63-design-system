---
'@atom63/ui-foundation': patch
'@atom63/ui-react': patch
---

FeedbackState: `labels.titles` and `labels.descriptions` replace every built-in title and description per kind. With `state="error"` and an `Error`, the friendly description stays and `error.message` shows in a new `feedback-state-detail` line under it. The loading description no longer repeats its title. Empty: `EmptyTitle` takes a `level` prop, and long titles and descriptions wrap inside the box.
