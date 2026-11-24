import { Button, DropdownMenuItem, DropdownMenuSeparator, Input } from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Settings } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { AppShell } from '../../blocks/app-shell/app-shell'
import { PageHeader } from '../../blocks/page-header/page-header'
import {
  SettingsRow,
  SettingsSection,
  SettingsSwitchRow,
} from '../../blocks/settings-section/settings-section'

export const template = {
  id: 'settings-page',
  kind: 'page',
  title: 'Settings page',
  description:
    'Preferences inside the app shell, grouped into titled sections: a profile field, labelled switches that save at once and say when a save fails, a locked setting that explains why, and a danger zone.',
  category: 'forms',
  tags: [
    'settings',
    'preferences',
    'notifications',
    'security',
    'account',
    'switches',
    'profile',
    'danger zone',
    'app shell',
  ],
  readiness: 'ready',
} as const

const nav = [
  { href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { current: true, href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

/* The signed-in user at the foot of the sidebar, with the account menu. */
const user = {
  detail: 'ada@tally.app',
  menu: (
    <>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </>
  ),
  name: 'Ada Park',
}

type NotificationKey = 'digest' | 'overdue' | 'paid'

export interface SettingsContentProps {
  /** More sections, after the built-in ones: the product's own settings. */
  children?: ReactNode
  /**
   * Saves one switch. The switch shows the new value while this runs; if it
   * rejects, the switch goes back and the row says the change did not save.
   * Resolves at once by default.
   */
  saveSetting?: (key: NotificationKey, checked: boolean) => Promise<void>
}

const saveFailed = "Couldn't save. Check your connection and try again."

export function SettingsContent({
  children,
  saveSetting = () => Promise.resolve(),
}: SettingsContentProps) {
  const [settings, setSettings] = useState({ digest: true, overdue: true, paid: false })
  const [pending, setPending] = useState<Partial<Record<NotificationKey, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<NotificationKey, string>>>({})
  const toggle = (key: NotificationKey) => async (checked: boolean) => {
    const previous = settings[key]
    setSettings(current => ({ ...current, [key]: checked }))
    setPending(current => ({ ...current, [key]: true }))
    setErrors(current => ({ ...current, [key]: undefined }))
    try {
      await saveSetting(key, checked)
    } catch {
      setSettings(current => ({ ...current, [key]: previous }))
      setErrors(current => ({ ...current, [key]: saveFailed }))
    } finally {
      setPending(current => ({ ...current, [key]: false }))
    }
  }
  const row = (key: NotificationKey) => ({
    checked: settings[key],
    error: errors[key],
    onCheckedChange: toggle(key),
    pending: pending[key],
  })

  return (
    <Container maxWidth="wide" padding="none">
      <PageHeader description="Changes apply as soon as you make them." title="Settings" />
      <SettingsSection description="How you appear on invoices and to your team." title="Profile">
        <SettingsRow description="Shown on every invoice you send." label="Display name">
          {({ controlId, descriptionId }) => (
            <Input aria-describedby={descriptionId} defaultValue="Ada Park" id={controlId} />
          )}
        </SettingsRow>
      </SettingsSection>
      <SettingsSection
        description="Choose which invoice events send you an email."
        title="Notifications"
      >
        <SettingsSwitchRow
          description="When a customer pays an invoice in full."
          label="Invoice paid"
          {...row('paid')}
        />
        <SettingsSwitchRow
          description="The morning after an invoice passes its due date."
          label="Invoice overdue"
          {...row('overdue')}
        />
        <SettingsSwitchRow
          description="A summary of the week's invoices every Monday."
          label="Weekly digest"
          {...row('digest')}
        />
      </SettingsSection>
      <SettingsSection description="Protect access to your workspace." title="Security">
        <SettingsSwitchRow
          checked
          disabledReason="Required by your workspace owner."
          label="Two-step verification"
          onCheckedChange={() => undefined}
        />
      </SettingsSection>
      <SettingsSection description="Actions here cannot be undone." title="Danger zone">
        <SettingsRow
          description="Deletes every invoice, customer and payment record."
          label="Delete workspace"
          labelFor={false}
        >
          {({ descriptionId, labelId }) => (
            <Button
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              variant="destructive-outline"
            >
              Delete
            </Button>
          )}
        </SettingsRow>
      </SettingsSection>
      {children}
    </Container>
  )
}

/* The page in its app shell. An app that renders the shell once, around its
   routes, renders `SettingsContent` inside it instead. */
export function SettingsPage(props: SettingsContentProps) {
  return (
    <AppShell navItems={nav} productName="Tally" user={user}>
      <SettingsContent {...props} />
    </AppShell>
  )
}
