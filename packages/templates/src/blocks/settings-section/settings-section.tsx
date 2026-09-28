import { Card, Switch } from '@atom63/ui-react'
import { SectionHeader } from '@atom63/ui-react/layout'
import { type ReactNode, useId } from 'react'

export const template = {
  id: 'settings-section',
  kind: 'block',
  title: 'Settings section',
  description:
    'A titled group of settings: the heading and why the group matters on the start side, and labelled rows with their controls in a card beside it.',
  category: 'forms',
  tags: ['settings', 'preferences', 'account', 'notifications', 'toggles', 'form'],
  readiness: 'ready',
} as const

export interface SettingsSectionProps {
  children: ReactNode
  description: string
  title: string
}

/*
 * Stacked on a phone; from `lg` the heading takes a third of the width and
 * the rows the rest, so a page of sections reads down one edge.
 */
export function SettingsSection({ children, description, title }: SettingsSectionProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
      <SectionHeader description={description} level={2} title={title} variant="muted" />
      <Card padding="none">
        <div className="divide-border flex flex-col divide-y">{children}</div>
      </Card>
    </section>
  )
}

export interface SettingsSwitchRowProps {
  checked: boolean
  description?: string
  /** Why the setting cannot change, shown in place of the description. */
  disabledReason?: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

/* One setting: its label and description name the switch, so the whole row reads as one control. */
export function SettingsSwitchRow({
  checked,
  description,
  disabledReason,
  label,
  onCheckedChange,
}: SettingsSwitchRowProps) {
  const labelId = useId()
  const descriptionId = useId()
  const detail = disabledReason ?? description
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-foreground text-sm font-medium" id={labelId}>
          {label}
        </span>
        {detail ? (
          <span className="text-muted-foreground text-sm" id={descriptionId}>
            {detail}
          </span>
        ) : null}
      </div>
      <Switch
        aria-describedby={detail ? descriptionId : undefined}
        aria-labelledby={labelId}
        checked={checked}
        disabled={disabledReason !== undefined}
        onCheckedChange={next => onCheckedChange(next)}
      />
    </div>
  )
}
