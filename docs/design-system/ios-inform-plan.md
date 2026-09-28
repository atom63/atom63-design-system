# iOS inform plan

Status: decided, 2026-09-28 (IF1–IF4 take their recommendations). Item 3 of the handoff menu
("iOS parity"), third part: `@atom63/inform` on iOS.

## Where things stand

`@atom63/inform` is the web pattern for telling a visitor something or pointing them at a control:

- **Core** (`src/core`, about 1,000 lines with tests): the message model, a registry, a pure
  arbiter, dismissal persistence and a store. A message has a surface (`banner`, `dialog`,
  `corner-flyout`, `spotlight`), a severity, a priority, content, a dismiss mode (`none`,
  `session`, `persistent`), an optional version, a start and end time, a `when` predicate and, for
  a spotlight, an anchor.
- **Arbiter:** drops dismissed, out-of-window and ineligible messages and spotlights whose anchor
  is missing; ranks by priority with declaration order breaking ties; lets one blocking surface
  win (`dialog` before `spotlight`); shows the top banner; and stacks up to three corner flyouts,
  none while something blocks.
- **Surfaces** (React): a banner, a dialog, a corner flyout stack and a spotlight.

iOS has none of it. Atom63UI has `AtomNotice` (an inline tinted notice) and `AtomToast` (a toast
model), which surfaces can build on.

## Decisions

### IF1. The core on iOS

- **Options:**
  - **A. Port the model and arbiter to Swift** (`AtomInform*` in Atom63UI), and check it against
    the web arbiter with shared test vectors: registries, contexts and dismissals as JSON, each
    with the resolution the web computes, generated from the TypeScript arbiter.
  - **B. Run the TypeScript core in JavaScriptCore.**
  - **C. No shared core;** each app decides what to show.
- **Trade-offs:** A is small (the arbiter is one pure function) and the vectors keep the two
  implementations in step. B adds a JS runtime to every app for about a hundred lines of logic. C
  loses the one-message-at-a-time rules, which are the point of the pattern.
- **Recommendation: A.**

### IF2. What a message holds on iOS

- **Background:** web content is React nodes and the `when` predicate a function; neither crosses
  platforms, and each app registers its own messages in its own language anyway.
- **Recommendation:** the same fields, with iOS types: `title` and `body` as strings, an SF Symbol
  name for the icon, actions as a label, a role (`primary`, `secondary`) and a closure, and `when`
  as a closure over a context of route, locale and time. Only the arbiter's behavior is shared,
  through the vectors (IF1), never the messages themselves.

### IF3. Surfaces

| Web surface | iOS surface | Built on |
| --- | --- | --- |
| banner | a banner inset at the top of the screen (`safeAreaInset(edge: .top)`) | `AtomNotice` |
| dialog | a system `.alert` for a title, body and at most two actions; a `.sheet` otherwise | SwiftUI |
| corner flyout | a stack at the bottom edge, above the tab bar, up to three | `AtomToast` styling |
| spotlight | a TipKit popover on the view marked `atomInformAnchor(_:)` (IF4) | TipKit |

- **Recommendation:** adopt the table. The corner becomes the bottom edge because a phone has no
  free corner; the stack limit and the "none while something blocks" rule stay.

### IF4. Spotlight

- **Background:** iOS already has a system spotlight: TipKit's `popoverTip`. TipKit brings its own
  eligibility rules, display frequency and datastore, so an invalidated tip stays invalidated in
  TipKit's store.
- **Options:**
  - **A. TipKit, driven by the arbiter:** each spotlight message is a `Tip` whose only rule is a
    parameter the arbiter sets, with display frequency `.immediate`; dismissing it records the
    dismissal in the inform store and invalidates the tip.
  - **B. Our own spotlight:** an overlay with a cutout around an anchor found through anchor
    preferences.
  - **C. No spotlight on iOS for now.**
- **Trade-offs:** A looks and reads like every other tip on iOS, including VoiceOver, but keeps a
  second record of dismissals and needs `Tips.configure` at app start. B matches the web's look
  but reimplements focus, dimming and accessibility the system already provides. C ships the other
  three surfaces sooner.
- **Recommendation: C now, then A** after a spike in the demo app confirms the arbiter can drive
  TipKit reliably. The arbiter already skips a spotlight whose anchor is missing, so an iOS app
  that registers none behaves correctly.
- **Spike result (2026-09-28, iOS 26.2 simulator): A holds, driven by a rule, not by
  `isPresented`.**
  - `popoverTip(_:isPresented:)` (iOS 26) does not let the arbiter decide: with the binding
    false, TipKit showed an eligible tip and set the binding to true itself.
  - A `@Parameter` rule does: with the parameter set to the tip's id the tip shows, cleared it
    hides, and with `IgnoresDisplayFrequency(true)` it shows again every time. This needs only
    iOS 17's `popoverTip(_:)`.
  - The tip's close button invalidates it (`tipClosed`), and TipKit keeps it invalidated across
    launches. So persistent spotlights use the id `id:version` (a new version shows again), and
    session ones add a per-launch suffix.
  - Without `Tips.configure()` no tip shows, so an app that uses spotlights must call it.

## Steps

Each step is its own pull request and ends green in CI.

1. **Core** (done). `AtomInformMessage`, the context, `AtomInformArbiter.resolve`, and a dismissal store
   on `UserDefaults` (persistent) and memory (session). Shared vectors: a script that runs the web
   arbiter over a fixture set and writes the expected resolutions; a Swift test that replays them.
   *Verify:* changing the flyout limit or the blocking order on one side fails the vectors.
2. **Surfaces** (done). `atomInform(_:route:store:)` resolves the messages and presents a
   banner in the top safe-area inset, a dialog as an alert (up to two actions) or a sheet, and up
   to three flyouts at the bottom edge, each an `AtomNotice` with its actions and, when the
   message can be dismissed, a close button. An alert closes on any button, so choosing a dialog
   action also records its dismissal; otherwise the arbiter would present it again.
   `AtomInformDismissalStore` is `@Observable`, so a dismissal updates the view. The demo's
   Inform showcase and a UI test cover the blocking rule: the flyouts wait while the dialog is
   open and return after it closes.
3. **Spotlight** (done). The spike above, then the TipKit spotlight: `atomInformAnchor(_:)` marks
   a view and reports its anchor to `atomInform`, which counts it as available. The resolved
   spotlight becomes a tip whose one rule is a parameter holding the resolved tip's id, so the
   arbiter alone decides. When the tip is invalidated (its close button, an action, or TipKit
   closing it on an earlier launch) the dismissal is recorded, and a message whose dismissal is
   never recorded stays out for the launch, since TipKit will not show it again. The demo's
   Inform showcase points at a Filters label, and a UI test covers the blocking rule.

## Out of scope

- Sharing message registries between platforms.
- The web's corner placement and outlet API; iOS presents through a view modifier.
