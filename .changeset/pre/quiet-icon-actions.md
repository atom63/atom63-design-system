---
'@atom63/styles': minor
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Button gains `tone="muted"` for ghost buttons: the glyph and label rest in the secondary text colour and go to full contrast on hover, keyboard focus, press and while a menu is open. The contract lists the tones `neutral` (default) and `muted`. Icon-only Button sizes and the Dialog close button draw their glyph from the new `--a63-control-icon-only-size-*` tokens, 24/14, 28/16, 32/18, 36/20 and 40/22, so web icon buttons get larger glyphs; labelled buttons and the iOS and phone scopes are unchanged.
