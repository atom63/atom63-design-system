# @atom63/ui-react Forms Evidence Packet

**Status:** partial evidence recorded; no stable promotion or export changes.

**Owner lane:** `design-system-forms`

This packet records the current stable-readiness evidence for the monitor-high-risk
Autocomplete, Calendar, and InputOTP families. It is evidence for review, not a stable API
promise. All three remain importable from the beta root and remain monitor-high-risk until the
manual QA below is completed and reviewed.

## Shared dependency policy

- `@base-ui/react`, `react-day-picker`, and `input-otp` remain declared runtime
  dependencies of `@atom63/ui-react`; consumers must not rely on transitive installation.
- Autocomplete and Calendar expose dependency-owned prop types through their public component
  contracts. Dependency major upgrades therefore require focused typecheck, interaction tests,
  release notes, and a compatibility review.
- The workspace currently locks `@base-ui/react` and `input-otp` through root overrides. Calendar
  dependencies use compatible ranges and the repository lockfile. Before stable promotion, the
  supported dependency-major policy must be made explicit; this packet does not approve an
  upgrade or widen compatibility.
- No dependency primitive is re-exported for Calendar or InputOTP. Autocomplete retains its
  existing `AutocompletePrimitive` and `useAutocompleteFilter` root exports; this slice does not
  remove or narrow them.

## Evidence commands

```bash
pnpm --filter @atom63/ui-react exec vitest run \
  src/components/autocomplete/autocomplete.test.tsx \
  src/components/calendar/calendar.test.tsx \
  src/components/input-otp/input-otp.test.tsx
pnpm --filter @atom63/ui-react typecheck
pnpm --filter @atom63/ui-react lint
pnpm check:ui-react-monitor-evidence
```

## Autocomplete

### API contract

The public family is the existing Base UI composition: `Autocomplete`, input, popup, list, item,
empty, status, clear, trigger, grouping, collection, row/value helpers,
`useAutocompleteFilter`, and `AutocompletePrimitive`. This slice makes no prop, behavior, or root
export changes.

### Recorded automated coverage

- Input/popup/list recipe slots and open-state rendering.
- Built-in item filtering from user input and the no-results empty state.
- Combobox role, accessible name, expanded state, and listbox relationship.
- Clear control behavior, focus restoration, and polite status-region semantics.

### QA still required

- Real-browser Arrow Up/Down, Enter, Escape, Home/End, focus-return, and pointer selection.
- VoiceOver/Safari and NVDA/Chrome announcements for results, empty state, and selection.
- Mobile Safari and Chrome viewport, virtual keyboard, popover sizing, scrolling, and clear target.
- Loading/async result behavior in a product integration; the wrapper has no DS-owned loading
  state contract today.

**Stable decision:** remain monitor-high-risk. Automated filtering and semantic evidence is
recorded, but keyboard, assistive-technology, async, and mobile evidence is incomplete.

## Calendar

### API contract

`Calendar` is a styled `react-day-picker` `DayPicker` wrapper and `CalendarProps` is its component
prop type. The wrapper defaults to single selection and outside days, merges recipe class names
and custom components, and preserves caller-supplied DayPicker props.

### Recorded automated coverage

- Calendar root/grid anatomy and recipe/custom class merging.
- Selected-day state and single-date selection callback.
- Disabled-day native disabled state and suppression of selection.
- Adjacent-month outside days at a fixed month boundary.

### QA still required

- Real-browser keyboard grid navigation, focus movement across month boundaries, and month
  navigation announcements.
- Locale, time-zone, daylight-saving, week-start, dropdown-caption, range, and multi-month cases.
- Mobile viewport/touch targets and light/dark visual review across supported themes.

**Stable decision:** remain monitor-high-risk. Core single-month selection and boundary evidence
is recorded, but locale/time-zone, keyboard, range, visual, and mobile coverage is incomplete.

## InputOTP

### API contract

The family consists of `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, and
`InputOTPSeparator`. `InputOTP` forwards the existing `input-otp` primitive props; the group,
slot, and separator provide the segmented visual composition. This slice changes no public API.

### Recorded automated coverage

- Container, hidden input, slot count, controlled value, and separator anatomy.
- Full-code paste with a paste transformer, completion callback, and visible slot update.
- Deletion/change behavior plus `inputmode="numeric"` and `autocomplete="one-time-code"` hints.
- Disabled and `aria-invalid` forwarding.
- The upstream delayed-caret timer behavior is explicitly drained in jsdom tests.

### QA still required

- Physical keyboard Backspace/Delete, selection replacement, partial paste, autofill, and password
  manager behavior in Safari, Chrome, and Firefox.
- iOS and Android numeric keyboards, SMS one-time-code autofill, paste, and VoiceOver/TalkBack.
- Disabled/invalid visual states and error-message association in a composed form.

**Stable decision:** remain monitor-high-risk. Paste/change and state forwarding evidence is
recorded, but mobile autofill, real Backspace behavior, password-manager, assistive-technology,
and composed-error evidence is incomplete.
