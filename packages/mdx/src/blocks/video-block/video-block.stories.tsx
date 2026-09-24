import { VideoBlock } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const SAMPLE_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const _SAMPLE_POSTER =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

const meta = {
  title: 'MDX/Blocks/Video Block',
  tags: ['!autodocs'],
  component: VideoBlock,
  parameters: { layout: 'padded' },
  args: {
    title: 'Big Buck Bunny — sample clip',
    src: SAMPLE_SRC,
    captionPolicy: 'decorative',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCaption: Story = {
  name: 'With caption',
  args: {
    caption: 'A short animated sample clip rendered inside the MDX video block.',
    showCaption: true,
  },
}

export const CoverFit: Story = {
  name: 'Cover fit',
  args: {
    fit: 'cover',
  },
}

export const AutoplayLoop: Story = {
  name: 'Autoplay + loop (muted)',
  args: {
    autoPlay: true,
    loop: true,
    controls: false,
  },
}

export const DecorativeBackground: Story = {
  name: 'Decorative (no controls)',
  render: () => (
    <VideoBlock
      autoPlay
      captionPolicy="decorative"
      controls={false}
      loop
      muted
      src={SAMPLE_SRC}
      title="Decorative background loop"
    />
  ),
}
