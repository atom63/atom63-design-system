import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeftRight, Bitcoin, House, LineChart, Sparkles } from 'lucide-react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { TabBar } from './tab-bar'

const meta = {
  title: 'Templates/Blocks/Tab bar',
  component: TabBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TabBar>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  items: [
    { current: true, href: '#home', icon: <House aria-hidden />, label: 'Home' },
    { href: '#invest', icon: <LineChart aria-hidden />, label: 'Invest' },
    { href: '#payments', icon: <ArrowLeftRight aria-hidden />, label: 'Payments' },
    { href: '#crypto', icon: <Bitcoin aria-hidden />, label: 'Crypto' },
    { href: '#lifestyle', icon: <Sparkles aria-hidden />, label: 'Lifestyle' },
  ],
}

/* The layout places the bar; here it sits under a short page. */
const page = (children: React.ReactNode) => (
  <div className="bg-background text-foreground flex min-h-[24rem] flex-col">
    <p className="text-muted-foreground flex-1 p-4 text-sm">Page content above the tab bar.</p>
    {children}
  </div>
)

export const Desktop: Story = { args, render: props => page(<TabBar {...props} />) }

export const Phone: Story = {
  args,
  globals: phoneGlobals,
  render: props => page(<TabBar {...props} />),
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix frame>
      <TabBar {...props} />
    </ThemeMatrix>
  ),
}
