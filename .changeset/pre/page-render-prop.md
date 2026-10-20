---
'@atom63/ui-react': minor
---

`Page` takes a `render` prop, like the other components built on Base UI `useRender`, and accepts the props of the element it renders. It still renders `<main>` by default. Inside a shell that already owns the `main` landmark, such as `SidebarInset`, render a `div` so the document keeps one `main`: `<Page noPadding render={<div />}>`.
