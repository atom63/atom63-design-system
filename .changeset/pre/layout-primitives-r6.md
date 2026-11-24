---
'@atom63/ui-react': minor
'@atom63/cli': patch
---

`Page` adds the bottom safe-area inset to its bottom padding and takes the wider side inset inline, unless `noPadding` is set. `Container` takes a `gap` prop on the spacing scale (default `8`). `Section` passes other attributes and the ref to its `<section>`, so it can be named with `aria-labelledby`, and spaces children with a flex gap. `SectionHeader` accepts inline content for `title` and `description`, takes a `titleId`, aligns with logical `start`/`center`/`end` (`left` and `right` stay as deprecated aliases), and keeps normal tracking for Chinese, Japanese and Korean in the `label` variant. `atom63 api` prints the props of the layout primitives, `atom63 component page` points at it, and `atom63 build` lists the command for each foundation primitive.
