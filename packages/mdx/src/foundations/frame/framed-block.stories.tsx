import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  FramedBlockHeader,
  MdxFrame,
  MdxFrameItemPanel,
  MdxFramePanel,
  MdxFrameSurface,
  TechnicalFrame,
} from './framed-block'

const meta = {
  title: 'MDX/Foundations/Frame',
  tags: ['!autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '52rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ContentFrame: Story = {
  render: () => (
    <MdxFrame>
      <FramedBlockHeader
        description="Used by Compare, LayerStack, and other prose-oriented teaching blocks."
        title="Content frame"
      />
      <MdxFramePanel>
        <div className="space-y-2 text-sm leading-relaxed text-pretty">
          <p>
            Content frames create one editorial unit with optional heading copy and one or more
            panels.
          </p>
          <p className="mdx-text-secondary">
            Blocks can tune panel density while keeping frame radius, surface, and border behavior
            consistent.
          </p>
        </div>
      </MdxFramePanel>
    </MdxFrame>
  ),
}

export const TechnicalChrome: Story = {
  render: () => (
    <TechnicalFrame
      headerEnd={<span className="mdx-text-secondary font-mono text-xs">copy</span>}
      headerStart={<span className="font-mono text-xs">tsx</span>}
      panelClassName="overflow-hidden p-0"
    >
      <pre className="m-0 overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <code>{`export function Example() {\n  return <Frame intent="technical" />\n}`}</code>
      </pre>
    </TechnicalFrame>
  ),
}

export const SurfaceFrame: Story = {
  render: () => (
    <MdxFrameSurface className="mx-auto max-w-md text-sm leading-relaxed" spacing="media">
      Single-surface frames are for compact framed chrome like MediaPlaceholder and DemoStage, where
      a full header/panel structure would be too much.
    </MdxFrameSurface>
  ),
}

export const Subframes: Story = {
  render: () => (
    <MdxFrame>
      <FramedBlockHeader
        description="Nested panels should feel attached to one parent frame, not like separate cards floating inside it."
        title="Subframe composition"
      />
      <div className="grid gap-1.5 md:grid-cols-2">
        <MdxFramePanel className="overflow-hidden p-0">
          <div className="px-4 py-4">
            <p className="font-mono text-[0.6875rem] tracking-wider text-red-400 uppercase">
              Before
            </p>
            <h3 className="mt-1 text-sm font-semibold">Loose nested card</h3>
            <p className="mdx-text-secondary mt-3 text-sm leading-relaxed">
              A subframe can own local density while inheriting the parent frame chrome.
            </p>
          </div>
          <div className="border-t border-[color-mix(in_oklab,var(--a63-border-subtle)_14%,transparent)] bg-[color-mix(in_oklab,var(--a63-surface-page)_88%,transparent)] px-4 py-3 font-mono text-xs">
            border-radius: 18px;
          </div>
        </MdxFramePanel>
        <MdxFramePanel className="overflow-hidden p-0">
          <div className="px-4 py-4">
            <p className="font-mono text-[0.6875rem] tracking-wider text-emerald-500 uppercase">
              After
            </p>
            <h3 className="mt-1 text-sm font-semibold">Attached tray</h3>
            <p className="mdx-text-secondary mt-3 text-sm leading-relaxed">
              The lower tray is visually connected through a divider instead of another rounded box.
            </p>
          </div>
          <div className="border-t border-[color-mix(in_oklab,var(--a63-border-subtle)_14%,transparent)] bg-[color-mix(in_oklab,var(--a63-surface-page)_88%,transparent)] px-4 py-3 font-mono text-xs">
            border-radius: inherit;
          </div>
        </MdxFramePanel>
      </div>
    </MdxFrame>
  ),
}

export const ItemPanels: Story = {
  render: () => (
    <MdxFrame>
      <FramedBlockHeader
        description="Reusable titled panels for blocks that compare, rank, or explain options without inventing new chrome."
        title="Item panel foundation"
      />
      <div className="grid gap-1.5 md:grid-cols-2">
        <MdxFrameItemPanel eyebrow="Before" title="Local patch" tone="negative">
          <p>Values are invented for the immediate screen.</p>
          <pre>
            <code>{`.card {\n  padding: 23px;\n}`}</code>
          </pre>
        </MdxFrameItemPanel>
        <MdxFrameItemPanel eyebrow="After" title="System contract" tone="positive">
          <p>Values come from semantic tokens that can evolve together.</p>
          <pre>
            <code>{`.card {\n  padding: var(--space-6);\n}`}</code>
          </pre>
        </MdxFrameItemPanel>
      </div>
    </MdxFrame>
  ),
}
