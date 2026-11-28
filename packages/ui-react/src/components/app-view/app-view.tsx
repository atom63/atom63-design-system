import {
  type AppViewChrome,
  type AppViewLayout,
  type AppViewTopBarSpan,
  appViewContract,
} from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AppViewProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The main region; it is the only part that scrolls. */
  children: React.ReactNode
  /**
   * `window` (the default): a desktop window, the side panel from `md` up and
   * the tab bar on narrow screens only. `phone`: a phone app screen, edge to
   * edge, with no side panel and the tab bar always shown. It stamps
   * `data-a63-form-factor="phone"`, which sets phone-sized type and controls
   * (body 17px, 44px controls) for everything inside.
   */
  layout?: AppViewLayout
  /**
   * How a `window` is drawn. `inset` (the default): a padded window with the
   * side panel and the main region on rounded cards. `flush`: columns to the
   * window edges, split by borders. `phone` is always flush.
   */
  chrome?: AppViewChrome
  /** The bar across the top. It takes the top safe-area inset. */
  topBar?: React.ReactNode
  /**
   * Where the top bar runs in a `window`. `window` (the default): across the
   * whole window. `main`: over the main region and the aside only, so the rail
   * and the panel run the full height of the window.
   */
  topBarSpan?: AppViewTopBarSpan
  /** A narrow column before the side panel, such as an icon rail; from `md` up, windows only. */
  rail?: React.ReactNode
  /** The accessible name of the rail. Defaults to "Navigation". */
  railLabel?: string
  /**
   * The rail's width as a CSS length (4rem by default). It sets
   * `--a63-app-view-rail-width`, which a stylesheet can set too.
   */
  railWidth?: string
  /** A side panel beside the main region, hidden on phones. */
  panel?: React.ReactNode
  /** The accessible name of the side panel. Defaults to "Sidebar"; name it after what it holds. */
  panelLabel?: string
  /**
   * The side panel's width as a CSS length, such as `'12.5rem'` (18rem by
   * default). It sets `--a63-app-view-panel-width`, which a stylesheet can set too.
   */
  panelWidth?: string
  /**
   * Content floating over the main region, anchored to its bottom end and
   * above the docked bar, such as a scroll-to-bottom button. It does not scroll.
   */
  overlay?: React.ReactNode
  /**
   * A column after the main region, such as a thread or a details pane; from
   * `lg` up, windows only. Below `lg` it is not shown, so show its content
   * another way there, such as in a Sheet.
   */
  aside?: React.ReactNode
  /** The accessible name of the aside. Defaults to "Details". */
  asideLabel?: string
  /**
   * The aside's width as a CSS length (22rem by default). It sets
   * `--a63-app-view-aside-width`, which a stylesheet can set too.
   */
  asideWidth?: string
  /** A bar docked at the bottom, such as a player, a status bar or an action bar. */
  bottomBar?: React.ReactNode
  /** The accessible name of the docked bar's region. Defaults to "Bottom bar"; name it after what it holds, such as "Player". */
  bottomBarLabel?: string
  /** Bottom navigation, such as the tab-bar block. It takes the bottom safe-area inset. */
  tabBar?: React.ReactNode
}

/*
 * The frame of a full-window product view. Only the main region scrolls, and
 * each safe-area inset has one owner: the top bar takes the top one (with no
 * top bar, the main region's first block pads itself, so a hero can run under
 * the status bar); the tab bar takes the bottom one, else the docked bar,
 * else the main region; the root takes the inline ones.
 * For a dense product view (a table, an inbox, an admin dashboard), wrap it
 * in <UIProvider density="compact">.
 */
export function AppView({
  aside,
  asideLabel = 'Details',
  asideWidth,
  bottomBar,
  bottomBarLabel = 'Bottom bar',
  children,
  chrome = appViewContract.defaultChrome,
  className,
  layout = appViewContract.defaultLayout,
  overlay,
  panel,
  panelLabel = 'Sidebar',
  panelWidth,
  rail,
  railLabel = 'Navigation',
  railWidth,
  style,
  tabBar,
  topBar,
  topBarSpan = appViewContract.defaultTopBarSpan,
  ...props
}: AppViewProps): React.ReactElement {
  const bottomInset = tabBar ? 'tab-bar' : bottomBar ? 'bottom-bar' : 'main'
  const isWindow = layout === 'window'
  const spansMain = isWindow && topBarSpan === 'main'
  const widths = {
    ...(panelWidth ? { '--a63-app-view-panel-width': panelWidth } : {}),
    ...(railWidth ? { '--a63-app-view-rail-width': railWidth } : {}),
    ...(asideWidth ? { '--a63-app-view-aside-width': asideWidth } : {}),
  }
  const header = topBar ? <header data-slot="app-view-top-bar">{topBar}</header> : null
  const content = (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it. */}
      <main data-slot="app-view-main" tabIndex={0}>
        {children}
      </main>
      {overlay ? <div data-slot="app-view-overlay">{overlay}</div> : null}
      {aside && isWindow ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it.
        <aside aria-label={asideLabel} data-slot="app-view-aside" tabIndex={0}>
          {aside}
        </aside>
      ) : null}
    </>
  )
  return (
    <div
      className={cn('a63-AppView', className)}
      data-a63-form-factor={layout === 'phone' ? 'phone' : undefined}
      data-aside={aside && isWindow ? '' : undefined}
      data-bottom-inset={bottomInset}
      data-chrome={layout === 'phone' ? 'flush' : chrome}
      data-layout={layout}
      data-slot="app-view"
      data-top-bar-span={isWindow ? topBarSpan : undefined}
      style={Object.keys(widths).length ? { ...widths, ...style } : style}
      {...props}
    >
      {spansMain ? null : header}
      <div data-slot="app-view-body">
        {rail && isWindow ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it.
          <aside aria-label={railLabel} data-slot="app-view-rail" tabIndex={0}>
            {rail}
          </aside>
        ) : null}
        {panel && isWindow ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it.
          <aside aria-label={panelLabel} data-slot="app-view-panel" tabIndex={0}>
            {panel}
          </aside>
        ) : null}
        {spansMain ? (
          <div data-slot="app-view-content">
            {header}
            <div data-slot="app-view-body">{content}</div>
          </div>
        ) : (
          content
        )}
      </div>
      {bottomBar ? (
        <section aria-label={bottomBarLabel} data-slot="app-view-bottom-bar">
          {bottomBar}
        </section>
      ) : null}
      {tabBar ? <div data-slot="app-view-tab-bar">{tabBar}</div> : null}
    </div>
  )
}
