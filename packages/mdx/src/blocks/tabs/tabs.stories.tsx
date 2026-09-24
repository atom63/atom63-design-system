import { Tabs } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Tabs',
  tags: ['!autodocs'],
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const ThreePanels: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Tabs defaultValue="tokens">
      <Tabs.List>
        <Tabs.Tab value="tokens">Tokens</Tabs.Tab>
        <Tabs.Tab value="theme">Theme</Tabs.Tab>
        <Tabs.Tab value="usage">Usage</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tokens">
        <p>Primitive values — color ramps, the type scale, spacing, and radius.</p>
      </Tabs.Panel>
      <Tabs.Panel value="theme">
        <p>Semantic tokens map primitives to intent so components restyle per theme.</p>
      </Tabs.Panel>
      <Tabs.Panel value="usage">
        <p>Authors compose panels without ever reaching for raw primitive values.</p>
      </Tabs.Panel>
    </Tabs>
  ),
}

export const TwoPanels: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Tabs defaultValue="preview">
      <Tabs.List>
        <Tabs.Tab value="preview">Preview</Tabs.Tab>
        <Tabs.Tab value="code">Code</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="preview">
        <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-6 text-sm">
          Rendered preview goes here.
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="code">
        <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-6 font-mono text-sm">
          &lt;Button variant="primary"&gt;Save&lt;/Button&gt;
        </div>
      </Tabs.Panel>
    </Tabs>
  ),
}

export const UnderlineVariant: Story = {
  name: 'Underline list variant',
  args: {
    children: null,
  },
  render: () => (
    <Tabs defaultValue="one">
      <Tabs.List variant="underline">
        <Tabs.Tab value="one">First</Tabs.Tab>
        <Tabs.Tab value="two">Second</Tabs.Tab>
        <Tabs.Tab value="three">Third</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one">
        <p>The underline variant is passed to `Tabs.List`, not the root.</p>
      </Tabs.Panel>
      <Tabs.Panel value="two">
        <p>Only the active-indicator styling changes between variants.</p>
      </Tabs.Panel>
      <Tabs.Panel value="three">
        <p>Keyboard navigation and roles are inherited from `@atom63/ui-react`.</p>
      </Tabs.Panel>
    </Tabs>
  ),
}
