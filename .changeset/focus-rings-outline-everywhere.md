---
'@atom63/ui-react': patch
'@atom63/mdx': patch
---

Every keyboard focus ring is now an `outline`, so a component's own box-shadow can no longer hide
it and forced-colors mode shows it.

- Checkbox, Radio, Select, Input, InputGroup, Textarea, InputOTP, Autocomplete, Accordion, Slider,
  Badge, Breadcrumb, Calendar, CardLink, Carousel, Dialog close button, Item, Menubar,
  NavigationMenu, Resizable, ScrollArea, SegmentedControl, Sidebar and SidebarNavTree draw their
  ring as an outline. Elevation and inset-border shadows stay on while the element has focus, so a
  checked Checkbox, an open Accordion trigger or a Slider thumb keep their shadow.
- Menubar, NavigationMenu and SegmentedControl draw the ring inside the item, because their lists
  scroll and clipped an outer ring. On the accent SegmentedControl the active item's ring takes the
  label colour.
- Invalid Input, Textarea and InputOTP fields keep their danger-tinted ring.
- The Slider thumb keeps its ring while dragged, now as an outline.
- MediaLightbox buttons and thumbnails and the appearance VisualChoiceControl use Tailwind outline
  utilities instead of `ring-*`.
- Rings appear at once. Recipes whose only animated shadow was the ring no longer transition
  `box-shadow`.
- `@atom63/mdx`: MermaidDiagram draws its ring inside the stage, which its scroll container used to
  clip, and PageTableOfContents links use an outline ring, inset in the compact list.
