import { InformBanner } from '@atom63/inform/surfaces'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactElement } from 'react'

/** Decorative severity glyph: the message text carries the meaning, not this. */
function InfoGlyph(): ReactElement {
  return (
    <svg aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" strokeLinecap="round" />
    </svg>
  )
}

const meta = {
  title: 'Inform/Banner',
  component: InformBanner,
  args: {
    body: 'Design system work in progress — you may experience issues.',
  },
} satisfies Meta<typeof InformBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {}

export const WithTitle: Story = {
  args: { title: 'Heads up' },
}

export const Warning: Story = {
  args: { severity: 'warning', title: 'Scheduled maintenance' },
}

export const Danger: Story = {
  args: { severity: 'danger', title: 'Something is broken' },
}

export const Success: Story = {
  args: { severity: 'success', title: 'All clear' },
}

export const Dismissable: Story = {
  args: { dismissable: true },
}

/*
 * Wrapping cases. A banner centres its row, which is unambiguous on one line —
 * but once the message wraps, "centred" and "aligned to the first line" stop
 * agreeing, and the dismiss control has to pick one.
 */
const WRAPPING_DECORATOR = [
  (Story: () => ReactElement): ReactElement => (
    <div style={{ maxWidth: '28rem' }}>
      <Story />
    </div>
  ),
]

export const WithLeadingIcon: Story = {
  args: { icon: <InfoGlyph /> },
}

export const WithLeadingIconAndDismiss: Story = {
  args: { icon: <InfoGlyph />, dismissable: true },
}

export const WithLeadingIconTwoLines: Story = {
  args: {
    icon: <InfoGlyph />,
    dismissable: true,
    body: 'Design system work in progress — you may experience issues while the tokens and component contracts are still settling.',
  },
  decorators: WRAPPING_DECORATOR,
}

export const TwoLinesDismissable: Story = {
  args: {
    dismissable: true,
    body: 'Design system work in progress — you may experience issues while the tokens and component contracts are still settling.',
  },
  decorators: WRAPPING_DECORATOR,
}

export const ManyLinesDismissable: Story = {
  args: {
    dismissable: true,
    body: 'Design system work in progress — you may experience issues while the tokens, component contracts, and the OS63 windowing primitives are still settling into their final shape across every surface.',
  },
  decorators: WRAPPING_DECORATOR,
}

export const TwoLinesWithTitleDismissable: Story = {
  args: {
    dismissable: true,
    title: 'Heads up',
    body: 'Design system work in progress — you may experience issues while the tokens and component contracts are still settling.',
  },
  decorators: WRAPPING_DECORATOR,
}

export const WithActions: Story = {
  args: {
    actions: [
      {
        id: 'read',
        label: 'Read the notes',
        onSelect: () => undefined,
        variant: 'primary',
      },
    ],
  },
}

/* The severities side by side in dark mode, so visual regression covers dark. */
export const Dark: Story = {
  render: args => (
    <div style={{ display: 'grid', gap: 'var(--a63-space-3)' }}>
      {(['info', 'success', 'warning', 'danger'] as const).map(severity => (
        <InformBanner
          {...args}
          dismissable
          key={severity}
          severity={severity}
          title={severity.charAt(0).toUpperCase() + severity.slice(1)}
        />
      ))}
    </div>
  ),
  globals: { mode: 'dark' },
}
