import { PageTableOfContents } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * `PageTableOfContents` derives its items from real DOM headings inside the
 * `containerSelector` (default `main`/`article`), so each story renders a mock
 * `<article>` of `h2`/`h3` headings for it to observe. It renders `null` until
 * at least one heading is found.
 */
const meta = {
  title: 'MDX/Blocks/Page Table Of Contents',
  tags: ['!autodocs'],
  component: PageTableOfContents,
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <main
        style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 16rem', padding: '2rem' }}
      >
        <article style={{ minWidth: 0 }}>
          <h1>Design tokens</h1>
          <p>
            A walkthrough of the token layers and how themes remap them. Scroll to see the active
            heading update in the table of contents.
          </p>
          <h2>Primitives</h2>
          <p>Raw color, spacing, and timing values that nothing consumes directly.</p>
          <h3>Color primitives</h3>
          <p>The full palette, expressed as OKLCH ramps.</p>
          <h3>Spacing primitives</h3>
          <p>A modular spacing scale from 0 to 96.</p>
          <h2>Aliases</h2>
          <p>A neutral surface family and duration names layered over the primitives.</p>
          <h2>Semantics</h2>
          <p>Component-facing roles like primary, destructive, and muted.</p>
          <h3>Interactive states</h3>
          <p>Hover, active, and focus tokens for controls.</p>
          <h2>Themes</h2>
          <p>Each theme overrides the alias and knob layers without touching component markup.</p>
        </article>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PageTableOfContents>

export default meta

type Story = StoryObj<typeof meta>

export const Rail: Story = {
  args: { variant: 'rail' },
}

export const CustomLabel: Story = {
  name: 'Custom label',
  args: { variant: 'rail', label: 'Contents' },
}

export const Menu: Story = {
  args: { variant: 'menu', label: 'TOC', showProgress: false },
}
