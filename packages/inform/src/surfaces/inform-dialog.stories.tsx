import { InformDialog } from '@atom63/inform/surfaces'
import type { Meta, StoryObj } from '@storybook/react-vite'

/* Inline so the stories need no network and no fixture file. */
const SAMPLE_MEDIA = (
  <img
    alt=""
    src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234f7cff'/%3E%3Cstop offset='1' stop-color='%2300d4b8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='180' fill='url(%23g)'/%3E%3C/svg%3E"
  />
)

const meta = {
  title: 'Inform/Dialog',
  component: InformDialog,
  args: {
    open: true,
    title: 'Before you continue',
    body: 'This interface is under active development and some routes may change.',
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InformDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    actions: [
      { id: 'ok', label: 'Got it', onSelect: () => undefined, variant: 'primary' },
      { id: 'later', label: 'Not now', onSelect: () => undefined, variant: 'secondary' },
    ],
  },
}

export const Danger: Story = {
  args: { severity: 'danger', title: 'Something is broken' },
}

export const NotDismissable: Story = {
  args: {
    dismissable: false,
    actions: [{ id: 'ok', label: 'Acknowledge', onSelect: () => undefined, variant: 'primary' }],
  },
}

/** A dialog can afford full-width media; its aspect ratio is fixed so a late decode shifts nothing. */
export const WithMedia: Story = {
  args: { media: SAMPLE_MEDIA },
}

export const Dark: Story = {
  args: WithActions.args,
  globals: { mode: 'dark' },
}
