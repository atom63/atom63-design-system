import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { AppViewPage, AppViewPhonePage } from './app-view'

const meta = {
  title: 'Templates/Pages/App view',
  component: AppViewPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppViewPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

/* On a phone the side panel hides and the docked bar keeps only the controls. */
export const Phone: Story = { globals: phoneGlobals }

/* layout="phone": edge to edge with no top bar or card, a mini player and the
   tab bar docked at the bottom. The id ends in `-phone`, so the visual project
   captures it at 390 px. */
export const EdgeToEdgePhone: Story = {
  globals: phoneGlobals,
  render: () => <AppViewPhonePage />,
}

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
      <AppViewPage />
    </ThemeMatrix>
  ),
}
