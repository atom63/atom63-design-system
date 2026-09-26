import { ImageCompare } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within } from 'storybook/test'

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const beforeImage = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
  <rect width="960" height="540" fill="#f6f2ed"/>
  <rect x="80" y="72" width="800" height="396" rx="28" fill="#ffffff"/>
  <rect x="120" y="112" width="250" height="52" rx="12" fill="#d7d2ca"/>
  <rect x="120" y="204" width="210" height="176" rx="24" fill="#dbe8ff"/>
  <rect x="374" y="187" width="198" height="193" rx="16" fill="#efe7da"/>
  <rect x="612" y="218" width="188" height="162" rx="30" fill="#d7d2ca"/>
  <rect x="120" y="416" width="680" height="18" rx="9" fill="#c9c0b5"/>
</svg>`)

const afterImage = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
  <rect width="960" height="540" fill="#f6f2ed"/>
  <rect x="80" y="72" width="800" height="396" rx="20" fill="#ffffff"/>
  <rect x="128" y="120" width="288" height="48" rx="8" fill="#1f2937"/>
  <rect x="128" y="208" width="204" height="164" rx="14" fill="#dbe8ff"/>
  <rect x="378" y="208" width="204" height="164" rx="14" fill="#e6e0d6"/>
  <rect x="628" y="208" width="204" height="164" rx="14" fill="#ece7df"/>
  <rect x="128" y="416" width="704" height="16" rx="8" fill="#8b8378"/>
</svg>`)

const meta = {
  title: 'MDX/Blocks/ImageCompare',
  tags: ['!autodocs'],
  component: ImageCompare,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '64rem' }}>
        <Story />
      </div>
    ),
  ],
  // The slider is code-split and replaces a skeleton once it loads; wait for
  // it so tests see the finished block. The chunk can take well over the
  // default 1 s to load on a busy CI browser.
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('slider', undefined, { timeout: 10_000 })
  },
} satisfies Meta<typeof ImageCompare>

export default meta

type Story = StoryObj<typeof meta>

export const SideBySide: Story = {
  args: {
    before: {
      alt: 'Ad hoc interface with inconsistent spacing and radius.',
      label: 'Before',
      src: beforeImage,
    },
    after: {
      alt: 'System-aligned interface with consistent spacing and radius.',
      label: 'After',
      src: afterImage,
    },
    caption: 'Use image comparison when the visual difference carries the teaching point.',
    description: 'A dedicated image compare block keeps image pairs aligned in article prose.',
    title: 'Ad hoc layout vs system layout',
  },
}

export const Plain: Story = {
  name: 'Plain (no text → image block)',
  args: {
    before: {
      alt: 'Ad hoc interface with inconsistent spacing and radius.',
      label: 'Before',
      src: beforeImage,
    },
    after: {
      alt: 'System-aligned interface with consistent spacing and radius.',
      label: 'After',
      src: afterImage,
    },
  },
}

export const LongLabels: Story = {
  args: {
    before: {
      alt: 'Before state with dense labels.',
      label: 'Before: local visual patches',
      src: beforeImage,
    },
    after: {
      alt: 'After state with system-aligned labels.',
      label: 'After: semantic system contract',
      src: afterImage,
    },
    caption: 'Long labels truncate inside the overlay instead of colliding with the slider handle.',
    // Prefer idle reset over leave-snap — leave reset fights active drag.
    resetAfterIdle: true,
    title: 'Label overflow behavior',
  },
}
