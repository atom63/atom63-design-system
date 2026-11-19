import { Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, LayoutDashboard, Settings } from 'lucide-react'

import { checkSafeArea, phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { AppShell } from './app-shell'

const args = {
  children: <p className="text-muted-foreground">The page renders here.</p>,
  navItems: [
    { current: true, href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
    { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
    { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
  ],
  productName: 'Tally',
  topBarActions: (
    <Button size="sm" variant="ghost">
      Ada Park
    </Button>
  ),
}

const meta = {
  title: 'Templates/Blocks/App shell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = { args }

/* The top bar owns the top inset; the page wrapper the bottom one; both clear the inline insets. */
export const Phone: Story = {
  args,
  globals: phoneGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      'main > header': { paddingInlineStart: '47px', paddingTop: '29px' },
      'main > header + div': {
        paddingBottom: '63px',
        paddingInlineStart: '47px',
        paddingTop: '32px',
      },
    }),
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix frame>
      <AppShell {...props} />
    </ThemeMatrix>
  ),
}
