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

function Demo({ size }: { size?: 'sm' | 'default' | 'lg' | number }) {
  return (
    <Autocomplete items={fruits}>
      <AutocompleteInput placeholder="Search fruit…" showClear showTrigger size={size} />
      <AutocompletePopup>
        <AutocompleteEmpty>No fruit found.</AutocompleteEmpty>
        <AutocompleteList>
          {(fruit: string) => <AutocompleteItem key={fruit}>{fruit}</AutocompleteItem>}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  )
}

function GroupedDemo({ size }: { size?: 'sm' | 'default' | 'lg' }) {
  return (
    <Autocomplete items={Object.values(groupedFruits).flat()}>
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

export const MenuAnatomy: Story = {
  render: () => <GroupedDemo />,
}

// The `size` prop on AutocompleteInput accepts named recipe sizes
// ('sm' | 'default' | 'lg') OR a number. A numeric value is forwarded to the
// native <input size> attribute for character-width sizing.
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>sm</div>
        <Demo size="sm" />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>default</div>
        <Demo size="default" />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>lg</div>
        <Demo size="lg" />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
          size={'{'}12{'}'} (native char-width)
        </div>
        <Demo size={12} />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
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
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
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
          <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{example.label}</span>
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
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{endpoint.label}</span>
            <GroupedDemo size={endpoint.label === 'Compact extension' ? 'sm' : 'default'} />
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
