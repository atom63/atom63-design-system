# iOS accessibility contracts plan

Status: step 1 done, 2026-09-27; I1–I5 take their recommendations. Item 3 of the handoff menu ("iOS parity"), first part: the E2
accessibility contracts on iOS. `quality-plan.md` E2 asked for this once the web contracts
settled: "check the accessibility traits and values of the SwiftUI view in the same contract. This
replaces the free-text `accessibilityOutcomes` step by step."

## Where things stand

- **Web:** nine APG pattern contracts in `@atom63/ui-foundation` (`src/a11y/*.ts`). Each lists
  the parts with their roles and names, the tree, structure rules and a keyboard map. The
  Storybook `a11y` project plays them against the bound stories.
- **iOS:** the cross-renderer contracts name a SwiftUI renderer for each of these patterns, and
  `AtomRendererConformance` lists the `accessibilityOutcomes` each renderer "verifies". That list
  is hand-written; `AtomRendererConformanceTests` only checks that it matches the contract's
  strings. Nothing inspects a rendered view.
- **Tooling:** the demo app has an XCUITest target that CI runs (`run-ios-tests.mjs`), and one
  test already reads a switch's `value`.

## What the rendered views expose today

Probed with XCUITest on the iPhone 17 Pro simulator (iOS 26.5), opening each catalog showcase and
dumping the element tree. XCUITest exposes an element's type, label, value, identifier, enabled,
selected and focus; it has no expanded state.

| Pattern | Showcase renderer | What XCUITest sees | Gap |
| --- | --- | --- | --- |
| switch | `AtomToggle` | `Switch`, label = title + description, value `1`/`0` | none |
| select-only combobox | `Picker` (menu style) | `Button`, label "Project status, Draft", disabled flag | the value sits in the label, not in `value` |
| radio group | `Picker(.inline)` outside a `Form` | `Picker` with one `PickerWheel` | renders as a wheel: options are not visible or individually selectable |
| menu button | `Menu` | trigger `Button`; open: items as `Button`, checked item `Selected`, unavailable item disabled | none |
| tabs | `TabView(.page)` | the current page's content and three unlabelled page dots | no tab names, no selected state: a carousel, not tabs |
| accordion (disclosure) | `DisclosureGroup` | `Button` named by its label; content appears on tap; state only as an image identifier `collapsed`/`expanded` | expanded state is not exposed to XCUITest |
| dialog | `.sheet` | trigger `Button` (sheet not captured in the probe) | to check |
| alert dialog | `.alert` | an existing UI test finds the alert by title and its Cancel button | none known |
| checkbox | — | no SwiftUI checkbox on iOS | out of scope, as E2 says |

UIKit has `accessibilityExpandedStatus` from iOS 18 (`UIAccessibilityConstants.h`), but SwiftUI
has no modifier for it and XCUITest does not read it.

## Decisions

### I1. How iOS checks a contract

- **Options:**
  - **A. XCUITest in the demo app,** driven by the contract: open the pattern's showcase, find
    each part by type and name, check its value and selected and enabled state, perform the
    iOS action for each interaction, and check the result.
  - **B. Accessibility hierarchy snapshots in unit tests** (a third-party parser such as Cash
    App's AccessibilitySnapshot).
  - **C. Keep the hand-written evidence.**
- **Trade-offs:** A reads what VoiceOver and Switch Control read, uses a target CI already runs,
  and needs no dependency. Its runs are slower and it cannot see expanded state. B is faster but
  adds a dependency and compares images or strings rather than contract fields. C checks nothing.
- **Recommendation: A.**

### I2. Where the iOS expectations live

- **Options:**
  - **A. An `ios` section in each pattern contract** in `@atom63/ui-foundation`: the XCUITest
    element type per part, how its state is read (value, selected, label suffix, or content
    presence), and interactions as `tap` (or `swipe`) with the resulting state. A generator writes
    them into a Swift file for the UI tests, as the cross-renderer contracts are generated today.
  - **B. Hand-written expectations in the Swift test.**
- **Trade-offs:** A keeps one contract per pattern for both platforms, so a change to a pattern
  shows up on both, and the web keyboard map and the iOS interactions sit side by side. B is
  quicker to start but drifts, which is what E2 set out to remove.
- **Recommendation: A.** Keyboard maps stay web-only; iOS gets activation interactions, which is
  how people reach these controls with VoiceOver, Switch Control and touch.

### I3. Radio group renderer

- **Options:** A. an inline `Picker` inside a `Form` section, which renders as rows with a
  checkmark and the selected trait; B. `AtomSelectionRow` rows in a group; C. keep the wheel.
- **Recommendation: A** for the showcase and the documented renderer; B stays the option for
  custom row content. C loses the pattern: the options are not visible at once.

### I4. Tabs renderer

- **Background:** the tabs contract names `TabView`, and the showcase uses its page style, which
  is a carousel. A real `TabView` with tab items is app-level navigation (the demo's own tab bar);
  nesting one inside a page is not idiomatic.
- **Options:**
  - **A. In-page tabs render as a segmented `Picker` above the selected content,** and the
    contract's SwiftUI renderer says so. `TabView` stays the answer for app-level sections.
  - **B. Keep `TabView`** and show a nested tab bar in the showcase.
- **Trade-offs:** A matches iOS conventions and exposes each tab as a selectable button with its
  name, which is what the web tabs contract checks. B is closer to the word "tabs" but nests tab
  bars.
- **Recommendation: A.** This changes the cross-renderer contract's `swiftUIRenderer` for tabs.

### I5. Accordion expanded state

- **Options:** A. check behavior only (the trigger is a named button; activation reveals the
  content and a second activation hides it), and record the missing expanded state as a known
  iOS gap; B. add an `accessibilityValue("Expanded"/"Collapsed")` to our showcase.
- **Recommendation: A.** B would invent a value VoiceOver does not use for native disclosure
  groups, and the contract should describe the platform, not a workaround.

## Steps

Each step is its own pull request and ends green in CI.

1. **Contract and harness** (done in this pull request). Add the `ios` section to the pattern contract types and to the
   switch, select-only combobox, menu button and alert dialog contracts; generate the Swift
   expectations; add a launch environment value that opens one catalog showcase directly; add an
   `A11yContractUITests` class that plays every contract with an `ios` section. *Verify:* removing
   the switch's label, or its value, fails the test.
2. **Radio and tabs.** Fix the two showcases (I3, I4), update the tabs renderer in the
   cross-renderer contract, and add their `ios` sections.
3. **Accordion and dialog.** Add their `ios` sections (I5 for the accordion; the sheet's title and
   its Done button for the dialog).
4. **Evidence.** For patterns with an `ios` section, `AtomRendererConformanceTests` requires the
   UI test to cover them, and the hand-written `verifiedAccessibilityOutcomes` for those patterns
   point at the contract instead of restating it.

## Out of scope

- Checkbox, which has no iOS control.
- Hardware keyboard maps on iPad (Full Keyboard Access). XCUITest cannot drive them reliably on
  iPhone simulators.
- The `AtomButton` loading spinner showing up in the XCUITest tree although it is
  `accessibilityHidden`. Check it with Accessibility Inspector before treating it as a bug.
