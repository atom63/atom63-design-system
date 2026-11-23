import { Card, Spinner, Switch } from '@atom63/ui-react'
import { SectionHeader } from '@atom63/ui-react/layout'
import { type ReactNode, useId } from 'react'

export const template = {
  id: 'settings-section',
  kind: 'block',
  title: 'Settings section',
  description:
    'A titled group of settings: the heading and why the group matters on the start side, and labelled rows with their controls in a card beside it: switches, or any control such as a field, a select or a destructive action.',
  category: 'forms',
  tags: [
    'settings',
    'preferences',
    'account',
    'notifications',
    'toggles',
    'form',
    'select',
    'danger zone',
  ],
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

/** The ids a row's control takes, so the label and description name it. */
export interface SettingsRowIds {
  /** Put on a field (`Input`, `Textarea`): the row's `<label>` points at it. */
  controlId: string
  /** The description's id, for `aria-describedby`; absent without one. */
  descriptionId?: string
  /** The label's id, for `aria-labelledby` on a control a `<label>` cannot name, such as a `Select` trigger. */
  labelId: string
}

export interface SettingsRowProps {
  /** The control, given the ids that connect it to the label and description. */
  children: (ids: SettingsRowIds) => ReactNode
  description?: ReactNode
  label: string
  /**
   * `false` when the control names itself, such as a button: the label renders
   * as text with `labelId`, not as a `<label>` pointing at `controlId`.
   */
  labelFor?: boolean
}

/*
 * One setting with any control beside its label: a field, a select, a link or
 * a destructive button. A button has no `<label>`: set `labelFor={false}`
 * and name it with `labelId` (`aria-labelledby`), so its own text can stay
 * short. On a phone a wide control drops under the label.
 */
export function SettingsRow({ children, description, label, labelFor = true }: SettingsRowProps) {
  const controlId = useId()
  const labelId = useId()
  const descriptionId = useId()
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4">
      <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
        {labelFor ? (
          <label className="text-foreground text-sm font-medium" htmlFor={controlId} id={labelId}>
            {label}
          </label>
        ) : (
          <span className="text-foreground text-sm font-medium" id={labelId}>
            {label}
          </span>
        )}
        {description ? (
          <span className="text-muted-foreground text-sm" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </div>
      <div className="flex max-w-full min-w-0 items-center">
        {children({ controlId, descriptionId: description ? descriptionId : undefined, labelId })}
      </div>
    </div>
  )
}

export interface SettingsSwitchRowProps {
  checked: boolean
  description?: string
  /** Why the setting cannot change, shown in place of the description. */
  disabledReason?: string
  /** Why the last change did not save, shown in place of the description. */
  error?: string
  label: string
  onCheckedChange: (checked: boolean) => void
  /** The change is saving: the switch shows the new value and waits. */
  pending?: boolean
  /** Shown with a spinner in place of the description while `pending`; "Saving…" by default. */
  pendingLabel?: string
}

/*
 * One setting: its label and description name the switch, and the label is a
 * `<label>`, so tapping its text toggles the switch too.
 */
export function SettingsSwitchRow({
  checked,
  description,
  disabledReason,
  error,
  label,
  onCheckedChange,
  pending = false,
  pendingLabel = 'Saving…',
}: SettingsSwitchRowProps) {
  const switchId = useId()
  const labelId = useId()
  const descriptionId = useId()
  const saving = pending && disabledReason === undefined
  const failed = error !== undefined && !saving && disabledReason === undefined
  const detail = disabledReason ?? (saving ? pendingLabel : (error ?? description))
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <label className="text-foreground text-sm font-medium" htmlFor={switchId} id={labelId}>
          {label}
        </label>
        {detail ? (
          <span
            className={
              failed
                ? 'text-sm text-[var(--a63-text-danger)]'
                : 'text-muted-foreground flex items-center gap-1.5 text-sm'
            }
            data-pending={saving || undefined}
            id={descriptionId}
            role={failed ? 'alert' : undefined}
          >
            {saving && (
              <Spinner aria-hidden aria-label={undefined} className="size-3.5" role={undefined} />
            )}
            {detail}
          </span>
        ) : null}
      </div>
      <Switch
        aria-busy={pending || undefined}
        aria-describedby={detail ? descriptionId : undefined}
        aria-labelledby={labelId}
        checked={checked}
        disabled={disabledReason !== undefined}
        id={switchId}
        onCheckedChange={next => onCheckedChange(next)}
        readOnly={pending}
      />
    </div>
  )
}
