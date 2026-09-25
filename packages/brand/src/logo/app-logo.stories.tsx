import { AppLogo, Atom63Logo } from '@atom63/brand'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Brand/Logo',
  tags: ['!autodocs'],
  component: AppLogo,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['horizontal', 'vertical', 'symbol', 'wordmark'] },
  },
  args: { variant: 'horizontal', height: 32, colored: false },
} satisfies Meta<typeof AppLogo>

export default meta

type Story = StoryObj<typeof meta>

/** Every variant in the surrounding text color, then with the colored symbol. */
export const Variants: Story = {
  render: args => (
    <div style={{ color: 'var(--a63-text-primary)', display: 'grid', gap: '2rem' }}>
      {[false, true].map(colored => (
        <div
          key={String(colored)}
          style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}
        >
          <AppLogo {...args} colored={colored} variant="horizontal" />
          <AppLogo {...args} colored={colored} variant="vertical" />
          <AppLogo {...args} colored={colored} variant="symbol" />
          <AppLogo {...args} colored={colored} variant="wordmark" />
          <Atom63Logo height={args.height} />
        </div>
      ))}
    </div>
  ),
}

/* Variants in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. */
export const Dark: Story = { ...Variants, globals: { mode: 'dark' } }
