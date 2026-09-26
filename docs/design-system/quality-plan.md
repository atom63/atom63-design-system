# Quality plan (phase E)

Status: decided, 2026-09-25 (E1–E5 take their recommended options). Phase E of the roadmap ("质量标杆"): accessibility specs as
contracts, iOS screenshot tests and vibe tests, plus the runtime craft checks that phase C left
over.

## Goal

Turn craft and taste into checks that fail CI, and apply them the same way on both renderers:

- a component that looks right but behaves wrong for a keyboard or screen reader user fails;
- a SwiftUI change that shifts pixels fails, as a web change already does;
- the claim "agents build better UI with the system" becomes a number we can track.

## What exists

- **Web:**
  - every story runs axe in Storybook's Vitest browser project;
  - every story has a visual baseline (four themes, light and dark);
  - cross-browser runs cover Chromium, Firefox and WebKit;
  - `check:craft` statically enforces `raw-color`, `physical-properties` and `focus-visible`, with 6
    baseline violations left.
- **Cross-renderer contracts:** each one lists `accessibilityOutcomes` as free text, for example
  "announces the selected tab". Nothing checks them.
- **iOS:**
  - `swift test` runs the token, theme and renderer-conformance tests;
  - `Scripts/run-ios-tests.mjs` runs the demo app's unit and UI tests on a simulator (CI `macos-15`
    with the latest stable Xcode);
  - there are no screenshot tests.
- **Deferred from phase C:**
  - "No hover on disabled" is not reliable as a static rule. It was planned as a runtime Storybook
    check.
  - The agent trial (T7 in `template-library-plan.md`) is the first version of a vibe test.

## Decisions

### E1. Runtime craft checks in Storybook

- **Background:** some craft rules can only be checked on a rendered component.
- **Proposal:** a check that runs after each story renders, in the existing `storybook` Vitest
  project, with three rules:
  1. **Disabled controls do not react to hover.** Hover each disabled control. Its computed
     background, color, border and shadow must not change.
  2. **Target size.** Interactive elements are at least 24 × 24 CSS px (WCAG 2.5.8), unless they
     are inline text links.
  3. **Keyboard focus is visible.** Tab to each focusable element. It must gain a visible outline
     or box-shadow ring, and a pointer press must not show one.

  Existing violations go into a baseline file, as with `check:craft`. New ones fail CI.
- **Options:**
  - **A. The three rules above.**
  - **B. Rule 1 only,** the one phase C promised.
- **Trade-offs:** A covers three common craft failures with one harness. B is smaller but leaves
  the other two to review.
- **Recommendation: A.**

### E2. Accessibility specs as contracts

- **Background:** axe finds static problems, such as missing names or contrast. It does not check
  that a menu opens with the arrow keys or that a tab reports as selected. The WAI-ARIA Authoring
  Practices (APG) describe each pattern exactly.
- **Proposal:**
  - **Contract:** one data file per APG pattern in `@atom63/ui-foundation`
    (`src/a11y/<pattern>.ts`). Each lists:
    - the expected accessibility tree, as roles, names and states;
    - the keyboard map: each key, the state change it causes, and where focus moves.
  - **Binding:** components declare the pattern they implement in their contract.
  - **Web verification:** a Storybook browser test renders the component, compares the tree with
    Vitest's ARIA snapshot matcher (`toMatchAriaInlineSnapshot`, experimental since Vitest 4.1.4;
    this repo uses 4.1.11), then plays each key in the keyboard map and checks the resulting state
    and focus.
  - **iOS verification:** check the accessibility traits and values of the SwiftUI view in the same
    contract. This replaces the free-text `accessibilityOutcomes` step by step.
  - **First patterns:** dialog, menu, tabs, select (listbox), switch and checkbox, and accordion
    (disclosure).
- **Options:**
  - **A. Structured contracts with ARIA snapshots,** as above.
  - **B. Structured contracts with role and state queries only** (Testing Library). This avoids the
    experimental matcher.
  - **C. Leave accessibility to axe.**
- **Trade-offs:**
  - A gives a whole-tree check that reads like the APG spec, but the matcher is experimental and
    could change. A thin helper keeps the swap to B cheap.
  - B is stable, but it misses unexpected extra nodes in the tree.
  - C misses behavior entirely.
