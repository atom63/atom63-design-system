import { Button, Field, FieldGroup, FieldLabel, Input } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { AuthCard } from './auth-card'

function Demo() {
  const emailId = useId()
  return (
    <AuthCard
      description="We'll email you a link to reset your password."
      footer={<p>Remembered it? Sign in instead.</p>}
      title="Reset password"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <Input autoComplete="email" id={emailId} type="email" />
        </Field>
        <Button className="w-full" variant="primary">
          Send reset link
        </Button>
      </FieldGroup>
    </AuthCard>
  )
}

const meta = {
  title: 'Templates/Blocks/Auth card',
  component: Demo,
} satisfies Meta<typeof Demo>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <Demo />
    </ThemeMatrix>
  ),
}
