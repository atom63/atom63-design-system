import {
  Button,
  Input,
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
  UIProvider,
} from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  compactGlobals,
  inMain,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { SettingsRow, SettingsSection, SettingsSwitchRow } from './settings-section'

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
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof Demo>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = { globals: phoneGlobals }

export const Tablet: Story = { globals: tabletGlobals }

export const Compact: Story = { globals: compactGlobals }

export const Wide: Story = { globals: wideGlobals }

/* Tapping a row's label text toggles its switch. */
export const LabelToggles: Story = {
  play: async ({ canvasElement }) => {
    const label = [...canvasElement.querySelectorAll('label')].find(
      element => element.textContent === 'Invoice paid'
    )
    const toggle = canvasElement.querySelector('[role="switch"]')
    if (!label || !toggle) throw new Error('Expected the Invoice paid row')
    label.click()
    await new Promise(resolve => setTimeout(resolve, 50))
    if (toggle.getAttribute('aria-checked') !== 'true')
      throw new Error('Clicking the label did not toggle the switch')
    label.click()
    await new Promise(resolve => setTimeout(resolve, 50))
    if (toggle.getAttribute('aria-checked') !== 'false')
      throw new Error('Clicking the label again did not toggle the switch back')
  },
}

const currencies = [
  { label: 'US dollar', value: 'usd' },
  { label: 'Euro', value: 'eur' },
  { label: 'Japanese yen', value: 'jpy' },
]

/* Any control in a row: a field, a select and a destructive action. */
function AnyControlDemo() {
  const [currency, setCurrency] = useState('usd')
  return (
    <div className="flex flex-col gap-10">
      <SettingsSection description="How your workspace appears to customers." title="Workspace">
        <SettingsRow description="Shown on every invoice you send." label="Workspace name">
          {({ controlId, descriptionId }) => (
            <Input aria-describedby={descriptionId} defaultValue="Tally Studio" id={controlId} />
          )}
        </SettingsRow>
        <SettingsRow description="New invoices start in this currency." label="Default currency">
          {({ descriptionId, labelId }) => (
            <Select
              items={currencies}
              onValueChange={next => setCurrency(next ?? 'usd')}
              value={currency}
            >
              <SelectTrigger aria-describedby={descriptionId} aria-labelledby={labelId}>
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {currencies.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          )}
        </SettingsRow>
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
    </div>
  )
}

export const AnyControl: Story = {
  render: () => <AnyControlDemo />,
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector('input:not([type="hidden"])')
    const label = input?.id ? canvasElement.querySelector(`label[for="${input.id}"]`) : null
    if (label?.textContent !== 'Workspace name') throw new Error('The field is not labelled')
    const trigger = canvasElement.querySelector('[aria-labelledby]:not([role="switch"])')
    if (!trigger) throw new Error('The select is not labelled by its row')
  },
}

export const AnyControlPhone: Story = { render: () => <AnyControlDemo />, globals: phoneGlobals }

/* Many rows, a long label and a long description, and the save states. */
export const ManyRows: Story = {
  render: () => (
    <SettingsSection
      description="Choose which invoice events send you an email, and how often we bundle them."
      title="Notifications"
    >
      <SettingsSwitchRow
        checked
        description="When a customer pays an invoice in full, including partial payments that complete the balance."
        label="Email me as soon as a customer pays an invoice in full, from any of the payment methods you accept"
        onCheckedChange={() => undefined}
      />
      <SettingsSwitchRow
        checked
        description="The morning after an invoice passes its due date."
        label="Invoice overdue"
        onCheckedChange={() => undefined}
        pending
      />
      <SettingsSwitchRow
        checked={false}
        error="Couldn't save. Check your connection and try again."
        label="Weekly digest"
        onCheckedChange={() => undefined}
      />
      {['Invoice sent', 'Invoice viewed', 'Payment failed', 'Refund issued', 'Customer added'].map(
        label => (
          <SettingsSwitchRow
            checked={false}
            key={label}
            label={label}
            onCheckedChange={() => undefined}
          />
        )
      )}
    </SettingsSection>
  ),
  play: ({ canvasElement }) => {
    if (!canvasElement.querySelector('[role="alert"]'))
      throw new Error('The failed save is not announced')
    for (const toggle of canvasElement.querySelectorAll<HTMLElement>('[role="switch"]')) {
      if (toggle.getBoundingClientRect().width === 0) throw new Error('A switch is squeezed out')
    }
  },
}

/*
 * A save in flight: the switch shows the new value, is busy, and the row shows
 * a spinner and "Saving…" in place of its description until the save settles.
 */
export const Pending: Story = {
  render: () => (
    <SettingsSection
      description="Choose which invoice events send you an email."
      title="Notifications"
    >
      <SettingsSwitchRow
        checked
        description="When a customer pays an invoice in full."
        label="Invoice paid"
        onCheckedChange={() => undefined}
        pending
      />
      <SettingsSwitchRow
        checked={false}
        description="A summary of the week's invoices every Monday."
        label="Weekly digest"
        onCheckedChange={() => undefined}
      />
    </SettingsSection>
  ),
  play: ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('[role="switch"][aria-busy="true"]')
    if (!toggle) throw new Error('The saving switch is not busy')
    const detail = document.getElementById(toggle.getAttribute('aria-describedby') ?? '')
    if (!detail?.textContent?.endsWith('Saving…') || !detail.querySelector('[data-slot="spinner"]'))
      throw new Error('The saving row does not show a spinner and "Saving…"')
    if (canvasElement.querySelectorAll('[data-pending]').length !== 1)
      throw new Error('Only the saving row shows the pending cue')
  },
}

/* Right-to-left: the heading on the right, the switches at the inline end (left). */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl" lang="ar">
      <SettingsSection description="اختر الأحداث التي ترسل إليك بريدًا." title="الإشعارات">
        <SettingsSwitchRow
          checked
          description="عندما يدفع العميل الفاتورة بالكامل."
          label="تم دفع الفاتورة"
          onCheckedChange={() => undefined}
        />
        <SettingsSwitchRow
          checked={false}
          description="صباح اليوم التالي لتاريخ الاستحقاق."
          label="فاتورة متأخرة"
          onCheckedChange={() => undefined}
        />
      </SettingsSection>
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const label = canvasElement.querySelector('label')
    const toggle = canvasElement.querySelector('[role="switch"]')
    if (!label || !toggle) throw new Error('Expected a row')
    if (toggle.getBoundingClientRect().right > label.getBoundingClientRect().left)
      throw new Error('Under RTL the switch should sit to the left of its label')
  },
}

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <Demo />
    </ThemeMatrix>
  ),
}
