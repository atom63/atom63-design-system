---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add Message, MessageList and MessageEvent for person-to-person threads, separate from ChatMessage (an AI assistant's turn): a directional bubble (`direction` incoming or outgoing), joined runs of consecutive messages (`position` single, first, middle, last) with the tail on the last, a meta row with the time and a named delivery status (`status` sending, sent, delivered, read, failed), and media above the text. MessageEvent is a centred row for calls, dates and joins. Avatar `ring` also takes `unseen` (the same as `true`) and `seen`, and the unseen ring reads `--a63-avatar-ring-fill`, so a product can draw a story ring as a gradient of the category palette.
