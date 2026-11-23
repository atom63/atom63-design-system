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
  PortalContainerProvider,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type CSSProperties, type ComponentProps, type ReactNode, useState } from 'react'

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

/* The menu every review cell opens: a label, a shortcut, a disabled row,
   checkable rows and a destructive row, so one capture shows the item states. */
function ReviewMenuItems() {
  return (
    <>
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem>
        Copy
        <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem disabled>Duplicate unavailable</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem defaultChecked>Show grid</DropdownMenuCheckboxItem>
      <DropdownMenuRadioGroup defaultValue="name">
        <DropdownMenuRadioItem value="name">Sort by name</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
    </>
  )
}

/*
 * A labelled cell that holds one OPEN menu. The menu (and any submenu) portals
 * into the cell and the cell reserves the menu's height, so several open menus
 * share one capture without covering each other. Non-modal: two open modal
 * menus would each hide the other from assistive tech.
 */
function ReviewCell({
  children = <ReviewMenuItems />,
  height = 340,
  label,
  providerProps,
  triggerLabel = 'Open menu',
}: {
  children?: ReactNode
  height?: number
  label: string
  providerProps?: ProviderProps
  triggerLabel?: string
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <UIProvider {...providerProps}>
      <div
        ref={setContainer}
        style={{
          alignItems: 'flex-start',
          background: 'var(--a63-surface-panel)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          minBlockSize: height,
          padding: '0.75rem',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
          {label}
        </span>
        {container ? (
          <PortalContainerProvider container={container}>
            <DropdownMenu defaultOpen modal={false}>
              <DropdownMenuTrigger render={<Button variant="outline">{triggerLabel}</Button>} />
              <DropdownMenuContent align="start">{children}</DropdownMenuContent>
            </DropdownMenu>
          </PortalContainerProvider>
        ) : null}
      </div>
    </UIProvider>
  )
}

/*
 * An open non-modal menu, and any submenu, is bracketed by Base UI's aria-hidden
 * focus-guard spans that hand focus straight on to the next real target; axe's
 * aria-hidden-focus rule skips only those guards, and still runs on the rest.
 */
const focusGuardA11y = {
  a11y: {
    config: {
      rules: [
        {
          id: 'aria-hidden-focus',
          selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])',
        },
      ],
    },
  },
}

const reviewGrid: CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
  inlineSize: '100%',
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
    <DropdownMenu defaultOpen>
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

/* The open menu across all four themes x light/dark. */
export const Themes: Story = {
  parameters: focusGuardA11y,
  render: () => (
    <div style={reviewGrid}>
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

/*
 * The menu and its submenu, both open. While a submenu is open, Base UI puts a
 * span[aria-owns] pointing at it inside the parent menu, which axe's
 * aria-required-children rule rejects as a child of role="menu"; the rule is off
 * for this story only. Every other story keeps submenus closed.
 */
export const Submenu: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          ...focusGuardA11y.a11y.config.rules,
          { id: 'aria-required-children', enabled: false },
        ],
      },
    },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">Share</Button>} />
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuSub defaultOpen>
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

/* The open menu at each endpoint. On iOS touch every row is at least 44px tall
   (--a63-row-min-size); web and compact keep the pointer ramp. */
export const Endpoints: Story = {
  parameters: focusGuardA11y,
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <ReviewCell
        label="Web"
        providerProps={{ density: 'comfortable', designLanguage: 'web', input: 'pointer' }}
      />
      <ReviewCell
        height={440}
        label="iOS touch"
        providerProps={{ density: 'comfortable', designLanguage: 'ios', input: 'touch' }}
      />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectTouchRows(canvasElement)
  },
}

/* Every menu row inside a touch region is at least 44px tall. */
async function expectTouchRows(root: HTMLElement) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const rows = [...root.querySelectorAll<HTMLElement>('[data-a63-input="touch"] .a63-Menu-item')]
    if (rows.length > 0) {
      for (const row of rows) {
        const height = row.getBoundingClientRect().height
        if (height < 44) throw new Error(`Expected a 44px touch row, got ${height}px`)
      }
      return
    }
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error('Expected the open menu inside the touch region')
}

/* Right-to-left with long labels: the rows read right to left, the shortcut and
   the submenu chevron sit at the inline end and the chevron points there (the
   submenu opens that way), and a long label wraps inside the popup instead of
   widening it past the screen. */
export const RightToLeft: Story = {
  parameters: focusGuardA11y,
  render: () => (
    <ReviewCell
      height={400}
      label="rtl / ar"
      providerProps={{ dir: 'rtl', lang: 'ar' }}
      triggerLabel="فتح القائمة"
    >
      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
      <DropdownMenuItem>
        نسخ
        <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        نقل هذا المستند إلى مجلد المشاريع المؤرشفة الخاصة بالفريق بأكمله
      </DropdownMenuItem>
      <DropdownMenuItem>
        https://atom63.example/projects/quarterly-review/attachments/very-long-file-name.pdf
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>إرسال إلى</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>البريد</DropdownMenuItem>
          <DropdownMenuItem>الرسائل</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">حذف</DropdownMenuItem>
    </ReviewCell>
  ),
}

/* The open menu at phone width on touch: every row reaches 44px. */
export const OpenPhone: Story = {
  parameters: focusGuardA11y,
  render: () => (
    <ReviewCell
      height={460}
      label="Phone"
      providerProps={{ designLanguage: 'ios', input: 'touch' }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectTouchRows(canvasElement)
  },
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(dropdownMenuContract, null, 2)}
    </pre>
  ),
}
