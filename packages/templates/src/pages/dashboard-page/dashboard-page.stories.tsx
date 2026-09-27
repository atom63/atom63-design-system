import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { DashboardPage } from './dashboard-page'

const meta = {
  title: 'Templates/Pages/Dashboard page',
  component: DashboardPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DashboardPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <DashboardPage />
    </ThemeMatrix>
  ),
}
