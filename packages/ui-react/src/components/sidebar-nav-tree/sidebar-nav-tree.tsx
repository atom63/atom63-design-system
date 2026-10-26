'use client'

import { type SidebarNavTreeTone, sidebarNavTreeContract } from '@atom63/ui-foundation'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../sidebar'
import { TextTicker } from '../text-ticker'

/*
 * SidebarNavTree — an opinionated navigation tree built on the Sidebar parts.
 * Faithful port of prod @atom63/ui sidebar-nav-tree.tsx: same five parts
 * (NavGroup / NavLinkItem / NavCollapsibleItem / NavSubLinkItem / NavSubList),
 * the same withTickerLabel marquee wrapping, and the same collapsible expand row.
 * ChevronDown supplies the disclosure glyph; the Tailwind utility strings
 * become `.a63-SidebarNavTree-*` recipe classes.
 */

function withTickerLabel(element: React.ReactElement): React.ReactElement {
  const props = element.props as { children?: React.ReactNode }
  const label = props.children

  if (typeof label === 'string') {
    return React.cloneElement(
      element,
      undefined,
      <TextTicker variant="marquee" className="a63-SidebarNavTree-ticker">
        {label}
      </TextTicker>
    )
  }

  const children = React.Children.toArray(label)
  const [firstChild, ...restChildren] = children

  if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(firstChild)) {
    const firstChildProps = firstChild.props as {
      children: string
      className?: string
    }

    if (typeof firstChildProps.children !== 'string') {
      return element
    }

    return React.cloneElement(
      element,
      undefined,
      React.cloneElement(firstChild, {
        className: cn(firstChildProps.className, 'a63-SidebarNavTree-ticker'),
        children: (
          <TextTicker variant="marquee" className="a63-SidebarNavTree-ticker-inner">
            {firstChildProps.children}
          </TextTicker>
        ),
      }),
      ...restChildren
    )
  }

  return element
}

export interface SidebarNavGroupProps {
  children: React.ReactNode
  className?: string
  label: React.ReactNode
  /** Lets the label fold the group: it becomes a disclosure button with a chevron. */
  collapsible?: boolean
  /** Whether a collapsible group starts open when uncontrolled. */
  defaultOpen?: boolean
  /** Open state of a controlled collapsible group. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SidebarNavGroup({
  children,
  className,
  label,
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
}: SidebarNavGroupProps): React.ReactElement {
  const content = (
    <SidebarGroupContent className="a63-SidebarNavTree-group-content">
      <SidebarMenu className="a63-SidebarNavTree-list">{children}</SidebarMenu>
    </SidebarGroupContent>
  )

  if (!collapsible) {
    return (
      <SidebarGroup className={className}>
        <SidebarGroupLabel className="a63-SidebarNavTree-group-label">{label}</SidebarGroupLabel>
        {content}
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className={className}>
      <Collapsible
        defaultOpen={open === undefined ? defaultOpen : undefined}
        onOpenChange={onOpenChange ? next => onOpenChange(next) : undefined}
        open={open}
      >
        {/* A native button styled as the group label, so the fold is keyboard
            reachable and announces its expanded state. */}
        <CollapsibleTrigger
          className="a63-Sidebar-group-label a63-SidebarNavTree-group-label a63-SidebarNavTree-group-trigger"
          data-sidebar="group-label"
          data-slot="sidebar-group-label"
          type="button"
        >
          {label}
          <ChevronDown aria-hidden="true" className="a63-SidebarNavTree-chevron" />
        </CollapsibleTrigger>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  )
}

export interface SidebarNavLinkItemProps {
  /**
   * The label when `href` or `render` is set. Otherwise the link element itself
   * (`<a href>…</a>`): the item merges its class, data attributes and ref into it,
   * so a custom link component must spread the props it receives onto the element
   * it renders and forward its ref.
   */
  children: React.ReactNode
  className?: string
  /** Destination of the link. The item renders the anchor, with `icon` and the label inside. */
  href?: string
  /** An icon before the label, used with `href` or `render`. */
  icon?: React.ReactNode
  isActive?: boolean
  /**
   * A link element to render instead of `<a>`, such as a router link
   * (`<Link to="/inbox" />`). The item passes it the icon and label as children.
   * It must spread the props it receives and forward its ref.
   */
  render?: React.ReactElement
  /**
   * How the active row is coloured: `neutral` (the default) is a full neutral
   * plate with primary text, `accent` is accent text on a clear row.
   */
  tone?: SidebarNavTreeTone
}