- **Recommendation: A,** with the matcher wrapped in one helper. Web first; iOS once the web
  contracts settle.

### E3. iOS screenshot tests

- **Background:** the web has visual regression tests; iOS has none, so a SwiftUI change can shift
  pixels silently.
- **Proposal:** use [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing)
  (1.19.x, which supports Swift Testing). Snapshot each iOS component's showcase in light and dark,
  plus one large Dynamic Type size.
- **Options:**
  - **A. In the demo app's test target, on the CI simulator.** Pin the device model and iOS version.
    Baselines are recorded only by a CI workflow with an **update** switch, as `visual.yml` does
    for the web.
  - **B. In the `Atom63UI` package tests on macOS** (`swift test`, rendered through AppKit).
- **Trade-offs:** A renders with UIKit on iOS, which is what ships. It needs the simulator, so it
  is slower. B is fast, but macOS rendering differs from iOS in fonts, controls and safe areas, so
  its baselines prove little.
- **Recommendation: A.** Local runs write baselines that git ignores, as on the web.

### E4. Vibe tests

- **Background:** Astryx scores agent output from a fixed set of briefs every night. Our version
  asks whether agents build better UI with the `atom63` CLI, MCP server and AGENTS.md than
  without them.
- **Proposal:**
  - **Tasks:** a fixed set of 3–5 briefs (a settings page, a list with filters, an onboarding empty
    state, and so on).
  - **Runs:** each brief runs twice: once with the design system tools, once with plain React and
    Tailwind.
  - **Mechanical measures:**
    - craft violations;
    - type errors;
    - axe violations;
    - the share of UI built from system components;
    - literal values that should be tokens.
  - **Judged measures:** a model scores each result against the craft rubric (E5).
  - **Report:** results go to `docs/design-system/audits/vibe-<date>.md`.
- **Options:**
  - **A. A local command** (`pnpm vibe`) that you run on demand; the report is committed.
  - **B. A nightly GitHub workflow.** It needs an API key secret and has a recurring cost.
  - **C. Wait for the template library,** as T7 planned.
- **Trade-offs:** A starts measuring now at no standing cost. B catches regressions automatically,
  but costs money every night before we know the numbers are useful. C delays the first
  measurement.
- **Recommendation: A** now. Consider B once a few runs show the numbers are stable and useful.
- **Status:** built. `pnpm vibe` runs four briefs (sign-in, notification settings, invoices, first
  project), a `ds` and a `plain` arm per brief through headless `claude -p`, and a blinded judge.
  `scripts/design-system/vibe/README.md` explains how to run it and read the report; the first
  report is `docs/design-system/audits/vibe-2026-09-26.md`.

### E5. Craft rubric

- **Background:** "taste" needs a shared definition before a person or a model can score it.
- **Proposal:** a docs page, "Craft rubric", with 5–7 criteria:
  - spacing rhythm;
  - hierarchy;
  - alignment;
  - state completeness (loading, empty, error, disabled);
  - motion restraint;
  - accessibility;
  - token use.

  Each criterion has a 1–3 scale with a good example and a bad example (screenshots from Storybook).
  E4's judge and design reviews both use it.
- **Recommendation:** adopt it, and write it before E4.

## Steps

Each step is its own pull request and ends green in CI.

1. **E1 runtime craft checks,** with the baseline. *Verify:* a story with a hover style on a
   disabled button fails, and so does a 16 px icon button.
2. **E2 accessibility contracts for dialog, menu and tabs** on the web. *Verify:* removing the
   arrow-key handler from the menu fails its contract test.
3. **E2 for select, switch, checkbox and accordion.**
4. **E3 iOS screenshot tests** and the baseline workflow. *Verify:* a changed padding in one
   SwiftUI component fails exactly that component's snapshot.
5. **E5 craft rubric** docs page.
6. **E4 `pnpm vibe`** and the first report.

## Out of scope

- The lightbox review. It happens later, as a separate checkpoint.
- A nightly vibe workflow (E4-B), until the local runs prove useful.
- iOS accessibility contracts beyond the patterns that already have a SwiftUI component.

## Sources

- Vitest ARIA snapshots: <https://main.vitest.dev/guide/browser/aria-snapshots>
- swift-snapshot-testing releases: <https://github.com/pointfreeco/swift-snapshot-testing/releases>
- WAI-ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/patterns/>
