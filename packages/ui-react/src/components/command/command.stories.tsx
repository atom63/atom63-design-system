import { commandContract, themes } from '@atom63/ui-foundation'
import {
  Command,
  CommandCollection,
  CommandCreateHandle,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
  Kbd,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useMemo, useState } from 'react'

const meta = {
  title: 'UI React/Command',
  component: Command,
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

type Item = { id: string; label: string; shortcut?: string; value: string }
type Group = { id: string; label: string; items: Item[] }

const groups: Group[] = [
  {
    id: 'navigate',
    label: 'Navigate',
    items: [
      { id: 'home', label: 'Home', value: 'Home /' },
      { id: 'blog', label: 'Blog', value: 'Blog /blog' },
      { id: 'timeline', label: 'Timeline', value: 'Timeline /timeline' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [{ id: 'prefs', label: 'Preferences', shortcut: '⌘,', value: 'Preferences settings' }],
  },
]

function Palette() {
  return (
    <Command itemToStringValue={item => (item as Item).value} items={groups}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandPanel>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {(group: Group) => (
            <Fragment key={group.id}>
              <CommandGroup items={group.items}>
                <CommandGroupLabel>{group.label}</CommandGroupLabel>
                <CommandCollection>
                  {(item: Item) => (
                    <CommandItem key={item.id} value={item}>
                      <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
                      {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
              {group.id !== groups.at(-1)?.id ? <CommandSeparator /> : null}
            </Fragment>
          )}
        </CommandList>
      </CommandPanel>
      <CommandFooter>
        <span style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
          <Kbd>↑↓</Kbd>
          <span>Navigate</span>
        </span>
        <CommandShortcut>⌘K</CommandShortcut>
      </CommandFooter>
    </Command>
  )
}

/* The palette on its own (no dialog) — useful for inspecting the panel chrome. */
export const Inline: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--a63-surface-overlay)',
        boxShadow: 'var(--a63-overlay-shadow)',
        maxWidth: 480,
        overflow: 'hidden',
      }}
    >
      <Palette />
    </div>
  ),
}

const triggerStyle = {
  border: '1px solid var(--a63-border-control)',
  borderRadius: 'var(--a63-radius-control)',
  background: 'var(--a63-surface-control)',
  color: 'var(--a63-text-primary)',
  cursor: 'pointer',
  padding: '0.5rem 0.75rem',
} as const

/* The full modal (⌘K) shell — click to open the dialog. */
export const Dialog: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)} style={triggerStyle} type="button">
            Open command palette
          </button>
          <CommandDialog onOpenChange={setOpen} open={open}>
            <CommandDialogPopup>
              <Palette />
            </CommandDialogPopup>
          </CommandDialog>
        </>
      )
    }
    return <Demo />
  },
}

/*
 * Programmatic handle — CommandCreateHandle() builds a detached DialogHandle you
 * pass to CommandDialog via `handle`. Any button can then call handle.open(null)
 * imperatively (no open state to thread), and a detached CommandDialogTrigger wired
 * to the same handle stays in sync.
 */
export const ProgrammaticHandle: Story = {
  render: () => {
    function Demo() {
      // Create the handle once for this mounted tree.
      const handle = useMemo(() => CommandCreateHandle(), [])
      return (
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          {/* Imperative open — fired from an arbitrary event handler. */}
          <button onClick={() => handle.open(null)} style={triggerStyle} type="button">
            Open via handle.open()
          </button>
          {/* A detached trigger bound to the same handle. */}
          <CommandDialogTrigger handle={handle} style={triggerStyle}>
            Open via detached trigger
          </CommandDialogTrigger>
          <CommandDialog handle={handle}>
            <CommandDialogPopup>
              <Palette />
            </CommandDialogPopup>
          </CommandDialog>
        </div>
      )
    }
    return <Demo />
  },
}

/* Every DS theme × light/dark — the inline palette chrome reads a63 overlay tokens. */
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
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <div
                style={{
                  background: 'var(--a63-surface-overlay)',
                  border: '1px solid var(--a63-border-subtle)',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: 'var(--a63-overlay-shadow)',
                  flex: 1,
                  maxWidth: 420,
                  overflow: 'hidden',
                }}
              >
                <Palette />
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same command palette reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
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
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <div
              style={{
                background: 'var(--a63-surface-overlay)',
                border: '1px solid var(--a63-border-subtle)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--a63-overlay-shadow)',
                flex: 1,
                maxWidth: 420,
                overflow: 'hidden',
              }}
            >
              <Palette />
            </div>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(commandContract, null, 2)}
    </pre>
  ),
}
