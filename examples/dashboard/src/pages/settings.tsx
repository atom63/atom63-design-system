import { PageHeader, SettingsSection, SettingsSwitchRow } from '@atom63/templates'
import { Badge, Button, SegmentedControl, toast } from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { type ReactNode, useId, useState } from 'react'

import { type ModePreference, useAppearance } from '../appearance'

/* A settings row whose control is not a switch: label and description on the
   start side, the control on the end side (below them on a phone). */
function SettingsRow({
  children,
  description,
  label,
}: {
  children: (ids: { describedBy: string; labelledBy: string }) => ReactNode
  description: string
  label: string
}) {
  const labelId = useId()
  const descriptionId = useId()
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground text-sm font-medium" id={labelId}>
          {label}
        </span>
        <span className="text-muted-foreground text-sm" id={descriptionId}>
          {description}
        </span>
      </div>
      {children({ describedBy: descriptionId, labelledBy: labelId })}
    </div>
  )
}

const modeItems = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

export function SettingsPage() {
  const { preference, setPreference } = useAppearance()
  const [alerts, setAlerts] = useState({ churn: true, failedPayment: true, weekly: false })
  const toggle = (key: keyof typeof alerts) => (checked: boolean) =>
    setAlerts(current => ({ ...current, [key]: checked }))

  return (
    <Container gap={10} maxWidth="wide" padding="none">
      <PageHeader description="Changes apply as soon as you make them." title="Settings" />
      <SettingsSection
        description="Choose which account events send you an email."
        title="Notifications"
      >
        <SettingsSwitchRow
          checked={alerts.failedPayment}
          description="When an account's card is declined, so you can reach out before it churns."
          label="Failed payments"
          onCheckedChange={toggle('failedPayment')}
        />
        <SettingsSwitchRow
          checked={alerts.churn}
          description="When an account cancels or lets its plan lapse."
          label="Cancellations"
          onCheckedChange={toggle('churn')}
        />
        <SettingsSwitchRow
          checked={alerts.weekly}
          description="MRR, new accounts and churn for the week, every Monday."
          label="Weekly report"
          onCheckedChange={toggle('weekly')}
        />
      </SettingsSection>
      <SettingsSection
        description="Where Tidepool reads subscriptions and invoices from."
        title="Billing provider"
      >
        <SettingsRow
          description="Synced 12 minutes ago. Tidepool reads data only; it never charges customers."
          label="Billing account"
        >
          {({ describedBy }) => (
            <div className="flex items-center gap-3">
              <Badge variant="success">Connected</Badge>
              <Button
                aria-describedby={describedBy}
                onClick={() => toast('Sync started. New numbers appear in about a minute.')}
                size="sm"
                variant="outline"
              >
                Sync now
              </Button>
            </div>
          )}
        </SettingsRow>
      </SettingsSection>
      <SettingsSection
        description="How Tidepool looks on this device. It is remembered in this browser."
        title="Appearance"
      >
        <SettingsRow description="Follow the system, or always use light or dark." label="Mode">
          {({ describedBy, labelledBy }) => (
            <SegmentedControl
              aria-describedby={describedBy}
              aria-labelledby={labelledBy}
              items={modeItems}
              onValueChange={value => setPreference(value as ModePreference)}
              size="sm"
              value={preference}
            />
          )}
        </SettingsRow>
      </SettingsSection>
    </Container>
  )
}
