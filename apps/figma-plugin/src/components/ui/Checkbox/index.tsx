import { Checkbox as Atom63Checkbox } from '@atom63/ui-react'

export interface CheckboxProps {
  'aria-label'?: string
  checked?: boolean
  disabled?: boolean
  id: string
  indeterminate?: boolean
  /** Called with the new checked state when the box is toggled. */
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
}

/** The Atom63 (Base UI) Checkbox behind the plugin's controlled-checkbox API. */
export function Checkbox({ onChange, ...props }: CheckboxProps) {
  return <Atom63Checkbox {...props} onCheckedChange={checked => onChange?.(checked)} />
}
