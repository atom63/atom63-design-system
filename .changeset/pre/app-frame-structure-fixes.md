---
'@atom63/ui-react': minor
---

Fix the app frame findings from the readiness review. An icon-collapsed `Sidebar` hides its menu button labels visually instead of with `display: none`, so each icon-only button keeps its accessible name. The sidebar menu action and badge sit at the inline end (`inset-inline-end`) and the menu button tooltip opens on the `inline-end` side, so they no longer cover the label in right-to-left layouts. A vertical `Separator` stretches to the height of a flex row that has no set height, with a `1em` floor, instead of collapsing to zero. `Marquee` now meets WCAG 2.2.2: `pauseOnHover` defaults to `true` (hover and focus pause it), and it renders a pause toggle at the inline end, named by the new `pauseLabel` prop (default "Pause"). Passing `paused` hands pausing to the caller and the toggle is not rendered; under reduced motion the strip does not move and shows no toggle.
