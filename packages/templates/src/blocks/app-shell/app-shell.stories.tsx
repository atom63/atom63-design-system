import { Button, DropdownMenuItem, DropdownMenuSeparator, UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, Folder, LayoutDashboard, Settings } from 'lucide-react'

import {
  checkSafeArea,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { AppShell } from './app-shell'

const args = {
  children: <p className="text-muted-foreground">The page renders here.</p>,
  navItems: [
    { current: true, href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
    { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
    { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
  ],
  productName: 'Tally',
  topBarActions: (
    <Button size="sm" variant="ghost">
      Ada Park
    </Button>
  ),
}

const meta = {
  title: 'Templates/Blocks/App shell',
  component: AppShell,
  parameters: { layout: 'fullscreen', ...landmarkParameters },
} satisfies Meta<typeof AppShell>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = { args }

const user = {
  detail: 'ada@tally.app',
  menu: (
    <>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </>
  ),
  name: 'Ada Park',
}

const userArgs = { ...args, topBarActions: undefined, user }

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/* The user row sits in the sidebar's "Account" landmark and opens the account menu. */
export const WithUser: Story = {
  args: userArgs,
  play: async ({ canvasElement }) => {
    const region = canvasElement.querySelector('[role="region"][aria-label="Account"]')
    const trigger = region?.querySelector('button[aria-haspopup="menu"]')
    if (!(trigger instanceof HTMLElement))
      throw new Error('No account menu button in the Account region')
    if (
      !trigger.textContent?.includes('Ada Park') ||
      !trigger.textContent.includes('ada@tally.app')
    ) {
      throw new Error('The account menu button does not show the name and detail')
    }
    trigger.click()
    await wait(300)
    const menu = document.querySelector('[role="menu"]')
    if (!menu?.textContent?.includes('Sign out')) throw new Error('The account menu did not open')
    // Close it again: the menu renders in a portal, outside the page's landmarks.
    menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await wait(300)
    if (document.querySelector('[role="menu"]')) throw new Error('The account menu did not close')
  },
}

/* Without menu actions the row is plain text. */
export const WithUserNoMenu: Story = {
  args: { ...userArgs, user: { detail: 'Owner', name: 'Ada Park' } },
  play: ({ canvasElement }) => {
    const region = canvasElement.querySelector('[role="region"][aria-label="Account"]')
    if (!region?.textContent?.includes('Owner'))
      throw new Error('No user row in the Account region')
    if (region.querySelector('button'))
      throw new Error('A user row without menu actions renders a button')
  },
}

/* In the icon rail only the avatar shows; the name stays the button's accessible name. */
export const IconCollapsed: Story = {
  args: userArgs,
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('[data-sidebar="trigger"]')
    if (!(toggle instanceof HTMLElement)) throw new Error('No sidebar toggle')
    toggle.click()
    await wait(300)
    if (!canvasElement.querySelector('[data-collapsible="icon"]')) {
      throw new Error('The sidebar did not collapse to icons')
    }
    const trigger = canvasElement.querySelector(
      '[aria-label="Account"] button[aria-haspopup="menu"]'
    )
    const avatar = trigger?.querySelector('[data-slot="avatar"]')
    if (!trigger || !avatar) throw new Error('No avatar in the account menu button')
    if (avatar.getBoundingClientRect().width < 24)
      throw new Error('The avatar is hidden in the icon rail')
    const name = [...trigger.querySelectorAll('span')].find(el => el.textContent === 'Ada Park')
    if (!name || name.getBoundingClientRect().width > 1) {
      throw new Error('The name should be hidden visually in the icon rail')
    }
    if (
      trigger.getBoundingClientRect().right >
      (trigger.closest('[data-slot="sidebar-inner"]')?.getBoundingClientRect().right ?? 0)
    ) {
      throw new Error('The account menu button overflows the icon rail')
    }
  },
}

/* The top bar owns the top inset; the page wrapper the bottom one; both clear the inline insets. */
export const Phone: Story = {
  args,
  globals: phoneGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      'main > header': { paddingInlineStart: '47px', paddingTop: '29px' },
      'main > header + div': {
        paddingBottom: '63px',
        paddingInlineStart: '47px',
        paddingTop: '32px',
      },
    }),
}

/*
 * On a phone the user row sits at the foot of the sheet the top-bar toggle
 * opens. The sheet stays open, so the capture shows it at the phone width.
 */
export const UserPhone: Story = {
  args: userArgs,
  globals: phoneGlobals,
  // The craft focus walk tabs through the open modal sheet and closes the test
  // browser; the shell's focus rings are walked in the other stories.
  parameters: { craft: { disable: ['focus-visible'] } },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('[data-sidebar="trigger"]')
    if (!(toggle instanceof HTMLElement)) throw new Error('No sidebar toggle')
    toggle.click()
    await wait(400)
    const sheet = document.querySelector('[data-mobile="true"]')
    const region = sheet?.querySelector('[role="region"][aria-label="Account"]')
    if (!region?.textContent?.includes('Ada Park'))
      throw new Error('No user row in the phone sidebar')
  },
}

