import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { OnboardingPage } from './onboarding-page'

const meta = {
  title: 'Templates/Pages/Onboarding page',
  component: OnboardingPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OnboardingPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
      <OnboardingPage />
    </ThemeMatrix>
  ),
}
