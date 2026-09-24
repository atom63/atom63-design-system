# Atom63 Storybook

The component workbench for `@atom63/ui-react`. Stories live next to their components in
`packages/ui-react/src` and load the workspace packages from source, so edits hot-reload.

```bash
pnpm --filter @atom63/storybook dev     # http://localhost:6006
pnpm --filter @atom63/storybook build   # static build in storybook-static/
```

The toolbar drives every personalization axis the design system supports: mode, theme, brand,
surface, tint, radius, type scale, density, and OS.

## Tests

**Render tests.** Every story is also a browser test that renders it in Chromium and runs its
`play` function, if it has one. CI runs them on every push.

```bash
pnpm --filter @atom63/storybook test
```

**Accessibility.** The same render tests run [axe](https://github.com/dequelabs/axe-core) on every
story through `@storybook/addon-a11y`, and any violation fails the test. Two shared parameters in
`packages/ui-react/src/components/story-probes.tsx` switch off specific rules, each for a stated
reason: `repeatedLandmarks` for theme and environment matrices that repeat a component's landmarks
by design, and `pendingContrastReview` for stories whose only failures are color contrast set by the
design tokens, which waits on a design decision. Label every form control you add to a story.

**Server rendering.** The `ssr` project renders every story with `renderToString` in Node, where
`window` and `document` do not exist, and fails if a component touches browser globals during import
or render. Browser access inside effects is fine, since effects do not run on the server.

```bash
pnpm --filter @atom63/storybook test:ssr
```

**Visual regression.** Every story is compared against a committed baseline screenshot in
`visual/__screenshots__/`. Stories with a `Themes` story render all four themes in light and
dark, so those components get a full theme matrix. To keep screenshots deterministic, the test
freezes CSS motion, loads the Geist fonts before capturing, and replaces remote images with one
fixed placeholder.

Font rendering differs across operating systems, so only the Linux baselines produced by the
[Visual regression workflow](../../.github/workflows/visual.yml) are committed. Local runs write
`-darwin` or `-win32` screenshots, which are ignored by git and useful only for comparing two
local runs:

```bash
pnpm --filter @atom63/storybook test:visual
```

When a pull request changes how something looks on purpose, run the **Visual regression**
workflow manually on the branch with **update** checked. It regenerates the baselines in the same
container, commits them to the branch, and starts CI and a comparison run for that commit; review
the changed images in the commit. When the
comparison fails, the workflow uploads the actual and diff images as the `visual-results`
artifact.

A story without a baseline fails too. On CI, Vitest saves its capture in the same artifact as
`<story>-reference-chromium-linux.png` instead of writing a baseline. To add it, drop the
`-reference` part of the name and commit the file to `visual/__screenshots__/`, or run the workflow
with **update** once the branch is ready.
