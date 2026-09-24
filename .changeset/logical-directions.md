---
'@atom63/ui-react': patch
---

Use logical directions so layouts mirror in right-to-left pages. Text alignment in AlertDialog, Drawer, Empty, Field, Item, PanelSettingButton, Sidebar and Table moves from `left` to `start`. The Card action margin, the Carousel gutter and the SidebarNavTree end corners and guide line become logical. So do the inset Sidebar margin and the Sidebar menu action with its reserved padding. SectionHeader, the grid guides and the range token control use `ms-`/`text-end`/`border-s`. Left-to-right rendering is unchanged.
