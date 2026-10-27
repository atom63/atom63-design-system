import { amountFractions, amountSizes, themes } from '@atom63/ui-foundation'
import { Amount, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Amount',
  component: Amount,
  argTypes: {
    fraction: { control: 'inline-radio', options: amountFractions },
    size: { control: 'inline-radio', options: amountSizes },
  },
  args: { currency: 'USD', fraction: 'raised', locale: 'en-US', size: 'md', value: 13.25 },
} satisfies Meta<typeof Amount>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {amountSizes.map(size => (
        <Amount currency="USD" key={size} locale="en-US" size={size} value={2480.5} />
      ))}
      <Amount currency="USD" locale="en-US" size="lg" strong value={2480.5} />
    </div>
  ),
}

/* The fraction raised like a superscript (the default) or kept on the baseline,
   in a left-to-right and a right-to-left locale. */
export const Fractions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {amountFractions.map(fraction => (
        <div key={fraction} style={{ display: 'flex', gap: 24 }}>
          <Amount
            currency="USD"
            fraction={fraction}
            locale="en-US"
            size="lg"
            strong
            value={13.25}
          />
          <Amount currency="EUR" fraction={fraction} locale="de-DE" value={1234.56} />
          <Amount currency="USD" dir="rtl" fraction={fraction} locale="ar-EG" value={13.25} />
        </div>
      ))}
    </div>
  ),
}

/* The locale decides the separators and where the symbol goes; only the decimal
   separator and the digits after it are drawn small. */
export const Locales: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Amount currency="USD" locale="en-US" value={1234.56} />
      <Amount currency="EUR" locale="de-DE" value={1234.56} />
      <Amount currency="GBP" locale="en-GB" value={-42.1} />
      <Amount currency="JPY" locale="ja-JP" value={980} />
    </div>
  ),
}

/* A balance as a bank home screen draws it: a footnote label over the amount,
   inside the phone form factor that AppView layout="phone" stamps. */
export const PhoneBalance: Story = {
  render: () => (
    <div
      data-a63-form-factor="phone"
      style={{ display: 'grid', gap: 4, maxWidth: 390, padding: 16 }}
    >
      <p
        style={{
          color: 'var(--a63-text-secondary)',
          fontSize: 'var(--a63-type-footnote-font-size)',
          lineHeight: 'var(--a63-type-footnote-line-height)',
          margin: 0,
        }}
      >
        Main account
      </p>
      <Amount currency="USD" locale="en-US" size="lg" strong value={13250.75} />
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-page)', padding: '0.75rem' }}>
              <Amount currency="USD" locale="en-US" value={13.25} />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}
