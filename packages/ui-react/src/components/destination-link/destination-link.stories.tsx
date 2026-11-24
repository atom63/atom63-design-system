import { themes } from '@atom63/ui-foundation'
import { DestinationIndicator, DestinationLink, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Destination Link',
  component: DestinationLink,
} satisfies Meta<typeof DestinationLink>

export default meta
type Story = StoryObj<typeof meta>

export const Internal: Story = {
  args: {
    children: (
      <>
        View project
        <DestinationIndicator className="size-4" kind="internal" />
      </>
    ),
    href: '#internal',
    kind: 'internal',
  },
}

export const External: Story = {
  args: {
    children: (
      <>
        View source
        <DestinationIndicator className="size-4" kind="external" />
      </>
    ),
    href: 'https://example.com',
    kind: 'external',
  },
}

/* Internal in dark mode, with the global on <html>, so portals are dark too. */
export const Dark: Story = { ...Internal, globals: { mode: 'dark' } }

export const CardTitle: Story = {
  args: {
    ...Internal.args,
    variant: 'card',
  },
}

export const Themes: Story = {
  args: { href: '#internal', kind: 'internal' },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <p style={{ background: 'var(--a63-surface-page)', margin: 0, padding: '0.75rem' }}>
              <DestinationLink href="#internal" kind="internal">
                View project
                <DestinationIndicator className="size-4" kind="internal" />
              </DestinationLink>{' '}
              <DestinationLink href="https://example.com" kind="external">
                View source
                <DestinationIndicator className="size-4" kind="external" />
              </DestinationLink>
            </p>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
