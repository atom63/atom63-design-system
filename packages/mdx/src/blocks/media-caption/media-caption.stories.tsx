import { MDXContentProvider, mdxStyles } from '@atom63/mdx'
import { MediaCaption } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/MediaCaption',
  tags: ['!autodocs'],
  component: MediaCaption,
  parameters: {
    layout: 'padded',
  },
  args: {
    children: 'Figure 1 — a consistent caption style shared across all media blocks.',
  },
  decorators: [
    Story => (
      <MDXContentProvider>
        <div className={mdxStyles.root} style={{ maxWidth: '48rem' }}>
          <Story />
        </div>
      </MDXContentProvider>
    ),
  ],
} satisfies Meta<typeof MediaCaption>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMarkup: Story = {
  render: () => (
    <MediaCaption>
      Shot on 35mm · <a href="https://unsplash.com">source</a>
    </MediaCaption>
  ),
}
