import { calendarContract, themes } from '@atom63/ui-foundation'
import { Calendar, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { pendingContrastReview, repeatedLandmarks } from '../story-probes'

const meta = {
  title: 'UI React/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/* A fixed date keeps screenshots and a11y results the same on every day. */
const REFERENCE_DATE = new Date(2026, 0, 14)
const fixedDate = { defaultMonth: REFERENCE_DATE, today: REFERENCE_DATE }

/* Single-date selection — the default mode; the selected day fills with the
   brand primary and today shows a dot. */
export const Playground: Story = {
  parameters: pendingContrastReview,
  render: () => {
    const [date, setDate] = useState<Date | undefined>(REFERENCE_DATE)
    return <Calendar {...fixedDate} mode="single" onSelect={setDate} selected={date} />
  },
}

/* Range selection — connected ends with a tinted middle. */
export const Range: Story = {
  parameters: pendingContrastReview,
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: REFERENCE_DATE,
      to: new Date(2026, 0, 19),
    })
    return <Calendar {...fixedDate} mode="range" onSelect={setRange} selected={range} />
  },
}

/* Dropdown caption — month/year pickers instead of the label. */
export const DropdownCaption: Story = {
  parameters: pendingContrastReview,
  render: () => {
    const [date, setDate] = useState<Date | undefined>(REFERENCE_DATE)
    return (
      <Calendar
        {...fixedDate}
        captionLayout="dropdown"
        mode="single"
        onSelect={setDate}
        selected={date}
      />
    )
  },
}

/* Two months side by side. */
export const MultipleMonths: Story = {
  parameters: pendingContrastReview,
  render: () => {
    const [date, setDate] = useState<Date | undefined>(REFERENCE_DATE)
    return (
      <Calendar
        {...fixedDate}
        mode="single"
        numberOfMonths={2}
        onSelect={setDate}
        selected={date}
      />
    )
  },
}

/* The selected fill + today dot follow each theme's brand primary and mode. */
export const Themes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'inline-flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Calendar {...fixedDate} mode="single" selected={REFERENCE_DATE} />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same calendar reviewed against target host contexts. */
export const Endpoints: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'flex-start',
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <Calendar {...fixedDate} mode="single" selected={REFERENCE_DATE} />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(calendarContract, null, 2)}
    </pre>
  ),
}
