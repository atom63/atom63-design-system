import { Container } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Settings, Users } from 'lucide-react'
import { useState } from 'react'

import { AppShell } from '../../blocks/app-shell/app-shell'
import { PageHeader } from '../../blocks/page-header/page-header'
import { SettingsSection, SettingsSwitchRow } from '../../blocks/settings-section/settings-section'

export const template = {
  id: 'settings-page',
  kind: 'page',
  title: 'Settings page',
  description:
    'Preferences inside the app shell, grouped into titled sections of labelled switches that apply at once, including a locked setting that explains why.',
  category: 'forms',
  tags: [
    'settings',
    'preferences',
    'notifications',
    'security',
    'account',
    'switches',
    'app shell',
  ],
  readiness: 'draft',
} as const

const nav = [
  { href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '#customers', icon: <Users aria-hidden />, label: 'Customers' },
  { current: true, href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

export function SettingsPage() {
  const [settings, setSettings] = useState({
    digest: true,
    overdue: true,
    paid: false,
    twoFactor: true,
  })
  const toggle = (key: keyof typeof settings) => (checked: boolean) =>
    setSettings(current => ({ ...current, [key]: checked }))

  return (
    <AppShell navItems={nav} productName="Tally">
      <Container maxWidth="wide" padding="none">
        <PageHeader description="Changes apply as soon as you make them." title="Settings" />
        <SettingsSection
          description="Choose which invoice events send you an email."
          title="Notifications"
        >
          <SettingsSwitchRow
            checked={settings.paid}
            description="When a customer pays an invoice in full."
            label="Invoice paid"
            onCheckedChange={toggle('paid')}
          />
          <SettingsSwitchRow
            checked={settings.overdue}
            description="The morning after an invoice passes its due date."
            label="Invoice overdue"
            onCheckedChange={toggle('overdue')}
          />
          <SettingsSwitchRow
            checked={settings.digest}
            description="A summary of the week's invoices every Monday."
            label="Weekly digest"
            onCheckedChange={toggle('digest')}
          />
        </SettingsSection>
        <SettingsSection description="Protect access to your workspace." title="Security">
          <SettingsSwitchRow
            checked={settings.twoFactor}
            disabledReason="Required by your workspace owner."
            label="Two-step verification"
            onCheckedChange={toggle('twoFactor')}
          />
        </SettingsSection>
      </Container>
    </AppShell>
  )
}
