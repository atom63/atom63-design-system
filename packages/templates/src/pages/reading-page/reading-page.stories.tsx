import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { ReadingPage } from './reading-page'

const meta = {
  title: 'Templates/Pages/Reading page',
  component: ReadingPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReadingPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
      <ReadingPage />
    </ThemeMatrix>
  ),
}
