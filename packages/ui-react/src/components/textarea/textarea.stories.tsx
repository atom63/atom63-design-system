import { textareaContract, textareaSizes, themes } from '@atom63/ui-foundation'
import { Textarea, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'

const meta = {
  title: 'UI React/Textarea',
  component: Textarea,
  args: {
    disabled: false,
    invalid: false,
    placeholder: 'Type something...',
    shadow: true,
    size: 'md',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    shadow: { control: 'boolean' },
    size: { control: 'select', options: textareaSizes },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

function PreviewCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      {children}
    </div>
  )
}

export const Playground: Story = {
  render: args => (
    <div style={{ maxWidth: 320 }}>
      <Textarea {...args} />
    </div>
  ),
}

/* Disabled state dims the recessed chrome. */
export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Textarea
        aria-label="Example text area, disabled"
        disabled
        defaultValue="Read only content"
      />
    </div>
  ),
}

/* Auto-grows with content via field-sizing: content. */
export const AutoSizing: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Textarea
        aria-label="Example text area"
        defaultValue={'Line one\nLine two\nLine three\nLine four'}
      />
    </div>
  ),
}

/* Drops the field chrome so it can nest inside a parent that provides it. */
export const Unstyled: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.75rem',
        width: 320,
      }}
    >
      <Textarea
        aria-label="Example text area"
        defaultValue="No chrome of my own — the parent frame owns it."
        unstyled
      />
    </div>
  ),
}

export const SizesAndStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 360 }}>
      {textareaSizes.map(size => (
        <Textarea
          aria-label="Example text area"
          defaultValue={`${size} textarea`}
          key={size}
          size={size}
        />
      ))}
      <Textarea
        aria-label="Example text area, invalid"
        invalid
        defaultValue="This content needs attention."
      />
      <Textarea aria-label="Example text area, disabled" disabled defaultValue="Disabled content" />
      <Textarea aria-label="Example text area" defaultValue="Flat field shadow" shadow={false} />
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <PreviewCard label={`${theme} / ${mode}`}>
              <Textarea aria-label="Example text area" defaultValue="The quick brown fox." />
              <Textarea
                aria-label="Example text area, invalid"
                invalid
                defaultValue="Invalid notes"
              />
            </PreviewCard>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <PreviewCard label="web / pointer">
          <Textarea aria-label="Example text area" defaultValue="Desktop notes" />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <PreviewCard label="ios / touch">
          <Textarea aria-label="Example text area" defaultValue="Touch notes" />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <PreviewCard label="extension / compact">
          <Textarea aria-label="Example text area" defaultValue="Compact notes" />
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(textareaContract, null, 2)}
    </pre>
  ),
}
