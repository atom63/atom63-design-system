import { type AppViewChrome, type AppViewLayout, appViewContract } from '@atom63/ui-foundation'
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
  /** A side panel beside the main region, hidden on phones. */
  panel?: React.ReactNode
  /** The accessible name of the side panel. */
  panelLabel?: string
  /**
   * Content floating over the main region, anchored to its bottom end and
   * above the docked bar, such as a scroll-to-bottom button. It does not scroll.
   */
  overlay?: React.ReactNode
  /** A bar docked at the bottom, such as a player, a status bar or an action bar. */
  bottomBar?: React.ReactNode
  /** The accessible name of the docked bar's region. */
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
  bottomBar,
  bottomBarLabel = 'Player',
  children,
  chrome = appViewContract.defaultChrome,
  className,
  layout = appViewContract.defaultLayout,
  overlay,
  panel,
  panelLabel = 'Library',
  tabBar,
  topBar,
  ...props
}: AppViewProps): React.ReactElement {
  const bottomInset = tabBar ? 'tab-bar' : bottomBar ? 'bottom-bar' : 'main'
  return (
    <div
      className={cn('a63-AppView', className)}
      data-a63-form-factor={layout === 'phone' ? 'phone' : undefined}
      data-bottom-inset={bottomInset}
      data-chrome={layout === 'phone' ? 'flush' : chrome}
      data-layout={layout}
      data-slot="app-view"
      {...props}
    >
      {topBar ? <header data-slot="app-view-top-bar">{topBar}</header> : null}
      <div data-slot="app-view-body">
        {panel && layout === 'window' ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it.
          <aside aria-label={panelLabel} data-slot="app-view-panel" tabIndex={0}>
            {panel}
          </aside>
        ) : null}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll region takes focus so a keyboard can scroll it. */}
        <main data-slot="app-view-main" tabIndex={0}>
          {children}
        </main>
        {overlay ? <div data-slot="app-view-overlay">{overlay}</div> : null}
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
