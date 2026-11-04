---
'@atom63/ui-react': minor
---

`SidebarNavLinkItem` takes optional `href`, `icon` and `render` props, so an item no longer needs a
child link element: `<SidebarNavLinkItem href="#inbox" icon={<Inbox />}>Inbox</SidebarNavLinkItem>`
renders the anchor with the icon and label inside. Pass a router link as `render`
(`render={<Link to="/inbox" />}`). The child-element form works as before. A link component you
pass as the child or as `render` must spread the props it receives onto the element it renders and
forward its ref; a wrapper that drops them loses the item's styling.
