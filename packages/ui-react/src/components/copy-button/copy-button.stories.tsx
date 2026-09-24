import {
  copyButtonContract,
  copyButtonSizePairs,
  copyButtonSizes,
  themes,
} from '@atom63/ui-foundation'
import { CopyButton, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from 'sonner'

const meta = {
  title: 'UI React/CopyButton',
  component: CopyButton,
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'outline', 'secondary'] },
    size: { control: 'select', options: copyButtonSizes },
  },
  args: { value: 'npm i @atom63/ui-react', label: 'Command' },
  // sonner's Toaster so the success/error toast is visible in the canvas.
  decorators: [
    Story => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

/* The visible value makes the icon-only action and its copied feedback unambiguous. */
export const Playground: Story = {
  render: args => (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 8,
        maxWidth: '100%',
        padding: 8,
      }}
    >
      <code
        style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {args.value}
      </code>
      <CopyButton {...args} />
    </div>
  ),
}

/* With children the button widens and shows a "Copied!" label after the swap. */
export const WithLabel: Story = {
  args: { children: 'Copy command' },
}

/* Every icon-only size beside its equivalent icon + label size. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {copyButtonSizePairs.map(pair => (
        <div
          key={pair.icon}
          style={{ alignItems: 'center', display: 'flex', gap: 12, minHeight: 48 }}
        >
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 88 }}>
            {pair.icon} / {pair.label}
          </span>
          <CopyButton size={pair.icon} value={pair.icon} variant="outline" />
          <CopyButton size={pair.label} value={pair.label} variant="outline">
            Copy
          </CopyButton>
        </div>
      ))}
    </div>
  ),
}

/* The three supported variants (ghost / outline / secondary). */
export const Variants: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <CopyButton value="ghost" variant="ghost" />
      <CopyButton value="outline" variant="outline" />
      <CopyButton value="secondary" variant="secondary" />
    </div>
  ),
}

/* Every DS theme × light/dark, showing all three variants on a panel. */
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
                flexWrap: 'wrap',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <CopyButton value="ghost" variant="ghost" />
              <CopyButton value="outline" variant="outline" />
              <CopyButton value="secondary" variant="secondary" />
              <CopyButton value="labelled" variant="outline">
                Copy
              </CopyButton>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

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
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
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
            <CopyButton value={`${endpoint.label}-icon`} variant="outline" />
            <CopyButton value={`${endpoint.label}-label`} variant="outline">
              Copy
            </CopyButton>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(copyButtonContract, null, 2)}
    </pre>
  ),
}
