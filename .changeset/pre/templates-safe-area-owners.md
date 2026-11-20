---
'@atom63/cli': patch
---

The app-shell block and the chat-page template give every safe-area inset an owner, as AppView does: the top bar takes the top inset, and the page wrapper (app shell) or page column (chat page) takes the bottom inset and clears the inline ones. Copied templates no longer run under the notch or the home indicator when the page uses `viewport-fit=cover`.
