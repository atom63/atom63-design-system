---
'@atom63/ui-react': patch
---

`FrameHeader` and `FrameFooter` render a `div` instead of `<header>` and `<footer>`. Outside a sectioning element those tags are page-level banner and contentinfo landmarks, so a page with two frames announced two banners and failed axe. Their props are now `div` props. Class names and slots are unchanged.
