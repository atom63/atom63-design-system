import { inputOTPContract, themes } from '@atom63/ui-foundation'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const meta = {
  title: 'UI React/InputOTP',
  component: InputOTP,
} satisfies Meta<typeof InputOTP>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj
type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

const endpointCases: readonly [string, ProviderProps][] = [
  ['Web', { designLanguage: 'web', input: 'pointer' }],
  ['iOS touch', { designLanguage: 'ios', input: 'touch' }],
  ['Compact extension', { density: 'compact', designLanguage: 'web', input: 'pointer' }],
]

/* A 6-digit code entered as one fused pill. Focus a slot to see the caret. */
export const Playground: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, i) => (
          <InputOTPSlot index={i} key={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}

/* Two grouped triplets split by a separator (e.g. 3-3 verification codes). */
export const WithSeparator: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}

/* A pre-filled, disabled field. */
export const Disabled: Story = {
  render: () => (
    <InputOTP disabled maxLength={4} value="1234">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const Invalid: Story = {
  render: () => (
    <InputOTP aria-invalid maxLength={6} value="1234">
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot index={index} key={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}

/* The segmented field across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <InputOTP maxLength={6} value="1234">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {endpointCases.map(([label, providerProps]) => (
        <UIProvider key={label} {...providerProps}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-panel)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: 12,
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
            <InputOTP maxLength={4} value="1234">
              <InputOTPGroup>
                {Array.from({ length: 4 }, (_, index) => (
                  <InputOTPSlot index={index} key={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(inputOTPContract, null, 2)}
    </pre>
  ),
}
