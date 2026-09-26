# Base UI issue drafts

Drafts of upstream issues for [mui/base-ui](https://github.com/mui/base-ui), found by the APG
pattern contracts in `packages/ui-foundation/src/a11y/` and the harness in `apps/storybook/a11y/`.
None of them has been filed. Each names the check id the harness uses.

All drafts were checked against `@base-ui/react` 1.6.0 (React 19.2, Chromium through Vitest
browser mode).

| Draft | Check id | Atom63 status |
| --- | --- | --- |
| 1. Select keeps DOM focus on options | `combobox-active-descendant` | Known gap: not fixable in a wrapper |
| 2. Select ignores Home and End while closed | `home-opens-at-first`, `end-opens-at-last` | Worked around in `SelectTrigger` |
| 3. Select treats Alt + Up Arrow as Up Arrow | `alt-up-arrow-selects` | Worked around in `SelectPopup` |
| 4. Select closes on Tab without selecting | `tab-selects` | Worked around in `Select` and `SelectPopup` |
| 5. Dialog.Popup has no aria-modal | `dialog-is-modal` | Worked around in `Dialog` and `DialogPopup` |
| 6. Accordion.Trigger drops aria-controls while closed | `header-controls-panel` | Worked around in the Accordion parts |

---

## 1. Select: DOM focus moves onto the options instead of staying on the combobox

**Title:** [select] Keep DOM focus on the trigger and use `aria-activedescendant` for the
highlighted item

**Reproduction**

```tsx
import { Select } from '@base-ui/react/select'

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

export function Repro() {
  return (
    <Select.Root items={items} defaultValue="a">
      <Select.Trigger aria-label="Pick">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {items.map(item => (
                <Select.Item key={item.value} value={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
```

1. Focus the trigger and press Down Arrow to open the list.
2. Press Down Arrow again.
3. Inspect `document.activeElement` and the trigger's attributes.

**Expected (APG):** the [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
says that when a descendant of a listbox popup is focused, DOM focus remains on the combobox and
the combobox has `aria-activedescendant` referring to the focused option. Its
[select-only example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
does the same.

**Actual:** DOM focus moves onto the `role="option"` element. The trigger (`role="combobox"`) has
no `aria-activedescendant`. The select's `useListNavigation` runs with `virtual: false`, and no
prop on `Select.Root` switches it to virtual focus. `Combobox` already supports virtual focus, so
the building block exists.

**Version:** `@base-ui/react` 1.6.0.

---

## 2. Select: Home and End on the closed trigger do nothing

**Title:** [select] Open the popup on Home and End, highlighting the first or last item

**Reproduction:** the component from draft 1. Focus the closed trigger and press Home, then press
Escape and press End.

**Expected (APG):** in the
[select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/),
Home on the closed combobox opens the listbox and moves visual focus to the first option; End
opens it and moves visual focus to the last option. Neither changes the selection.

**Actual:** the popup stays closed. The trigger's list navigation handles only Enter, Space and
the arrow keys while closed. Home and End work once the popup is open.

**Version:** `@base-ui/react` 1.6.0.

---

## 3. Select: Alt + Up Arrow moves the highlight instead of selecting and closing

**Title:** [select] Alt + Up Arrow should select the highlighted item and close the popup

**Reproduction:** the component from draft 1. Open the popup, press Down Arrow to highlight
"Beta", then press Alt + Up Arrow.

**Expected (APG):** in the
[Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (listbox popup keys) and
the
[select-only example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/),
Alt + Up Arrow selects the focused option, closes the listbox and returns focus to the combobox.

**Actual:** the key is handled as a plain Up Arrow: the highlight moves to "Alpha", nothing is
selected and the popup stays open.

**Version:** `@base-ui/react` 1.6.0.

---

## 4. Select: Tab closes the popup without selecting the highlighted item

**Title:** [select] Tab should commit the highlighted item before focus moves on

**Reproduction:** the component from draft 1, followed by a `<button>After</button>`. Open the
popup, press Down Arrow to highlight "Beta", then press Tab.

**Expected (APG):** the
[select-only example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
sets the value to the focused option, closes the listbox and moves focus to the next focusable
element. The [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) lists Tab as
accepting the focused option in a listbox popup.

**Actual:** focus moves to "After" and the popup closes (`onOpenChange` with reason
`focus-out`), but the value stays "Alpha": `onValueChange` is not called.

**Version:** `@base-ui/react` 1.6.0.

---

## 5. Dialog: a modal Dialog.Popup has no `aria-modal`

**Title:** [dialog] Set `aria-modal="true"` on `Dialog.Popup` when the dialog is modal

**Reproduction**

```tsx
import { Dialog } from '@base-ui/react/dialog'

export function Repro() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Popup>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

Inspect the element with `role="dialog"`.

**Expected (APG):** the [Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
gives the dialog container `aria-modal` set to `true`.

**Actual:** there is no `aria-modal`. The rest of the page is hidden with `aria-hidden`
(`FloatingFocusManager` with `modal`), which covers most screen readers but not the semantics the
pattern names. `modal` lives in the dialog store, so `Dialog.Popup` could set
`aria-modal={modal !== false}` itself; a wrapper cannot read it, because the store is not public.
`AlertDialog.Popup` has the same gap and is always modal. `Toast` already sets `aria-modal`.

**Version:** `@base-ui/react` 1.6.0.

---

## 6. Accordion: Trigger drops `aria-controls` while its panel is closed, even when the panel stays mounted

**Title:** [accordion] Keep `aria-controls` on the trigger while closed when the panel is kept
mounted

**Reproduction**

```tsx
import { Accordion } from '@base-ui/react/accordion'

export function Repro() {
  return (
    <Accordion.Root keepMounted defaultValue={['a']}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>First</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>First content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>Second</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Second content</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}
```

Inspect the "Second" trigger.

**Expected (APG):** the [Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
gives every header button `aria-controls` set to the ID of the element containing its panel,
with no exception for collapsed panels; the APG example keeps collapsed panels in the DOM with
`hidden`.

**Actual:** the collapsed trigger has no `aria-controls`, although its panel is in the DOM (with
`hidden`) because of `keepMounted`. `AccordionTrigger` sets
`'aria-controls': open ? panelId : undefined`. Omitting it is right when the closed panel is
unmounted (a reference to a missing element is itself an error), but with `keepMounted` or
`hiddenUntilFound` it could be kept.

**Version:** `@base-ui/react` 1.6.0.
