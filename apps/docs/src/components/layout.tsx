import { AppLogo } from '../brand'
import { Button, ScrollArea, SidebarInset, SidebarProvider, useSidebar } from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { Link } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  DOC_NAV_DOMAIN_IDS,
  DOC_NAV_DOMAINS,
  type DocAreaId,
  navDomainForArea,
} from '../lib/doc-pages'
import { pathForDoc } from '../lib/doc-routing'
import { useDocScrollRestoration } from '../lib/use-doc-scroll-restoration'
import { useTheme } from '../theme'
import { DesignSystemAppearanceMenu } from './appearance/design-system-appearance-menu'
import { DocsSearch } from './docs-search'
import { NavSidebar } from './nav-sidebar'

type LayoutProps = {
  activeArea: DocAreaId
  children: ReactNode
  activeSection?: string
  sidebar?: ReactNode
}

export function Layout({ activeArea, children, activeSection, sidebar }: LayoutProps) {
  const { theme, toggle } = useTheme()
  const activeDomain = navDomainForArea(activeArea)
  const scrollKey = pathForDoc(activeArea, activeSection)

  useDocScrollRestoration(scrollKey)

  return (
    <div className="docs-shell bg-background text-foreground h-dvh overflow-hidden [--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex h-full overflow-hidden" defaultOpen>
        <a
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm"
          href="#design-system-main"
        >
          Skip to content
        </a>
        <Container className="docs-frame h-full flex-1 gap-0" maxWidth="fluid" padding="none">
          <header className="docs-header h-(--header-height) shrink-0">
            <Container
              className="docs-header-frame h-full flex-row items-center gap-0 px-4 md:px-2"
              maxWidth="wider"
              padding="none"
            >
              <Link
                aria-label="Atom63 design system home"
                className="group focus-visible:ring-ring focus-visible:ring-offset-background flex size-11 shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:size-9"
                to="/"
              >
                <AppLogo
                  className="text-foreground transition-opacity duration-150 group-hover:opacity-80 motion-reduce:transition-none"
                  height={24}
                  variant="symbol"
                />
              </Link>

              <nav
                aria-label="Documentation sections"
                className="ml-1 hidden scrollbar-none items-center gap-1 overflow-x-auto md:flex"
              >
                {DOC_NAV_DOMAIN_IDS.map(domainId => {
                  const domain = DOC_NAV_DOMAINS[domainId]
                  const isActive = activeDomain === domainId

                  return (
                    <HeaderNavLink
                      isActive={isActive}
                      key={domainId}
                      to={pathForDoc(domain.defaultArea)}
                    >
                      {domain.label}
                    </HeaderNavLink>
                  )
                })}
              </nav>

              <div className="min-w-0 flex-1" />

              <div className="flex shrink-0 items-center gap-[var(--a63-space-1)]">
                <DocsSearch />
                <Button
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="size-11 lg:size-9"
                  onClick={toggle}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
                </Button>
                <DocsSidebarToggle />
              </div>
            </Container>
          </header>

          <div className="docs-body flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <ScrollArea
              className="docs-body-scroll min-h-0 min-w-0 flex-1"
              showScrollbarOnHover
              viewportClassName="docs-body-scroll-viewport overflow-x-hidden overscroll-contain"
              viewportProps={{
                'data-mdx-scroll-root': '',
                'data-scroll-restoration-id': 'docs-body',
              }}
            >
              <Container
                className="docs-workspace relative min-h-full gap-0"
                maxWidth="wider"
                padding="none"
              >
                {sidebar ?? <NavSidebar activeArea={activeArea} activeSection={activeSection} />}
                <SidebarInset
                  className="docs-reading-canvas min-h-full min-w-0 overflow-visible"
                  id="design-system-main"
                  tabIndex={-1}
                >
                  {children}
                </SidebarInset>
              </Container>
            </ScrollArea>
          </div>
        </Container>
        <DesignSystemAppearanceMenu />
      </SidebarProvider>
    </div>
  )
}

function HeaderNavLink({
  children,
  isActive,
  to,
}: {
  children: ReactNode
  isActive: boolean
  to: string
}) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className="docs-header-nav-link focus-visible:ring-ring focus-visible:ring-offset-background text-muted-foreground hover:text-foreground relative flex h-11 items-center rounded-sm px-2.5 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none lg:h-9 lg:px-2"
      data-active={isActive || undefined}
      to={to}
    >
      {children}
    </Link>
  )
}

function DocsSidebarToggle() {
  const { openMobile, toggleSidebar } = useSidebar()

  return (
    <Button
      aria-expanded={openMobile}
      aria-label="Toggle navigation"
      className="size-11 shrink-0 md:hidden"
      onClick={toggleSidebar}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <AnimatedHamburgerIcon open={openMobile} />
    </Button>
  )
}

function AnimatedHamburgerIcon({ open }: { open: boolean }) {
  const lineClassName =
    'absolute left-0 h-px w-4 rounded-full bg-current transition-transform duration-150 ease-out motion-reduce:transition-none'

  return (
    <span aria-hidden className="relative block size-4">
      <span
        className={`${lineClassName} ${open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[3px]'}`}
      />
      <span
        className={`${lineClassName} top-1/2 -translate-y-1/2 ${
          open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
        }`}
      />
      <span
        className={`${lineClassName} ${
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[3px]'
        }`}
      />
    </span>
  )
}
