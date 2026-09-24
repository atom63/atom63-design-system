import { portalContainerContract } from '@atom63/ui-foundation'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  PortalContainerProvider,
  usePortalContainer,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = {
  title: 'UI React/PortalContainer',
  component: PortalContainerProvider,
} satisfies Meta<typeof PortalContainerProvider>

export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

function Consumer() {
  const container = usePortalContainer()
  const resolvedContainer =
    container === null
      ? 'null'
      : container === undefined
        ? 'undefined'
        : (container as HTMLElement).id || container.constructor.name
  return (
    <p style={{ fontFamily: 'var(--a63-control-font-family)' }}>
      Resolved portal container: <code>{resolvedContainer}</code>
    </p>
  )
}

function PortalPreview() {
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={setNode}
      style={{
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        minHeight: 200,
        overflow: 'hidden',
        padding: 16,
        position: 'relative',
        width: 'min(320px, 100%)',
      }}
    >
      <p style={{ color: 'var(--a63-text-secondary)', fontSize: 12, margin: '0 0 16px' }}>
        Bounded portal host
      </p>
      <PortalContainerProvider container={node}>
        <Popover defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Open inside host</Button>} />
          <PopoverContent align="start" side="bottom">
            <PopoverTitle>Contained overlay</PopoverTitle>
            <PopoverDescription>This popover stays inside the preview host.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </PortalContainerProvider>
    </div>
  )
}

export const Playground: Story = {
  render: () => <PortalPreview />,
}

export const NoContainer: Story = {
  render: () => (
    <PortalContainerProvider container={null}>
      <Consumer />
    </PortalContainerProvider>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(portalContainerContract, null, 2)}
    </pre>
  ),
}

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }
