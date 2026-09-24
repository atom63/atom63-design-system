import { tabsContract, tabsSizes, tabsVariants, themes } from '@atom63/ui-foundation'
import { Tabs, TabsList, TabsPanel, TabsTab, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { pendingContrastReview } from '../story-probes'

const meta = {
  title: 'UI React/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const PANEL_STYLE = { color: 'var(--a63-text-secondary)', fontSize: 14, paddingTop: 8 }

export const Playground: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="specs">Specs</TabsTab>
        <TabsTab value="reviews">Reviews</TabsTab>
      </TabsList>
      <TabsPanel style={PANEL_STYLE} value="overview">
        Overview content
      </TabsPanel>
      <TabsPanel style={PANEL_STYLE} value="specs">
        Specs content
      </TabsPanel>
      <TabsPanel style={PANEL_STYLE} value="reviews">
        Reviews content
      </TabsPanel>
    </Tabs>
  ),
}

export const Variants: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {tabsVariants.map(variant => (
        <div key={variant}>
          <p style={{ color: 'var(--a63-text-secondary)', fontSize: 12, marginBottom: 8 }}>
            {variant}
          </p>
          <Tabs defaultValue="one">
            <TabsList variant={variant}>
              <TabsTab value="one">First</TabsTab>
              <TabsTab value="two">Second</TabsTab>
              <TabsTab value="three">Third</TabsTab>
            </TabsList>
          </Tabs>
        </div>
      ))}
    </div>
  ),
}

/* attached — the connected "folder": the tab row sits flush on a card panel
   body, and the active tab merges into it (no bottom border, shares the panel
   surface). Only reads with a panel present, which Variants omits. */
export const Attached: Story = {
  parameters: pendingContrastReview,
  render: () => (
    <Tabs defaultValue="overview" style={{ maxWidth: 460 }}>
      <TabsList variant="attached">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="specs">Specs</TabsTab>
        <TabsTab value="reviews">Reviews</TabsTab>
      </TabsList>
      <TabsPanel value="overview">
        The active tab connects into this card panel — one continuous folder shape.
      </TabsPanel>
      <TabsPanel value="specs">Specs content.</TabsPanel>
      <TabsPanel value="reviews">Reviews content.</TabsPanel>
    </Tabs>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {tabsSizes.map(size => (
        <Tabs defaultValue="one" key={size}>
          <TabsList size={size}>
            <TabsTab value="one">List</TabsTab>
            <TabsTab value="two">Grid</TabsTab>
          </TabsList>
        </Tabs>
      ))}
    </div>
  ),
}

export const MobileOverflow: Story = {
  tags: ['!manifest'],
  render: () => (
    <UIProvider input="touch">
      <div style={{ maxWidth: 320, width: 'min(100%, calc(100vw - 2rem))' }}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTab value="overview">Project overview</TabsTab>
            <TabsTab value="activity">Recent activity</TabsTab>
            <TabsTab value="permissions">Access permissions</TabsTab>
            <TabsTab value="integrations">Connected integrations</TabsTab>
          </TabsList>
        </Tabs>
      </div>
    </UIProvider>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Tabs defaultValue="one">
                <TabsList variant="default">
                  <TabsTab value="one">First</TabsTab>
                  <TabsTab value="two">Second</TabsTab>
                </TabsList>
              </Tabs>
              <Tabs defaultValue="one">
                <TabsList variant="underline">
                  <TabsTab value="one">First</TabsTab>
                  <TabsTab value="two">Second</TabsTab>
                </TabsList>
              </Tabs>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Contract probe — remaps the control + surface + track contracts live. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointTabs label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointTabs label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact">
        <EndpointTabs label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

function EndpointTabs({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: 8,
        padding: 12,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTab value="one">First</TabsTab>
          <TabsTab value="two">Second</TabsTab>
        </TabsList>
      </Tabs>
    </div>
  )
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(tabsContract, null, 2)}
    </pre>
  ),
}
