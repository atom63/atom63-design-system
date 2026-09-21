import { avatarContract, avatarSizes, themes } from '@atom63/ui-foundation'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Avatar',
  component: Avatar,
  args: { size: 'default' },
  argTypes: { size: { control: 'inline-radio', options: avatarSizes } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

const SRC = 'https://i.pravatar.cc/80?img=12'

export const Playground: Story = {
  render: args => (
    <Avatar {...args}>
      <AvatarImage src={SRC} alt="Ada" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
      <Avatar size="sm">
        <AvatarImage src={SRC} alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src={SRC} alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src={SRC} alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
}

/* Fallback shows when no image resolves — the muted initials chip. */
export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>YZ</AvatarFallback>
    </Avatar>
  ),
}

/* A status Badge pinned to the corner, ringed against the page. */
export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={SRC} alt="Ada" />
      <AvatarFallback>AL</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
}

/* A stacked group with an overflow count. */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=1" alt="One" />
        <AvatarFallback>1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=2" alt="Two" />
        <AvatarFallback>2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=3" alt="Three" />
        <AvatarFallback>3</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
}

/* The avatar frame, fallback chip and status badge across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
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
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <Avatar>
                <AvatarImage src={SRC} alt="Ada" />
                <AvatarFallback>AL</AvatarFallback>
                <AvatarBadge />
              </Avatar>
              <Avatar>
                <AvatarFallback>YZ</AvatarFallback>
              </Avatar>
            </div>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      }}
    >
      {[
        { label: 'web / pointer', props: { designLanguage: 'web', input: 'pointer' } as const },
        { label: 'ios / touch', props: { designLanguage: 'ios', input: 'touch' } as const },
        {
          label: 'extension / compact',
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(({ label, props }) => (
        <UIProvider key={label} {...props}>
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
            <AvatarGroup>
              <Avatar>
                <AvatarImage alt="Ada" src={SRC} />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>YZ</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(avatarContract, null, 2)}
    </pre>
  ),
}
