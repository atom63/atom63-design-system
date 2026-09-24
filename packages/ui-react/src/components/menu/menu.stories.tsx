import { menuContract } from '@atom63/ui-foundation'
import { UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, ChevronRight, Circle } from 'lucide-react'
import type { CSSProperties } from 'react'
import { EnvironmentShell, ThemeMatrix } from '../story-probes'

/*
 * Static preview of the shared `.a63-Menu-*` recipe (the one DropdownMenu,
 * ContextMenu, Menubar and the Select popup all consume). Renders the raw menu
 * markup so every item state is visible at once — no trigger to click, no portal.
 */

const meta = {
  title: 'UI React/Menu',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/* The full state gallery, rendered as a static popup. `tone` opts into the
   primary-highlight variant. */
function MenuPreview({ tone }: { tone?: 'primary' }) {
  return (
    <div
      className="a63-Menu-popup"
      data-tone={tone}
      style={{ position: 'static', minWidth: '15rem', maxHeight: 'none' } as CSSProperties}
    >
      <div className="a63-Menu-label">Actions</div>
      <div className="a63-Menu-item">
        <span>Copy</span>
        <span className="a63-Menu-shortcut">⌘C</span>
      </div>
      <div className="a63-Menu-item" data-highlighted="">
        <span>Paste (highlighted)</span>
        <span className="a63-Menu-shortcut">⌘V</span>
      </div>
      <div className="a63-Menu-item" data-disabled="">
        <span>Disabled</span>
        <span className="a63-Menu-shortcut">⌘D</span>
      </div>

      <div className="a63-Menu-separator" />

      <div className="a63-Menu-item a63-Menu-item--indicator">
        <span className="a63-Menu-item-indicator">
          <Check aria-hidden />
        </span>
        <span>Checkbox (checked)</span>
      </div>
      <div className="a63-Menu-item a63-Menu-item--indicator" data-highlighted="">
        <span className="a63-Menu-item-indicator">
          <Circle aria-hidden />
        </span>
        <span>Radio (selected, highlighted)</span>
      </div>
      <div className="a63-Menu-item a63-Menu-sub-trigger" data-popup-open="">
        <span>Submenu</span>
        <span className="a63-Menu-sub-icon">
          <ChevronRight aria-hidden />
        </span>
      </div>

      <div className="a63-Menu-separator" />

      <div className="a63-Menu-item" data-variant="destructive">
        <span>Delete</span>
        <span className="a63-Menu-shortcut">⌫</span>
      </div>
      <div className="a63-Menu-item" data-variant="destructive" data-highlighted="">
        <span>Delete (highlighted)</span>
        <span className="a63-Menu-shortcut">⌫</span>
      </div>
    </div>
  )
}

/* Every item state, in one static popup, across web/ios × light/dark. */
export const Preview: Story = {
  render: () => (
    <EnvironmentShell>
      <MenuPreview />
    </EnvironmentShell>
  ),
}

/* The two authored highlight tones side by side: neutral (default) vs primary. */
export const Tones: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'Geist Mono, monospace' }}>
            neutral (default)
          </div>
          <MenuPreview />
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'Geist Mono, monospace' }}>
            primary (data-tone)
          </div>
          <MenuPreview tone="primary" />
        </div>
      </div>
    </EnvironmentShell>
  ),
}

/* The menu across all four skins × light/dark. */
export const Themes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ThemeMatrix>
      <MenuPreview />
    </ThemeMatrix>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointMenu label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointMenu label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointMenu label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(menuContract, null, 2)}
    </pre>
  ),
}

function EndpointMenu({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'flex-start',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.7, paddingTop: 8, width: 112 }}>{label}</span>
      <MenuPreview />
    </div>
  )
}