function SidebarNavLinkItem({
  children,
  className,
  href,
  icon,
  isActive = false,
  render,
  tone = sidebarNavTreeContract.defaultTone,
}: SidebarNavLinkItemProps): React.ReactElement {
  const label =
    typeof children === 'string' ? (
      <TextTicker variant="marquee" className="a63-SidebarNavTree-ticker">
        {children}
      </TextTicker>
    ) : (
      <span>{children}</span>
    )

  let link: React.ReactElement
  if (render) {
    link = React.cloneElement(
      render as React.ReactElement<{ href?: string }>,
      href === undefined ? undefined : { href },
      icon,
      label
    )
  } else if (href !== undefined) {
    link = (
      <a href={href}>
        {icon}
        {label}
      </a>
    )
  } else {
    link = withTickerLabel(children as React.ReactElement)
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn('a63-SidebarNavTree-item', className)}
        isActive={isActive}
        size="sm"
        tone={tone}
      >
        {link}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export interface SidebarNavCollapsibleItemProps {
  children: React.ReactNode
  className?: string
  /** An icon before the label on a trigger-only row. With `link`, put the icon inside the link. */
  icon?: React.ReactNode
  isActive?: boolean
  label: string
  /** Destination for the section itself. Omit it when the section has no page: the whole row becomes the toggle. */
  link?: React.ReactElement
  onOpenChange: (open: boolean) => void
  open: boolean
  /**
   * How the active row is coloured: `neutral` (the default) is a full neutral
   * plate with primary text, `accent` is accent text on a clear row.
   */
  tone?: SidebarNavTreeTone
}

function SidebarNavCollapsibleItem({
  children,
  className,
  icon,
  isActive = false,
  label,
  link,
  onOpenChange,
  open,
  tone = sidebarNavTreeContract.defaultTone,
}: SidebarNavCollapsibleItemProps): React.ReactElement {
  const chevron = (
    <ChevronDown
      aria-hidden="true"
      className={cn('a63-SidebarNavTree-chevron', open && 'a63-SidebarNavTree-chevron--open')}
    />
  )

  return (
    <SidebarMenuItem className={className}>
      <Collapsible onOpenChange={onOpenChange} open={open}>
        {link ? (
          <div className="a63-SidebarNavTree-row">
            <SidebarMenuButton
              asChild
              className={cn('a63-SidebarNavTree-item', 'a63-SidebarNavTree-row-item')}
              isActive={isActive}
              size="sm"
              tone={tone}
            >
              {withTickerLabel(link)}
            </SidebarMenuButton>
            <CollapsibleTrigger
              aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`}
              className="a63-SidebarNavTree-toggle"
              type="button"
            >
              {chevron}
            </CollapsibleTrigger>
          </div>
        ) : (
          <CollapsibleTrigger
            render={
              <SidebarMenuButton
                className={cn('a63-SidebarNavTree-item', 'a63-SidebarNavTree-row-trigger')}
                isActive={isActive}
                size="sm"
                tone={tone}
              />
            }
            type="button"
          >
            {icon}
            <TextTicker variant="marquee" className="a63-SidebarNavTree-ticker">
              {label}
            </TextTicker>
            {chevron}
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

export interface SidebarNavSubLinkItemProps {
  children: React.ReactElement
  className?: string
  isActive?: boolean
  /**
   * How the active row is coloured: `neutral` (the default) is a full neutral
   * plate with primary text, `accent` is accent text on a clear row.
   */
  tone?: SidebarNavTreeTone
}

function SidebarNavSubLinkItem({
  children,
  className,
  isActive = false,
  tone = sidebarNavTreeContract.defaultTone,
}: SidebarNavSubLinkItemProps): React.ReactElement {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        className={cn('a63-SidebarNavTree-item', className)}
        isActive={isActive}
        size="sm"
        tone={tone}
      >
        {withTickerLabel(children)}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

export interface SidebarNavSubListProps {
  children: React.ReactNode
  className?: string
}

function SidebarNavSubList({ children, className }: SidebarNavSubListProps): React.ReactElement {
  return (
    <SidebarMenuSub className={cn('a63-SidebarNavTree-sub-list', className)}>
      {children}
    </SidebarMenuSub>
  )
}

export {
  SidebarNavCollapsibleItem,
  SidebarNavGroup,
  SidebarNavLinkItem,
  SidebarNavSubLinkItem,
  SidebarNavSubList,
}
