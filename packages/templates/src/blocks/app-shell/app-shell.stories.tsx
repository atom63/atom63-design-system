import { Button, DropdownMenuItem, DropdownMenuSeparator } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileText, LayoutDashboard, Settings } from 'lucide-react'

import {
  checkSafeArea,
  landmarkParameters,
  phoneGlobals,
  ThemeMatrix,
  themeMatrixParameters,
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

/* On a phone the user row sits at the foot of the sheet the top-bar toggle opens. */
export const PhoneWithUser: Story = {
  args: userArgs,
  globals: phoneGlobals,
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('[data-sidebar="trigger"]')
    if (!(toggle instanceof HTMLElement)) throw new Error('No sidebar toggle')
    toggle.click()
    await wait(400)
    const sheet = document.querySelector('[data-mobile="true"]')
    const region = sheet?.querySelector('[role="region"][aria-label="Account"]')
    if (!region?.textContent?.includes('Ada Park'))
      throw new Error('No user row in the phone sidebar')
    region.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await wait(400)
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
