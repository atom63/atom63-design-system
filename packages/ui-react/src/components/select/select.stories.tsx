import { selectContract, selectSizes, themes } from '@atom63/ui-foundation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  UIProvider,
} from '@atom63/ui-react'
import type { SelectPopupProps } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef, useState } from 'react'

const ITEMS = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'talk', label: 'Talk' },
]

function Demo({
  size,
  disabled,
  portalContainer,
}: {
  size?: (typeof selectSizes)[number]
  disabled?: boolean
  portalContainer?: SelectPopupProps['portalContainer']
}) {
  const [value, setValue] = useState('all')
  return (
    <div style={{ width: 220 }}>
      <Select items={ITEMS} onValueChange={next => setValue(next ?? '')} value={value}>
        <SelectTrigger aria-label="Example select, disabled" disabled={disabled} size={size}>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup portalContainer={portalContainer}>
          {ITEMS.map(i => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

const meta = {
  title: 'UI React/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => <Demo />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
      {selectSizes.map(size => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <Demo disabled />,
}

const GROUPED = [
  { value: 'article', label: 'Article', group: 'Reading' },
  { value: 'post', label: 'Post', group: 'Reading' },
  { value: 'video', label: 'Video', group: 'Watching' },
  { value: 'talk', label: 'Talk', group: 'Watching' },
]

/**
 * Grouped items with labels + a separator, rendered via the `SelectContent`
 * alias (identical to `SelectPopup`). Exercises `SelectGroup`,
 * `SelectGroupLabel`, and `SelectSeparator`.
 */
export const Grouped: Story = {
  render: () => {
    function GroupedDemo() {
      const [value, setValue] = useState('article')
      return (
        <div style={{ width: 220 }}>
          <Select items={GROUPED} onValueChange={next => setValue(next ?? '')} value={value}>
            <SelectTrigger aria-label="Example select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectGroupLabel>Reading</SelectGroupLabel>
                {GROUPED.filter(i => i.group === 'Reading').map(i => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectGroupLabel>Watching</SelectGroupLabel>
                {GROUPED.filter(i => i.group === 'Watching').map(i => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )
    }
    return <GroupedDemo />
  },
}

const LONG = Array.from({ length: 24 }, (_, i) => ({
  value: `opt-${i + 1}`,
  label: `Option ${i + 1}`,
}))

/**
 * A long list that overflows the popup so the up/down scroll arrows
 * (`ScrollUpArrow` / `ScrollDownArrow`) become visible on hover near the edges.
 */
export const Scrollable: Story = {
  render: () => {
    function ScrollableDemo() {
      const [value, setValue] = useState(LONG[0].value)
      return (
        <div style={{ width: 220 }}>
          <Select items={LONG} onValueChange={next => setValue(next ?? '')} value={value}>
            <SelectTrigger aria-label="Example select">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {LONG.map(i => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      )
    }
    return <ScrollableDemo />
  },
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  return (
    <UIProvider {...providerProps}>
      <div
        ref={portalContainerRef}
        style={{
          alignItems: 'center',
          background: 'var(--a63-surface-panel)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          minHeight: 72,
          padding: 12,
        }}
      >
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
          {label}
        </span>
        <Demo portalContainer={portalContainerRef} />
      </div>
    </UIProvider>
  )
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell label="Web" providerProps={{ designLanguage: 'web', input: 'pointer' }} />
      <ReviewCell label="iOS touch" providerProps={{ designLanguage: 'ios', input: 'touch' }} />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(selectContract, null, 2)}
    </pre>
  ),
}
