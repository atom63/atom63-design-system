import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { SignInPage } from './sign-in-page'

const meta = {
  title: 'Templates/Pages/Sign-in page',
  component: SignInPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignInPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <SignInPage />
    </ThemeMatrix>
  ),
}

/* Submitting without an email shows the inline field error. */
export const MissingEmail: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await canvas.findByText('Enter your email address.')
  },
}

/* The template's demo check rejects the password "wrong". */
export const WrongPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Email'), 'ada@example.com')
    await userEvent.type(canvas.getByLabelText('Password'), 'wrong')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await canvas.findByText('That email and password do not match')
  },
}
