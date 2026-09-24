import { Children, isValidElement, type ReactNode } from 'react'

export type SlotComponent = ((props: { children?: ReactNode }) => null) & {
  slotName: string
}

/** Create a named marker component. It renders nothing on its own; its parent
 * extracts its children via `pickSlot`. */
export function createSlot(name: string): SlotComponent {
  const Slot = (_props: { children?: ReactNode }) => null
  const typed = Slot as SlotComponent
  typed.slotName = name
  return typed
}

function slotNameOf(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined
  return (child.type as Partial<SlotComponent>)?.slotName
}

/** Whether any child is an element for the given slot, regardless of its
 * content. Use this to detect slot *presence* — `pickSlot` returning null is
 * ambiguous (a present-but-empty slot also yields null). */
export function hasSlot(children: ReactNode, slot: SlotComponent): boolean {
  let present = false
  Children.forEach(children, child => {
    if (slotNameOf(child) === slot.slotName) present = true
  })
  return present
}

/** Return the children of the first element matching `slot`, or null when the
 * slot is absent OR present-but-empty. Pair with `hasSlot` when the distinction
 * matters. */
export function pickSlot(children: ReactNode, slot: SlotComponent): ReactNode | null {
  let found: ReactNode | null = null
  Children.forEach(children, child => {
    if (found === null && slotNameOf(child) === slot.slotName && isValidElement(child)) {
      found = (child.props as { children?: ReactNode }).children ?? null
    }
  })
  return found
}

/** Return the children that are NOT one of the given slots (loose content),
 * re-keyed via `Children.toArray` so the result is safe to render as a list. */
export function pickRest(children: ReactNode, slots: SlotComponent[]): ReactNode[] {
  const names = new Set(slots.map(s => s.slotName))
  return Children.toArray(children).filter(child => {
    const name = slotNameOf(child)
    return name === undefined || !names.has(name)
  })
}