/*
 * The account menu open, for its baseline. The menu renders in a portal,
 * outside the page's landmarks, as every popup does, so axe's region rule is
 * off for this story only.
 */
export const AccountMenuOpen: Story = {
  args: userArgs,
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: false },
          { id: 'label-content-name-mismatch', enabled: true },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[aria-label="Account"] button[aria-haspopup]')
    if (!(trigger instanceof HTMLElement)) throw new Error('No account menu button')
    trigger.click()
    await wait(300)
    if (!document.querySelector('[role="menu"]')) throw new Error('The account menu did not open')
  },
}

/* A navigation item under the pointer, beside the current one. */
export const NavHover: Story = {
  args: userArgs,
  parameters: { visualState: { hover: 'a[href="#invoices"]' } },
}

/* A navigation item with keyboard focus. */
export const NavFocusVisible: Story = {
  args: userArgs,
  parameters: { visualState: { focusVisible: 'a[href="#invoices"]' } },
}

/*
 * From `md` the rail sits at the inline start and owns that safe-area inset
 * (a landscape phone's notch): it pads its outer edge and the gap beside it
 * grows, so the top bar and the page clear only their usual spacing there.
 */
export const Tablet: Story = {
  args: userArgs,
  globals: tabletGlobals,
  play: ({ canvasElement }) => {
    checkSafeArea(canvasElement, {
      '[data-slot="sidebar-container"]': { paddingInlineStart: '47px' },
      'main > header': { paddingInlineStart: '16px', paddingTop: '29px' },
    })
  },
}

export const Wide: Story = { args: userArgs, globals: wideGlobals }

/*
 * On a touchscreen (a touch tablet here, and the phone sheet) every navigation
 * row is at least 44px tall, the row floor --a63-row-min-size sets.
 */
export const TouchTablet: Story = {
  args: userArgs,
  globals: tabletGlobals,
  render: props => (
    <UIProvider input="touch">
      <AppShell {...props} />
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const rows = [
      ...canvasElement.querySelectorAll<HTMLElement>('.a63-Sidebar-menu-button'),
    ]
    if (rows.length < 4)
      throw new Error(`Expected the nav rows and the user row, got ${rows.length}`)
    for (const row of rows) {
      const height = row.getBoundingClientRect().height
      if (height < 44)
        throw new Error(`"${row.textContent}" is ${height}px tall on touch, under 44px`)
    }
  },
}

/* A long product name, many items with one long label, and a long user. */
const longArgs = {
  ...userArgs,
  navItems: [
    ...args.navItems,
    {
      href: '#reconciliation',
      icon: <FileText aria-hidden />,
      label: 'Zahlungsabgleichsübersicht und Rechnungsfreigaben für alle Standorte',
    },
    ...Array.from({ length: 20 }, (_, index) => ({
      href: `#project-${index + 1}`,
      icon: <Folder aria-hidden />,
      label: `Project ${index + 1}`,
    })),
  ],
  productName: 'Tally Invoicing for Multi-Region Teams',
  user: {
    ...user,
    detail: 'alexandra.konstantinopoulou@finance.northwind-traders.example',
    name: 'Alexandra Konstantinopoulou-Whitfield',
  },
}

/*
 * Long strings truncate inside the sidebar instead of widening it, and the
 * navigation scrolls between the fixed header and footer, so the last item
 * stays reachable.
 */
