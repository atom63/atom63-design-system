import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { SettingsPage } from './settings-page'

const meta = {
  title: 'Templates/Pages/Settings page',
  component: SettingsPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SettingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <SettingsPage />
    </ThemeMatrix>
  ),
}
