import {
  feedbackStateContract,
  feedbackStateKinds,
  feedbackStateSizes,
  themes,
} from '@atom63/ui-foundation'
import { FeedbackState, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/FeedbackState',
  component: FeedbackState,
  argTypes: {
    state: { control: 'inline-radio', options: feedbackStateKinds },
    size: { control: 'inline-radio', options: feedbackStateSizes },
    showIcon: { control: 'boolean' },
  },
  args: { size: 'panel', state: 'empty', showIcon: true },
} satisfies Meta<typeof FeedbackState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* Each kind ships its own icon + default copy (inbox / alert / spinner / …). */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {feedbackStateKinds.map(state => (
        <div
          key={state}
          style={{ background: 'var(--a63-surface-panel)', borderRadius: 12, padding: 8 }}
        >
          <FeedbackState size="inline" state={state} />
        </div>
      ))}
    </div>
  ),
}

/* Actions render as DS Buttons (onClick + href variants). An Error's message is a
   secondary detail line under the friendly description. */
export const WithActions: Story = {
  args: {
    state: 'error',
    error: new Error('The upstream service returned a 500.'),
    actions: [
      { icon: 'refreshCw', label: 'Retry', onClick: () => {} },
      { href: '/', label: 'Go home', variant: 'ghost' },
    ],
  },
}

/* Right to left, with every built-in string replaced through labels: the actions
   start at the right. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar" style={{ maxWidth: 420 }}>
      <FeedbackState
        actions={[
          { icon: 'refreshCw', label: 'إعادة المحاولة', onClick: () => {} },
          { href: '/', label: 'الصفحة الرئيسية', variant: 'ghost' },
        ]}
        error={new Error('TypeError: Failed to fetch')}
        labels={{
          descriptions: { error: 'تعذّر تحميل البيانات. حاول مرة أخرى.' },
          titles: { error: 'حدث خطأ ما' },
        }}
        state="error"
      />
    </div>
  ),
  play: ({ canvasElement }) => {
    const title = canvasElement.querySelector('[data-slot="feedback-state-title"]')
    if (title?.textContent !== 'حدث خطأ ما') throw new Error('Expected the labelled title')
    const [first, second] = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="feedback-state-content"] > *'
    )
    if (!first || !second) throw new Error('Expected two actions')
    if (first.getBoundingClientRect().left <= second.getBoundingClientRect().left) {
      throw new Error('Expected the first action at the right in RTL')
    }
  },
}

/* At phone width on touch: the panel and the page size (min-height 100dvh) with
   two actions, which stay inside the 390px column. */
export const Phone: Story = {
  render: () => (
    <UIProvider input="touch">
      <div style={{ display: 'grid', gap: 16, width: 390 }}>
        {(['panel', 'page'] as const).map(size => (
          <div
            data-phone-size={size}
            key={size}
            style={{ background: 'var(--a63-surface-panel)', borderRadius: 12 }}
          >
            <FeedbackState
              actions={[
                { icon: 'refreshCw', label: 'Try again', onClick: () => {} },
                { href: '/', label: 'Go to dashboard', variant: 'ghost' },
              ]}
              size={size}
              state="offline"
            />
          </div>
        ))}
      </div>
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    for (const box of canvasElement.querySelectorAll<HTMLElement>('[data-phone-size]')) {
      const root = box.querySelector<HTMLElement>('[data-slot="feedback-state"]')
      if (!root) throw new Error('Expected a FeedbackState')
      if (root.scrollWidth > root.clientWidth) {
        throw new Error(`${box.dataset.phoneSize}: content overflows the phone width`)
      }
      const boxRect = box.getBoundingClientRect()
      for (const action of root.querySelectorAll<HTMLElement>('.a63-Button')) {
        const rect = action.getBoundingClientRect()
        if (rect.left < boxRect.left || rect.right > boxRect.right) {
          throw new Error(`${box.dataset.phoneSize}: an action leaves the column`)
        }
      }
    }
  },
}

/* no-results reads the active query into its description. */
export const NoResults: Story = {
  args: { size: 'inline', state: 'no-results', query: 'holographic widgets' },
}

/* Sizes only change gap + padding (page adds min-h + generous inset). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['inline', 'panel', 'widget'] as const).map(size => (
        <div
          key={size}
          style={{ background: 'var(--a63-surface-panel)', borderRadius: 12, padding: 8 }}
        >
          <FeedbackState size={size} state="empty" title={`size = ${size}`} />
        </div>
      ))}
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-panel)', borderRadius: 12, padding: 8 }}>
              <FeedbackState
                actions={[{ icon: 'refreshCw', label: 'Retry', onClick: () => {} }]}
                size="inline"
                state="error"
                title={`${theme} / ${mode}`}
              />
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
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
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
            <FeedbackState
              actions={[{ icon: 'refreshCw', label: 'Retry', onClick: () => {} }]}
              size="inline"
              state="error"
            />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(feedbackStateContract, null, 2)}
    </pre>
  ),
}
