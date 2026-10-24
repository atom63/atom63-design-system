---
'@atom63/ui-react': patch
---

SidebarMenuButton, SidebarMenuSubButton, SidebarMenuAction, SidebarGroupLabel and SidebarGroupAction now hand their children to a `render` element that has none of its own, as Base UI does, so `<SidebarMenuButton render={<a href="/inbox" />}>Inbox</SidebarMenuButton>` renders its label. A render element with its own children, and `asChild`, behave as before.
