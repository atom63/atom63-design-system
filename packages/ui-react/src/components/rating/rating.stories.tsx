import { ratingContract, ratingSizes, themes } from '@atom63/ui-foundation'
import { Rating, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heart } from 'lucide-react'
import { useState } from 'react'

const meta = {
  title: 'UI React/Rating',
  component: Rating,
  argTypes: {
    size: { control: 'inline-radio', options: ratingSizes },
  },
  args: { size: 'md', value: 4.5 },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

/* Read-only: one image named "4.5 out of 5", with a half star. */
export const Playground: Story = {}

function InputDemo() {
  const [value, setValue] = useState(3)
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <Rating label="Rate this recipe" onValueChange={setValue} value={value} />
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 13 }}>{value} of 5</span>
    </div>
  )
}

/* With onValueChange: a radio group, one radio per star; arrow keys change it. */
export const Input: Story = {
  render: () => <InputDemo />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {ratingSizes.map(size => (
        <Rating key={size} size={size} value={3.5} />
      ))}
    </div>
  ),
}

/* Other scales and glyphs: ten points, a heart in place of the star, disabled input. */
export const Variations: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Rating max={10} size="sm" value={7} />
      <Rating icon={<Heart aria-hidden />} label="Loved by 4 of 5" value={4} />
      <Rating disabled label="Rating, locked" onValueChange={() => {}} value={2} />
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
              <Rating label={`${theme} / ${mode}: 4.5 out of 5`} value={4.5} />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(ratingContract, null, 2)}
    </pre>
  ),
}
