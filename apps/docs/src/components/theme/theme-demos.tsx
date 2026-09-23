import { SegmentedControl } from '@atom63/ui-react'
import { useState } from 'react'

const APPEARANCE_ITEMS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
]

/** SegmentedControl is controlled-only, so the docs preview owns the value. */
export function SegmentedControlDemo({ tone = 'neutral' }: { tone?: 'accent' | 'neutral' }) {
  const [value, setValue] = useState('dark')

  return (
    <SegmentedControl items={APPEARANCE_ITEMS} onValueChange={setValue} tone={tone} value={value} />
  )
}
