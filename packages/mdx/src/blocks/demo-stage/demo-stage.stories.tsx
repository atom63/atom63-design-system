import { DemoConfigPanel, DemoStage } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'

const meta = {
  title: 'MDX/Blocks/DemoStage',
  tags: ['!autodocs'],
  component: DemoStage,
  parameters: {
    layout: 'padded',
  },
  args: {
    children: (
      <span className="text-foreground text-2xl font-semibold tracking-tight">Demo content</span>
    ),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoStage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithRichContent: Story = {
  render: () => (
    <DemoStage>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl font-bold tracking-tight">Interactive stage</span>
        <span className="text-muted-foreground text-sm">
          A framed surface for a live demo or centerpiece visual.
        </span>
      </div>
    </DemoStage>
  ),
}

export const WithConfigPanel: Story = {
  render: () => <ConfigPanelExample />,
}

function ConfigPanelExample() {
  const stageRef = useRef<HTMLElement>(null)

  return (
    <DemoStage
      headerEnd={
        <DemoConfigPanel
          panelClassName="z-50 overflow-hidden rounded-lg bg-background shadow-lg"
          sheetClassName="max-h-[min(72dvh,38rem)]"
          sheetPanelClassName="p-0"
          stageRef={stageRef}
          title="Demo controls"
        >
          <div className="bg-background space-y-4 rounded-lg p-4">
            <div>
              <p className="text-foreground text-sm font-semibold">Demo controls</p>
              <p className="text-muted-foreground text-sm">A placeholder config panel.</p>
            </div>
            <div className="grid gap-2">
              <div className="bg-muted h-10 rounded-md" />
              <div className="bg-muted h-10 rounded-md" />
              <div className="bg-muted h-10 rounded-md" />
            </div>
          </div>
        </DemoConfigPanel>
      }
      headerStart={
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          Live canvas
        </span>
      }
      ref={stageRef}
    >
      <div className="bg-background flex aspect-square w-full max-w-72 items-center justify-center rounded-lg">
        <span className="text-muted-foreground text-sm">Demo</span>
      </div>
    </DemoStage>
  )
}
