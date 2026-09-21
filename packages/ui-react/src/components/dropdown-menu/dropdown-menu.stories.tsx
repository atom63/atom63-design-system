import { dropdownMenuContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef } from 'react'

const meta = {
  title: 'UI React/DropdownMenu',
  component: DropdownMenu,
  decorators: [
    Story => (
      <div style={{ display: 'flex', gap: 24, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

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
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Open menu</Button>} />
          <DropdownMenuContent align="start" portalProps={{ container: portalContainerRef }}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Duplicate unavailable</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </UIProvider>
  )
}

export const Playground: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline">Open menu</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          Copy
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Paste
          <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const CheckboxAndRadio: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline">View options</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuCheckboxItem defaultChecked>Grid</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Rulers</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup defaultValue="name">
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

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

export const Submenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline">Share</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Messages</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>More…</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
        <DropdownMenuItem inset>Inset item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      {JSON.stringify(dropdownMenuContract, null, 2)}
    </pre>
  ),
}