function checkLongContent(root: ParentNode) {
  // The rail's inner box, or the phone sheet's.
  const inner = root.querySelector<HTMLElement>(
    '[data-slot="sidebar-inner"], .a63-Sidebar-mobile-inner'
  )
  const content = root.querySelector<HTMLElement>('[data-slot="sidebar-content"]')
  if (!inner || !content) throw new Error('Expected the sidebar and its content')
  if (inner.scrollWidth > inner.clientWidth + 1)
    throw new Error(`The sidebar overflows sideways (${inner.scrollWidth} > ${inner.clientWidth})`)
  const innerBox = inner.getBoundingClientRect()
  for (const element of inner.querySelectorAll<HTMLElement>('a, button, .truncate')) {
    const box = element.getBoundingClientRect()
    if (box.width > 0 && (box.left < innerBox.left - 1 || box.right > innerBox.right + 1))
      throw new Error(`"${element.textContent}" sticks out of the sidebar`)
  }
  if (getComputedStyle(content).overflowY !== 'auto')
    throw new Error('The sidebar content does not scroll')
  const last = content.querySelector<HTMLElement>('a[href="#project-20"]')
  if (!last) throw new Error('No last navigation item')
  last.scrollIntoView({ block: 'nearest' })
  const lastBox = last.getBoundingClientRect()
  const contentBox = content.getBoundingClientRect()
  content.scrollTop = 0
  if (lastBox.bottom > contentBox.bottom + 1)
    throw new Error('The last navigation item cannot be scrolled into view')
}

export const LongContent: Story = {
  args: longArgs,
  play: ({ canvasElement }) => checkLongContent(canvasElement),
}

/* The same strings in the phone sheet, which the top-bar toggle opens. */
export const LongContentPhone: Story = {
  args: longArgs,
  globals: phoneGlobals,
  parameters: { craft: { disable: ['focus-visible'] } },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('[data-sidebar="trigger"]')
    if (!(toggle instanceof HTMLElement)) throw new Error('No sidebar toggle')
    toggle.click()
    await wait(400)
    const sheet = document.querySelector('[data-mobile="true"]')
    if (!sheet) throw new Error('The phone sidebar did not open')
    checkLongContent(sheet)
  },
}

/*
 * Right-to-left: the rail moves to the right, the gap that reserves its width
 * mirrors with it, and the content starts beside the rail, not under it. The
 * shell's own strings come from `labels`.
 */
export const RightToLeft: Story = {
  args: {
    ...userArgs,
    labels: {
      account: 'الحساب',
      navigation: 'الرئيسية',
      sheetDescription: 'يعرض الشريط الجانبي',
      sheetTitle: 'الشريط الجانبي',
      toggle: 'تبديل الشريط الجانبي',
    },
    navItems: [
      {
        current: true,
        href: '#overview',
        icon: <LayoutDashboard aria-hidden />,
        label: 'نظرة عامة',
      },
      { href: '#invoices', icon: <FileText aria-hidden />, label: 'الفواتير' },
      { href: '#settings', icon: <Settings aria-hidden />, label: 'الإعدادات' },
    ],
    productName: 'تالي',
    user: { ...user, name: 'آدا بارك' },
  },
  render: props => (
    <UIProvider dir="rtl" lang="ar">
      <AppShell {...props} />
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const rail = canvasElement.querySelector('[data-slot="sidebar-container"]')
    const main = canvasElement.querySelector('main')
    if (!rail || !main) throw new Error('Expected the sidebar rail and the main landmark')
    const railBox = rail.getBoundingClientRect()
    const mainBox = main.getBoundingClientRect()
    if (Math.abs(railBox.right - document.documentElement.clientWidth) > 1)
      throw new Error('The rail is not at the right edge under RTL')
    if (mainBox.right > railBox.left + 1)
      throw new Error(
        `The rail (from ${railBox.left}px) covers the content (to ${mainBox.right}px)`
      )
    if (!canvasElement.querySelector('nav[aria-label="الرئيسية"]'))
      throw new Error('The navigation landmark does not take its label')
  },
}

export const Themes: Story = {
  args: userArgs,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix frame>
      <AppShell {...props} />
    </ThemeMatrix>
  ),
}
