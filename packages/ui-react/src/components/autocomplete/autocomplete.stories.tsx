import { autocompleteContract, themes } from '@atom63/ui-foundation'
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompleteSeparator,
  AutocompleteStatus,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Autocomplete',
  component: Autocomplete,
  decorators: [
    Story => (
      <div style={{ padding: 'clamp(12px, 8vw, 48px)', width: 'min(320px, 100%)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Autocomplete>

export default meta
type Story = StoryObj<typeof meta>

const fruits = [
  'Apple',
  'Apricot',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Grape',
  'Mango',
  'Orange',
  'Peach',
]

const groupedFruits = {
  Recent: ['Apple', 'Banana', 'Cherry'],
  Citrus: ['Grapefruit', 'Lemon', 'Orange'],
  Berries: ['Blackberry', 'Blueberry', 'Strawberry'],
}

function Demo({
  disabled,
  invalid,
  size,
}: {
  disabled?: boolean
  invalid?: boolean
  size?: 'sm' | 'md' | 'lg' | number
}) {
  return (
    <Autocomplete items={fruits}>
      <AutocompleteInput
        aria-label="Search fruit"
        disabled={disabled}
        invalid={invalid}
        placeholder="Search fruit…"
        showClear
        showTrigger
        size={size}
      />
      <AutocompletePopup>
        <AutocompleteEmpty>No fruit found.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  )
}

function GroupedDemo({ open, size }: { open?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Autocomplete
      autoHighlight={open ? 'always' : undefined}
      defaultOpen={open}
      items={Object.values(groupedFruits).flat()}
    >
      <AutocompleteInput placeholder="Search fruit…" showClear showTrigger size={size} />
      <AutocompletePopup>
        <AutocompleteEmpty>No fruit found.</AutocompleteEmpty>
        <AutocompleteList>
          {Object.entries(groupedFruits).map(([group, values], index) => (
            <AutocompleteGroup key={group}>
              {index > 0 ? <AutocompleteSeparator /> : null}
              <AutocompleteGroupLabel>{group}</AutocompleteGroupLabel>
              {values.map(value => (
                <AutocompleteItem key={value} value={value}>
                  {value}
                </AutocompleteItem>
              ))}
            </AutocompleteGroup>
          ))}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  )
}

export const Playground: Story = {
  render: () => <Demo />,
}

/** With a typed value, the clear button sits beside the trigger: neither covers the other. */
export const TriggerAndClearWithValue: Story = {
  render: () => (
    <Autocomplete defaultValue="Apple" items={fruits}>
      <AutocompleteInput
        aria-label="Search fruit"
        placeholder="Search fruit…"
        showClear
        showTrigger
      />
      <AutocompletePopup>
        <AutocompleteEmpty>No fruit found.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>('[data-slot="autocomplete-trigger"]')
    const clear = canvasElement.querySelector<HTMLElement>('[data-slot="autocomplete-clear"]')
    const input = canvasElement.querySelector<HTMLInputElement>('[data-slot="autocomplete-input"]')
    if (!trigger || !clear || !input)
      throw new Error('Expected the input, trigger and clear button')
    const a = trigger.getBoundingClientRect()
    const b = clear.getBoundingClientRect()
    if (a.left < b.right - 0.5 && b.left < a.right - 0.5) {
      throw new Error(
        `Expected the clear button beside the trigger (clear ${b.left}-${b.right}, trigger ${a.left}-${a.right})`
      )
    }
    const hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2)
    if (!hit || !trigger.contains(hit)) throw new Error('Expected the trigger to take the pointer')
    const text =
      input.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(input).paddingRight)
    if (text > b.left + 0.5) throw new Error('Expected the input to reserve room for both buttons')
  },
}

/** Open on load with the first item highlighted, so the visual and axe runs
 *  capture the popup, its groups and the highlighted row. */
export const MenuAnatomy: Story = {
  render: () => <GroupedDemo open />,
}

/** A query with no match shows the empty message in the open popup. */
export const Empty: Story = {
  render: () => (
    <Autocomplete defaultOpen defaultValue="Kiwano" items={fruits}>
      <AutocompleteInput aria-label="Search fruit" placeholder="Search fruit…" showClear />
      <AutocompletePopup>
        <AutocompleteEmpty>No fruit found.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  ),
}

/** While results load, the popup shows the status line in place of the list. */
export const Loading: Story = {
  render: () => (
    <Autocomplete defaultOpen defaultValue="Ber" items={[] as string[]}>
      <AutocompleteInput aria-label="Search fruit" placeholder="Search fruit…" />
      <AutocompletePopup>
        <AutocompleteStatus>Searching fruit…</AutocompleteStatus>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  ),
}

export const Disabled: Story = {
  render: () => <Demo disabled />,
}

/** `invalid` (or `aria-invalid`, which FormControl sets) draws the danger edge. */
export const Invalid: Story = {
  render: () => <Demo invalid />,
}

// The `size` prop on AutocompleteInput accepts named recipe sizes
// ('sm' | 'md' | 'lg') OR a number. A numeric value is forwarded to the
// native <input size> attribute for character-width sizing.
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--a63-text-secondary)', marginBottom: 6 }}>sm</div>
        <Demo size="sm" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--a63-text-secondary)', marginBottom: 6 }}>md</div>
        <Demo size="md" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--a63-text-secondary)', marginBottom: 6 }}>lg</div>
        <Demo size="lg" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--a63-text-secondary)', marginBottom: 6 }}>
          size={'{'}12{'}'} (native char-width)
        </div>
        <Demo size={12} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--a63-text-secondary)', marginBottom: 6 }}>
          size={'{'}30{'}'} (native char-width)
        </div>
        <Demo size={30} />
      </div>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Demo />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const RadiusSpacing: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        { label: 'Rounded items', radius: 'default' },
        { label: 'Flush square items', radius: 'none' },
      ].map(example => (
        <div
          key={example.radius}
          data-a63-radius={example.radius}
          style={{
            alignItems: 'center',
            background: 'var(--a63-surface-panel)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--a63-text-primary)',
            display: 'flex',
            gap: 12,
            padding: '0.75rem',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
            {example.label}
          </span>
          <GroupedDemo />
        </div>
      ))}
    </div>
  ),
}

/* The same autocomplete reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <GroupedDemo size={endpoint.label === 'Compact extension' ? 'sm' : 'md'} />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(autocompleteContract, null, 2)}
    </pre>
  ),
}
