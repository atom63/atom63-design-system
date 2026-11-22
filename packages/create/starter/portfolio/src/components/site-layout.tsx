import { PortalContainerProvider } from '@atom63/ui-react'
import { lazy, type ReactNode, Suspense, useState } from 'react'

import { AssistantProvider } from '../modules/assistant/assistant'
import { isOn, portfolio } from '../portfolio.config'
import { type NavItem, SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

const Dock = lazy(() => import('../modules/dock/dock').then(module => ({ default: module.Dock })))

const nav: NavItem[] = [
  { label: 'Projects', to: '/projects' },
  { label: 'Writing', to: '/writing' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Resume', to: '/resume' },
  ...(isOn('slides') ? [{ label: 'Slides', to: '/slides' }] : []),
]

/*
 * The frame around every page. It stamps the creative axes from
 * portfolio.config.ts (brand, surface, radius, font) so every component and
 * token below follows them, and gives overlays (menus, sheets) a container
 * inside that frame so they follow them too.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)
  const { brand, font, radius, surface } = portfolio.appearance

  const page = (
    <>
      <SiteHeader nav={nav} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      {isOn('dock') ? (
        <Suspense fallback={null}>
          <Dock />
        </Suspense>
      ) : null}
    </>
  )

  return (
    <div
      // With the dock on, the page ends above it.
      className={`portfolio-root bg-background text-foreground flex min-h-screen flex-col ${isOn('dock') ? 'pb-24' : ''}`}
      data-a63-brand={brand}
      data-a63-font={font}
      data-a63-radius={radius}
      data-a63-surface={surface}
    >
      <PortalContainerProvider container={portal}>
        {isOn('assistant') ? <AssistantProvider>{page}</AssistantProvider> : page}
      </PortalContainerProvider>
      <div ref={setPortal} />
    </div>
  )
}
