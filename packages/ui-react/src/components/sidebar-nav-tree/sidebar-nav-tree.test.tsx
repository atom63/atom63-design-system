import { render } from '@testing-library/react'
import * as React from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SidebarProvider } from '../sidebar'
import {
  SidebarNavCollapsibleItem,
  SidebarNavGroup,
  SidebarNavLinkItem,
  SidebarNavSubLinkItem,
  SidebarNavSubList,
} from './sidebar-nav-tree'

describe('SidebarNavTree', () => {
  it('renders a nav group with a link item wrapped in a menu button', () => {
    const { container, getByText, getAllByText } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Docs">
          <SidebarNavLinkItem isActive>
            <a href="/intro">Introduction</a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getByText('Docs')).toBeInTheDocument()
    const button = container.querySelector('[data-slot="sidebar-menu-button"]')
    expect(button).not.toBeNull()
    expect(button).toHaveClass('a63-SidebarNavTree-item')
    expect(button).toHaveAttribute('data-active', 'true')
    // Ticker-wrapped link label is present (TextTicker duplicates it for the marquee).
    expect(getAllByText('Introduction').length).toBeGreaterThan(0)
  })

  it('passes the active tone to the menu button: neutral by default, accent on request', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Docs">
          <SidebarNavLinkItem isActive>
            <a href="/intro">Introduction</a>
          </SidebarNavLinkItem>
          <SidebarNavLinkItem isActive tone="accent">
            <a href="/install">Installation</a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )
    const [neutral, accent] = container.querySelectorAll('[data-slot="sidebar-menu-button"]')
    expect(neutral).toHaveAttribute('data-tone', 'neutral')
    expect(accent).toHaveAttribute('data-tone', 'accent')
  })

  it('renders the anchor itself from href, icon and label props', () => {
    const { getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Workspace">
          <SidebarNavLinkItem href="#inbox" icon={<svg data-testid="inbox-icon" />} isActive>
            Inbox
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    const link = getByRole('link', { name: /Inbox/ })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '#inbox')
    expect(link).toHaveAttribute('data-slot', 'sidebar-menu-button')
    expect(link).toHaveAttribute('data-active', 'true')
    expect(link).toHaveClass('a63-SidebarNavTree-item')
    expect(link.firstElementChild).toHaveAttribute('data-testid', 'inbox-icon')
    expect(link).toHaveTextContent('Inbox')
  })

  it('renders a router link passed as render, with the merged props and ref', () => {
    const RouterLink = React.forwardRef<
      HTMLAnchorElement,
      React.ComponentProps<'a'> & { to: string }
    >(function RouterLink({ children, to, ...props }, ref) {
      return (
        <a ref={ref} href={to} {...props}>
          {children}
        </a>
      )
    })
    const ref = React.createRef<HTMLAnchorElement>()
    const { getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Workspace">
          <SidebarNavLinkItem icon={<svg />} render={<RouterLink ref={ref} to="/docs" />}>
            Documents
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    const link = getByRole('link', { name: /Documents/ })
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).toHaveAttribute('data-slot', 'sidebar-menu-button')
    expect(link).toHaveClass('a63-SidebarNavTree-item')
    expect(ref.current).toBe(link)
  })

  it('keeps the child-element form: the child anchor becomes the item', () => {
    const { getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Workspace">
          <SidebarNavLinkItem>
            <a href="#docs">
              <svg />
              <span>Documents</span>
            </a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    const link = getByRole('link', { name: 'Documents' })
    expect(link).toHaveAttribute('href', '#docs')
    expect(link).toHaveAttribute('data-slot', 'sidebar-menu-button')
    expect(link).toHaveClass('a63-SidebarNavTree-item')
  })

  it('renders a collapsible item with an expand toggle and a sub list', () => {
    const { getByLabelText, getAllByText } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Nav">
          <SidebarNavCollapsibleItem
            label="Projects"
            link={<a href="/projects">Projects</a>}
            onOpenChange={() => {}}
            open
          >
            <SidebarNavSubList>
              <SidebarNavSubLinkItem>
                <a href="/projects/a">Alpha</a>
              </SidebarNavSubLinkItem>
            </SidebarNavSubList>
          </SidebarNavCollapsibleItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getByLabelText('Collapse Projects')).toBeInTheDocument()
    expect(getAllByText('Alpha').length).toBeGreaterThan(0)
  })

  it('turns the whole row into a single toggle when the section has no link', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { getAllByRole, getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Nav">
          <SidebarNavCollapsibleItem label="Projects" onOpenChange={onOpenChange} open={false}>
            <SidebarNavSubList>
              <SidebarNavSubLinkItem>
                <a href="/projects/a">Alpha</a>
              </SidebarNavSubLinkItem>
            </SidebarNavSubList>
          </SidebarNavCollapsibleItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    expect(getAllByRole('button')).toHaveLength(1)

    const row = getByRole('button', { name: 'Projects' })
    expect(row).toHaveAttribute('aria-expanded', 'false')

    await user.click(row)
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
  })

  it('folds a collapsible group from its label button', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup collapsible label="Workspace">
          <SidebarNavLinkItem>
            <a href="/inbox">Inbox</a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )

    const label = getByRole('button', { name: 'Workspace' })
    expect(label).toHaveAttribute('aria-expanded', 'true')
    expect(getByRole('link', { name: 'Inbox' })).toBeInTheDocument()

    await user.click(label)
    expect(label).toHaveAttribute('aria-expanded', 'false')
    expect(queryByRole('link', { name: 'Inbox' })).toBeNull()
  })

  it('reports a controlled group toggle and starts closed when asked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup collapsible label="Try" onOpenChange={onOpenChange} open={false}>
          <SidebarNavLinkItem>
            <a href="/import">Import</a>
          </SidebarNavLinkItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )
    const label = getByRole('button', { name: 'Try' })
    expect(label).toHaveAttribute('aria-expanded', 'false')
    await user.click(label)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('draws an icon before the label of a trigger-only section', () => {
    const { getByRole } = render(
      <SidebarProvider>
        <SidebarNavGroup label="Nav">
          <SidebarNavCollapsibleItem
            icon={<svg data-testid="section-icon" />}
            label="Payments"
            onOpenChange={() => {}}
            open={false}
          >
            <SidebarNavSubList>
              <SidebarNavSubLinkItem>
                <a href="/t">Transactions</a>
              </SidebarNavSubLinkItem>
            </SidebarNavSubList>
          </SidebarNavCollapsibleItem>
        </SidebarNavGroup>
      </SidebarProvider>
    )
    const row = getByRole('button', { name: 'Payments' })
    expect(row.querySelector('[data-testid="section-icon"]')).not.toBeNull()
  })
})
