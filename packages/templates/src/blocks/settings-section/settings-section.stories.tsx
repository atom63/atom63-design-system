import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { SettingsSection, SettingsSwitchRow } from './settings-section'

function Demo() {
  const [paid, setPaid] = useState(false)
  const [overdue, setOverdue] = useState(true)
  return (
    <SettingsSection
      description="Choose which invoice events send you an email."
      title="Notifications"
    >
      <SettingsSwitchRow
        checked={paid}
        description="When a customer pays an invoice in full."
        label="Invoice paid"
        onCheckedChange={setPaid}
      />
      <SettingsSwitchRow
        checked={overdue}
        description="The morning after an invoice passes its due date."
        label="Invoice overdue"
        onCheckedChange={setOverdue}
      />
      <SettingsSwitchRow
        checked
        disabledReason="Required by your workspace owner."
        label="Security alerts"
        onCheckedChange={() => undefined}
      />
    </SettingsSection>
  )
}

const meta = {
  title: 'Templates/Blocks/Settings section',
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
