import { contextMenuContract, themes } from '@atom63/ui-foundation'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'
import type { ComponentProps, CSSProperties } from 'react'

const meta = {
  title: 'UI React/ContextMenu',
  component: ContextMenu,
  decorators: [
    Story => (
      <div className="flex gap-6 p-3 sm:p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

const triggerStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 280,
  height: 160,
  borderRadius: 'var(--radius-lg)',
  background: 'var(--a63-surface-muted)',
  color: 'var(--a63-text-secondary)',
  fontSize: 14,
}

export const Playground: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div style={triggerStyle}>Right-click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuItem>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>Duplicate unavailable</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  const portalContainerRef = useRef<HTMLDivElement>(null)

  return (
    <UIProvider {...providerProps}>
      <div
        ref={portalContainerRef}
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
        <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
        <ContextMenu>
          <ContextMenuTrigger>
            <div style={{ ...triggerStyle, height: 96, width: 200 }}>Right-click here</div>
          </ContextMenuTrigger>
          <ContextMenuContent portalProps={{ container: portalContainerRef }}>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuItem disabled>Duplicate unavailable</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </UIProvider>
  )
}

export const WithSubAndCheckables: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div style={triggerStyle}>Right-click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>View</ContextMenuLabel>
        <ContextMenuCheckboxItem defaultChecked>Show grid</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Show rulers</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup defaultValue="name">
          <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/*
 * The popup is portalled and only opens on right-click, so each cell renders a
 * live trigger — open any one to see the overlay restyle per theme × mode
 * (bg/border/shadow/motion all resolve from --a63-* at the use-site).
 */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell
        label="Web"
        providerProps={{ density: 'comfortable', designLanguage: 'web', input: 'pointer' }}
      />
      <ReviewCell
        label="iOS touch"
        providerProps={{ density: 'comfortable', designLanguage: 'ios', input: 'touch' }}
      />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(contextMenuContract, null, 2)}
    </pre>
  ),
}
