import type { Meta, StoryObj } from '@storybook/react-vite'

import { Spinner } from './spinner'

const meta = {
  title: 'UI React/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Spinner />
      <span>Loading component data</span>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner style={{ height: 12, width: 12 }} />
      <Spinner style={{ height: 20, width: 20 }} />
      <Spinner style={{ height: 32, width: 32 }} />
    </div>
  ),
}

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }
