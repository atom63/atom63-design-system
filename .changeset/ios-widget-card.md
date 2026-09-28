---
'@atom63/ui-ios': minor
---

Add `AtomWidgetCard` (the widget contract's rim and face around chrome-free content), `AtomWidgetHeader`, `AtomWidgetSize` (`small`, `medium`, `large`, with a `WidgetFamily` mapping) and `AtomWidgetGrid`, a layout that packs tiles into square cells. `AtomTheme` now keeps the `skin` it was made from; `AtomTheme(colors:skin:)` defaults the skin to `.modern`.
