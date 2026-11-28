---
'@atom63/ui-react': patch
'@atom63/cli': patch
---

The app-shell block takes an optional `user` (name, an email or role line, an avatar image and account menu items) and shows it at the foot of the sidebar in an "Account" landmark; in the icon rail only the avatar shows, and the name stays the accessible name. The page templates and the app starter pass a sample user. The Sidebar's icon rail keeps an Avatar in a menu button visible instead of hiding it with the label text.
