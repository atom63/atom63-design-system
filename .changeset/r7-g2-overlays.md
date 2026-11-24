---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Sheet takes `side="inline-start"` and `side="inline-end"`, which follow the text direction; `left` and `right` stay physical edges. The Sheet contract lists the `focus-visible` state. The Toaster's keyboard focus outline now draws on the toast and its action (it lost to Sonner's `outline: none`), and the default toast reads the overlay contract (border, gloss, texture, backdrop, shadow and radius) per theme. `DialogPanel`'s `scrollFade` now fades the panel's edge while it scrolls, in browsers with scroll-driven animations. A menu shortcut keeps its own direction, so `⌘C` stays `⌘C` in a right-to-left menu.
