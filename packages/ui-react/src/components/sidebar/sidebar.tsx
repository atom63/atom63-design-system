'use client'

import {
  type SidebarCollapsible,
  type SidebarMenuButtonSize,
  type SidebarMenuButtonVariant,
  type SidebarMenuSubButtonSize,
  type SidebarSide,
  type SidebarState,
  type SidebarVariant,
  sidebarContract,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { PanelLeft } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import { Input } from '../input'
import { Separator } from '../separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../sheet'
import { Skeleton } from '../skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'

/*
 * Sidebar — a collapsible app-shell navigation panel. Faithful port of prod
 * @atom63/ui sidebar.tsx: every part (Provider/Trigger/Rail/Inset/Input/Header/
 * Footer/Content/Group/GroupLabel/GroupAction/GroupContent/Menu/MenuItem/
 * MenuButton/MenuAction/MenuBadge/MenuSkeleton/MenuSub/MenuSubItem/MenuSubButton/
 * Separator) + the useSidebar hook survive, and so does the behavior: cookie
 * persistence, the Cmd/Ctrl-B keyboard shortcut, and the mobile Sheet drawer.
 *
 * Chrome is restyled from Tailwind/shadcn utilities to `.a63-Sidebar-*` recipe
 * classes reading --a63-* tokens (see sidebar.css). The prod shadcn slot helper
 * (asChild) is preserved via a resolveRender shim over Base UI's native `render`.
 */

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const MOBILE_BREAKPOINT = 768

/* Inlined from prod @atom63/ui use-is-mobile — a 768px matchMedia hook. Kept
 * local so Sidebar stays self-contained (the DS has no shared hooks barrel). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

function resolveRender(
  asChild: boolean | undefined,
  render: useRender.ComponentProps<'button'>['render'],
  children: React.ReactNode
): useRender.ComponentProps<'button'>['render'] {
  if (render) {
    return render
  }
  if (asChild && React.isValidElement(children)) {
    return children
  }
  return undefined
}

export type SidebarContextProps = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

export type SidebarProviderProps = React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps): React.ReactElement {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // eslint-disable-next-line react-compiler/react-compiler -- Sidebar preference persists at the user-action boundary.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(o => !o) : setOpen(o => !o)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state: SidebarState = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn('a63-Sidebar-wrapper', className)}
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export type SidebarProps = React.ComponentProps<'div'> & {
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  dir?: React.ComponentProps<typeof SheetContent>['dir']
}

function Sidebar({
  side = sidebarContract.defaultSide,
  variant = sidebarContract.defaultVariant,
  collapsible = sidebarContract.defaultCollapsible,
  className,
  children,
  dir,
  ...props
}: SidebarProps): React.ReactElement {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        className={cn('a63-Sidebar', 'a63-Sidebar--static', className)}
        data-collapsible="none"
        data-side={side}
        data-slot="sidebar"
        data-state="expanded"
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet onOpenChange={setOpenMobile} open={openMobile} {...props}>
        <SheetContent
          className="a63-Sidebar-mobile"
          data-mobile="true"
          data-sidebar="sidebar"
          data-slot="sidebar"
          dir={dir}
          showCloseButton={false}
          side={side}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
        >
          <SheetHeader className="a63-Sidebar-sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="a63-Sidebar-mobile-inner">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="a63-Sidebar-root"
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
      data-slot="sidebar"
      data-state={state}
      data-variant={variant}
    >
      <div className="a63-Sidebar-gap" data-slot="sidebar-gap" />
      <div
        className={cn('a63-Sidebar-container', className)}
        data-side={side}
        data-slot="sidebar-container"
        {...props}
      >
        <div className="a63-Sidebar-inner" data-sidebar="sidebar" data-slot="sidebar-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      className={cn('a63-Sidebar-trigger', className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={event => {
        onClick?.(event)
        if (!event.defaultPrevented) toggleSidebar()
      }}
      size="icon-sm"
      variant="ghost"
      {...props}
    >
      <PanelLeft aria-hidden="true" />
      <span className="a63-Sidebar-sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>): React.ReactElement {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      aria-label="Toggle Sidebar"
      className={cn('a63-Sidebar-rail', className)}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      tabIndex={-1}
      title="Toggle Sidebar"
      type="button"
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>): React.ReactElement {
  return (
    <main className={cn('a63-Sidebar-inset', className)} data-slot="sidebar-inset" {...props} />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>): React.ReactElement {
  return (
    <Input
      className={cn('a63-Sidebar-input', className)}
      data-sidebar="input"
      data-slot="sidebar-input"
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-header', className)}
      data-sidebar="header"
      data-slot="sidebar-header"
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-footer', className)}
      data-sidebar="footer"
      data-slot="sidebar-footer"
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={cn('a63-Sidebar-separator', className)}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-content', className)}
      data-sidebar="content"
      data-slot="sidebar-content"
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-group', className)}
      data-sidebar="group"
      data-slot="sidebar-group"
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  render: renderProp,
  children,
  ...props
}: useRender.ComponentProps<'div'> &
  React.ComponentProps<'div'> & {
    asChild?: boolean
  }): React.ReactElement {
  const render = resolveRender(asChild, renderProp, children)

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn('a63-Sidebar-group-label', className),
        'data-sidebar': 'group-label',
        'data-slot': 'sidebar-group-label',
        children: render ? undefined : children,
      } as React.ComponentProps<'div'>,
      props
    ),
    render,
    state: {
      slot: 'sidebar-group-label',
      sidebar: 'group-label',
    },
  })
}

function SidebarGroupAction({
  className,
  asChild = false,
  render: renderProp,
  children,
  ...props
}: useRender.ComponentProps<'button'> &
  React.ComponentProps<'button'> & {
    asChild?: boolean
  }): React.ReactElement {
  const render = resolveRender(asChild, renderProp, children)

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn('a63-Sidebar-group-action', className),
        'data-sidebar': 'group-action',
        'data-slot': 'sidebar-group-action',
        children: render ? undefined : children,
        type: 'button',
      } as React.ComponentProps<'button'>,
      props
    ),
    render,
    state: {
      slot: 'sidebar-group-action',
      sidebar: 'group-action',
    },
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-group-content', className)}
      data-sidebar="group-content"
      data-slot="sidebar-group-content"
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>): React.ReactElement {
  return (
    <ul
      className={cn('a63-Sidebar-menu', className)}
      data-sidebar="menu"
      data-slot="sidebar-menu"
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>): React.ReactElement {
  return (
    <li
      className={cn('a63-Sidebar-menu-item', className)}
      data-sidebar="menu-item"
      data-slot="sidebar-menu-item"
      {...props}
    />
  )
}

export type SidebarMenuButtonProps = useRender.ComponentProps<'button'> &
  React.ComponentProps<'button'> & {
    asChild?: boolean
    isActive?: boolean
    variant?: SidebarMenuButtonVariant
    size?: SidebarMenuButtonSize
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }

function SidebarMenuButton({
  asChild = false,
  render: renderProp,
  children,
  isActive = false,
  variant = sidebarContract.defaultMenuButtonVariant,
  size = sidebarContract.defaultMenuButtonSize,
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps): React.ReactElement {
  const { isMobile, state } = useSidebar()
  const resolvedRender = resolveRender(asChild, renderProp, children)

  const button = useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn('a63-Sidebar-menu-button', className),
        'data-active': isActive,
        'data-sidebar': 'menu-button',
        'data-size': size,
        'data-slot': 'sidebar-menu-button',
        'data-variant': variant,
        children: resolvedRender ? undefined : children,
        type: 'button',
      } as React.ComponentProps<'button'>,
      props
    ),
    render: resolvedRender,
    state: {
      slot: 'sidebar-menu-button',
      sidebar: 'menu-button',
      size,
      active: isActive,
    },
  })

  if (!tooltip) {
    return button
  }

  let tooltipProps: React.ComponentProps<typeof TooltipContent>
  if (typeof tooltip === 'string') {
    tooltipProps = {
      children: tooltip,
    }
  } else {
    tooltipProps = tooltip
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        side="right"
        {...tooltipProps}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  render: renderProp,
  children,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<'button'> &
  React.ComponentProps<'button'> & {
    asChild?: boolean
    showOnHover?: boolean
  }): React.ReactElement {
  const render = resolveRender(asChild, renderProp, children)

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        className: cn(
          'a63-Sidebar-menu-action',
          showOnHover && 'a63-Sidebar-menu-action--hover',
          className
        ),
        'data-sidebar': 'menu-action',
        'data-slot': 'sidebar-menu-action',
        children: render ? undefined : children,
        type: 'button',
      } as React.ComponentProps<'button'>,
      props
    ),
    render,
    state: {
      slot: 'sidebar-menu-action',
      sidebar: 'menu-action',
    },
  })
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Sidebar-menu-badge', className)}
      data-sidebar="menu-badge"
      data-slot="sidebar-menu-badge"
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean
}): React.ReactElement {
  const id = React.useId()
  const width = React.useMemo(() => {
    const hash = Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0)
    return `${50 + (hash % 40)}%`
  }, [id])

  return (
    <div
      className={cn('a63-Sidebar-menu-skeleton', className)}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
      {...props}
    >
      {showIcon && (
        <Skeleton className="a63-Sidebar-menu-skeleton-icon" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="a63-Sidebar-menu-skeleton-text"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>): React.ReactElement {
  return (
    <ul
      className={cn('a63-Sidebar-menu-sub', className)}
      data-sidebar="menu-sub"
      data-slot="sidebar-menu-sub"
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>): React.ReactElement {
  return (
    <li
      className={cn('a63-Sidebar-menu-sub-item', className)}
      data-sidebar="menu-sub-item"
      data-slot="sidebar-menu-sub-item"
      {...props}
    />
  )
}

export type SidebarMenuSubButtonProps = useRender.ComponentProps<'a'> &
  React.ComponentProps<'a'> & {
    asChild?: boolean
    size?: SidebarMenuSubButtonSize
    isActive?: boolean
  }

function SidebarMenuSubButton({
  asChild = false,
  render: renderProp,
  children,
  size = sidebarContract.defaultMenuSubButtonSize,
  isActive = false,
  className,
  ...props
}: SidebarMenuSubButtonProps): React.ReactElement {
  const render = resolveRender(asChild, renderProp, children)

  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn('a63-Sidebar-menu-sub-button', className),
        'data-active': isActive,
        'data-sidebar': 'menu-sub-button',
        'data-size': size,
        'data-slot': 'sidebar-menu-sub-button',
        children: render ? undefined : children,
      } as React.ComponentProps<'a'>,
      props
    ),
    render,
    state: {
      slot: 'sidebar-menu-sub-button',
      sidebar: 'menu-sub-button',
      size,
      active: isActive,
    },
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
