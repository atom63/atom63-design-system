# Atom63 Storybook

The component workbench for `@atom63/ui-react` and `@atom63/mdx`. Stories live next to their
components in `packages/ui-react/src` and `packages/mdx/src` and load the workspace packages from
source, so edits hot-reload.

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
story through `@storybook/addon-a11y`, and any violation fails the test. The shared `repeatedLandmarks`
parameter in `packages/ui-react/src/components/story-probes.tsx` switches off the two landmark
uniqueness rules for theme and environment matrices, which repeat a component's landmarks by design.
Every other rule, including color contrast, applies to every story. Label every form control you add to a story.

**Runtime craft checks.** The `craft` project renders every story in Chromium again and, after it
renders, checks three craft rules that only a rendered component shows. The rules live in
`craft/rules.ts`; the `craft-rules` project tests them on hand-written fixtures, including a
disabled button with a hover style and a 16 px icon button that must fail.

- `disabled-hover`: hovers each disabled button, link, input, option, menu item and tab (`:disabled`,
  `aria-disabled="true"` or `data-disabled`) with the real pointer. Its background, color, border,
  box-shadow, opacity and text decoration must not change.
- `target-size`: every visible, enabled pointer target (native controls, interactive roles and
  anything tabbable) is at least 24 × 24 CSS px, as WCAG 2.5.8 asks. A control wrapped in its label
  is measured by the label. The inline exception (a link in running text) and the spacing
  exception (a 24 px circle on the target's center touches no other target) apply. Targets covered
  by another element at their center, such as cards behind the front card of a stack, are skipped.
  Not checked: the essential and user-agent-control exceptions, and click handlers on elements with
  no role and no `tabindex`, which React attaches at the root where they cannot be seen.
- `focus-visible`: tabs through the story, up to 16 stops. Each element that takes keyboard focus
  must change its outline or box-shadow, the outline or box-shadow of one of its three nearest
  ancestors (a field or group ringed on `:focus-within`), or a `::before` or `::after`
  pseudo-element. Then it clicks the first plain button it tabbed to (one that does not toggle,
  open a popup or submit) and checks that the click draws no ring on the button itself.

The project runs apart from `storybook` so the render and axe tests keep their own timing: the
check freezes CSS motion and pins remote images as the visual project does, waits for fonts,
images and the DOM to settle, and moves the pointer onto a 2 px spot in the corner of the viewport
between steps. Axe is off here, since it already runs in `storybook`.

Existing violations are listed in `docs/design-system/audits/runtime-craft-baseline.json`, by
story id, rule and element. A violation the baseline does not list fails the story, and so does a
baseline entry that no longer occurs; after a full run, so does an entry for a story that no longer
exists. Rewrite the baseline after fixing or accepting violations:

```bash
pnpm --filter @atom63/storybook test:craft                               # check
CRAFT_WRITE_BASELINE=1 pnpm --filter @atom63/storybook test:craft        # rewrite the baseline
```

A run of some story files merges their results into the baseline and leaves the other stories'
entries alone.

A story whose rule result is wrong for a reason the check cannot see can opt out of that rule, with
the reason in a comment:

```ts
// The ring is drawn on the active slot, a sibling of the focused input.
parameters: { craft: { disable: ['focus-visible'] } },
```

Use this sparingly: a real violation belongs in the baseline, where it stays visible until fixed.

**Other browsers.** The `cross-browser` project renders every story in Firefox and WebKit. It
checks rendering only: axe and visual regression run in Chromium. Axe is off there because reading
the computed `mask` shorthand of an element with more than one mask layer crashes WebKit 26.5, and
the ScrollArea scroll fade uses four layers.

```bash
pnpm exec playwright install firefox webkit   # once
pnpm --filter @atom63/storybook test:cross-browser
```

**Server rendering.** The `ssr` project renders every story with `renderToString` in Node, where
`window` and `document` do not exist, and fails if a component touches browser globals during import
or render. Browser access inside effects is fine, since effects do not run on the server.

```bash
pnpm --filter @atom63/storybook test:ssr
```

**Accessibility pattern contracts.** The `a11y` project checks the components that declare a
WAI-ARIA APG pattern (dialog, alert dialog, menu button, tabs, select-only combobox, switch,
checkbox, accordion, radio group) against that pattern's contract in
`@atom63/ui-foundation`. `a11y/patterns.test.ts` names the stories for each component and
generates the tests; `a11y/contract.ts` renders each story as a portable story, with the preview
applied, and then:

- checks the contract's accessibility tree (roles, required names, states) with ARIA role
  queries, and compares the whole tree with the reviewed ARIA snapshot in `a11y/__snapshots__/`
  (Vitest's experimental `toMatchAriaSnapshot`);
- checks each required attribute and ID reference (`aria-modal`, `aria-controls`,
  `aria-labelledby`, and so on);
- for each row of the keyboard map, sets up the state and focus it starts from, presses the key
  with `userEvent.keyboard`, and waits for the expected state and focus.

A failure names the pattern, the check and the story, and says what the APG expects and what
happened. Checks listed in a contract's `knownGaps` run as expected failures. When a story's text
changes on purpose, update its snapshot with `-u` and review the diff:

```bash
pnpm --filter @atom63/storybook test:a11y
pnpm --filter @atom63/storybook test:a11y -u   # rewrite the ARIA snapshots
```

The contract tree is checked with role queries rather than `toMatchAriaInlineSnapshot`, because
Vitest keys inline snapshots by call site and rejects one call site that sees different trees. See
[Adding an accessibility pattern contract](../../CONTRIBUTING.md#adding-an-accessibility-pattern-contract).

**Visual regression.** Every story is compared against a committed baseline screenshot in
`visual/__screenshots__/`. Stories with a `Themes` story render all four themes in light and
dark, so those components get a full theme matrix; the few components without one have a `Dark`
story that sets the `mode` global. Each capture is taken at 1:1 and at the story's full height:
the test grows the viewport to the page before capturing. To keep screenshots deterministic, the
test freezes CSS motion, loads the Geist fonts before capturing, and replaces remote images with
one fixed placeholder.

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
