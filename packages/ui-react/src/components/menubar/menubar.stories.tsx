import { menubarContract, themes } from '@atom63/ui-foundation'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef } from 'react'

const meta = {
  title: 'UI React/Menubar',
  component: Menubar,
  decorators: [
    Story => (
      <div style={{ padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

type PortalContainer = ComponentProps<typeof MenubarContent>['portalContainer']

function Demo({ portalContainer }: { portalContainer?: PortalContainer }) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent portalContainer={portalContainer}>
          <MenubarItem>
            New Tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent portalContainer={portalContainer}>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent portalContainer={portalContainer}>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent portalContainer={portalContainer}>
          <MenubarCheckboxItem checked>Show Sidebar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show Toolbar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup defaultValue="grid">
            <MenubarRadioItem value="grid">Grid</MenubarRadioItem>
            <MenubarRadioItem value="list">List</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const Playground: Story = {
  render: () => <Demo />,
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            mode={mode}
            theme={theme}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell designLanguage="web" input="pointer" label="Web" />
      <ReviewCell designLanguage="ios" input="touch" label="iOS touch" />
      <ReviewCell
        density="compact"
        designLanguage="web"
        input="pointer"
        label="Compact extension"
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(menubarContract, null, 2)}
    </pre>
  ),
}

type ReviewCellProps = Omit<ComponentProps<typeof UIProvider>, 'children'> & { label: string }

function ReviewCell({ label, ...providerProps }: ReviewCellProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  return (
    <UIProvider {...providerProps}>
      <div
        ref={portalContainerRef}
        style={{
          alignItems: 'center',
          background: 'var(--a63-surface-panel)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          padding: 12,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
          {label}
        </span>
        <Demo portalContainer={portalContainerRef} />
      </div>
    </UIProvider>
  )
}
