'use client'

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
      <TextTicker animationType="marquee" className="a63-SidebarNavTree-ticker">
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
          <TextTicker animationType="marquee" className="a63-SidebarNavTree-ticker-inner">
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
}

function SidebarNavGroup({ children, className, label }: SidebarNavGroupProps): React.ReactElement {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="a63-SidebarNavTree-group-label">{label}</SidebarGroupLabel>
      <SidebarGroupContent className="a63-SidebarNavTree-group-content">
        <SidebarMenu className="a63-SidebarNavTree-list">{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export interface SidebarNavLinkItemProps {
  children: React.ReactElement
  className?: string
  isActive?: boolean
}

function SidebarNavLinkItem({
  children,
  className,
  isActive = false,
}: SidebarNavLinkItemProps): React.ReactElement {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn('a63-SidebarNavTree-item', className)}
        isActive={isActive}
        size="sm"
      >
        {withTickerLabel(children)}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export interface SidebarNavCollapsibleItemProps {
  children: React.ReactNode
  className?: string
  isActive?: boolean
  label: string
  /** Destination for the section itself. Omit it when the section has no page: the whole row becomes the toggle. */
  link?: React.ReactElement
  onOpenChange: (open: boolean) => void
  open: boolean
}

function SidebarNavCollapsibleItem({
  children,
  className,
  isActive = false,
  label,
  link,
  onOpenChange,
  open,
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
              />
            }
            type="button"
          >
            <TextTicker animationType="marquee" className="a63-SidebarNavTree-ticker">
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
}

function SidebarNavSubLinkItem({
  children,
  className,
  isActive = false,
}: SidebarNavSubLinkItemProps): React.ReactElement {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        className={cn('a63-SidebarNavTree-item', className)}
        isActive={isActive}
        size="sm"
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
