---
'@atom63/ui-react': minor
'@atom63/ui-foundation': minor
'@atom63/styles': patch
---

Item fixes from the board review (#390, #391, #392, #393).

- Item titles and descriptions read the type roles: body for the title and subheadline for the description (15 and 13 at desktop, unchanged 17 and 15 on a phone), so a list no longer reads a step smaller than the prose around it. `xs` rows stay on the control ramp.
- An `inset` ItemGroup draws a `--a63-border-subtle` hairline in light mode, where the panel fill sits within a hair of the page. Dark mode and `surface="muted"` are unchanged.
- `ItemMedia` takes `aspect` (`square`, `portrait`, `landscape`; contract `mediaAspects`). A portrait image is 3:4 and one size step taller than a square (48×36 in an `md` row); landscape is 4:3.
- `ItemTitle` takes `render`. Rendered as a link or button it becomes the row's primary action (a stretched link): the whole row is its hit area and draws the hover and focus ring, while buttons in ItemActions, ItemHeader and ItemFooter stay separate controls. Use it instead of `Item render={<a />}` when the row also has its own buttons.
- The shadcn bridge defines `--a63-type-body-font-size` and `--a63-type-subhead-font-size`.
