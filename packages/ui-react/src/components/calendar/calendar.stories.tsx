import { calendarContract, themes } from '@atom63/ui-foundation'
import { Calendar, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

const meta = {
  title: 'UI React/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/* Single-date selection — the default mode; the selected day fills with the
   brand primary and today shows a dot. */
export const Playground: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return <Calendar mode="single" onSelect={setDate} selected={date} />
  },
}

/* Range selection — connected ends with a tinted middle. */
export const Range: Story = {
  render: () => {
    const today = new Date()
    const [range, setRange] = useState<DateRange | undefined>({
      from: today,
      to: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    })
    return <Calendar mode="range" onSelect={setRange} selected={range} />
  },
}

/* Dropdown caption — month/year pickers instead of the label. */
export const DropdownCaption: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return <Calendar captionLayout="dropdown" mode="single" onSelect={setDate} selected={date} />
  },
}

/* Two months side by side. */
export const MultipleMonths: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return <Calendar mode="single" numberOfMonths={2} onSelect={setDate} selected={date} />
  },
}

/* The selected fill + today dot follow each theme's brand primary and mode. */
export const Themes: Story = {
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
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <Calendar mode="single" selected={new Date()} />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same calendar reviewed against target host contexts. */
export const Endpoints: Story = {
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
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{endpoint.label}</span>
            <Calendar mode="single" selected={new Date()} />
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
