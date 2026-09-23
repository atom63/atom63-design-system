import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarNavGroup,
  SidebarNavLinkItem,
  ScrollArea,
  useSidebar,
} from '@atom63/ui-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, type ReactNode } from 'react'
import {
  DOC_NAV_DOMAIN_IDS,
  DOC_NAV_DOMAINS,
  DOC_AREAS,
  type DocArea,
  type DocAreaId,
  type NavSection,
  navDomainForArea,
} from '../lib/doc-pages'
import { pathForDoc } from '../lib/doc-routing'

type NavSidebarProps = {
  activeArea: DocAreaId
  activeSection?: string
}

export function NavSidebar({ activeArea, activeSection }: NavSidebarProps) {
  const activeDomain = navDomainForArea(activeArea)
  const domain = DOC_NAV_DOMAINS[activeDomain]

  return (
    <Sidebar
      className="docs-sidebar top-(--header-height) h-[calc(100svh-var(--header-height))]"
      collapsible="offcanvas"
      variant="sidebar"
    >
      <MobileDomainNav activeArea={activeArea} />

      <SidebarContent className="docs-sidebar-content">
        <ScrollArea
          className="min-h-0 flex-1"
          scrollFade
          showScrollbarOnHover
          viewportClassName="docs-sidebar-scroll-viewport pt-2"
        >
          {domain.areaIds.length === 1 ? (
            <AreaNavigation activeSection={activeSection} docArea={DOC_AREAS[activeArea]} />
          ) : (
            <StaticDomainNavigation activeArea={activeArea} activeSection={activeSection} />
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}

function AreaNavigation({ activeSection, docArea }: { activeSection?: string; docArea: DocArea }) {
  if (docArea.id === 'components') {
    return <FlatAreaNavigation activeSection={activeSection} docArea={docArea} />
  }

  return (
    <>
      <SidebarNavGroup label="Start here">
        <SidebarNavLink
          area={docArea.id}
          isActive={activeSection === docArea.defaultSlug}
          slug={docArea.defaultSlug}
        >
          {docArea.startLabel}
        </SidebarNavLink>
      </SidebarNavGroup>

      {docArea.sections.map(section => (
        <SidebarNavSection activeSection={activeSection} key={section.title} section={section} />
      ))}
    </>
  )
}

function FlatAreaNavigation({
  activeSection,
  docArea,
}: {
  activeSection?: string
  docArea: DocArea
}) {
  const items = docArea.sections.flatMap(section => section.items)
  const contractItems = items.filter(item => item.slug === 'component-contract')
  const componentItems = items
    .filter(item => item.slug.startsWith('component-') && item.slug !== 'component-contract')
    .sort((a, b) => a.label.localeCompare(b.label))
  const craftItems = items.filter(item => item.slug.startsWith('craft-'))

  return (
    <>
      <SidebarNavGroup label="Architecture">
        <SidebarNavLink
          area={docArea.id}
          isActive={activeSection === docArea.defaultSlug}
          slug={docArea.defaultSlug}
        >
          {docArea.startLabel}
        </SidebarNavLink>
        {contractItems.map(item => (
          <SidebarNavLink
            area={item.area}
            isActive={activeSection === item.slug}
            key={item.slug}
            slug={item.slug}
          >
            {item.label}
          </SidebarNavLink>
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label="Catalog">
        {componentItems.map(item => (
          <SidebarNavLink
            area={item.area}
            isActive={activeSection === item.slug}
            key={item.slug}
            slug={item.slug}
          >
            {item.label}
          </SidebarNavLink>
        ))}
      </SidebarNavGroup>

      {craftItems.length > 0 ? (
        <SidebarNavGroup label="Craft studies">
          {craftItems.map(item => (
            <SidebarNavLink
              area={item.area}
              isActive={activeSection === item.slug}
              key={item.slug}
              slug={item.slug}
            >
              {item.label}
            </SidebarNavLink>
          ))}
        </SidebarNavGroup>
      ) : null}
    </>
  )
}

function SidebarNavSection({
  activeSection,
  section,
}: {
  activeSection?: string
  section: NavSection
}) {
  return (
    <SidebarNavGroup label={section.title}>
      {section.items.map(item => (
        <SidebarNavLink
          area={item.area}
          isActive={activeSection === item.slug}
          key={item.slug}
          slug={item.slug}
        >
          {item.label}
        </SidebarNavLink>
      ))}
    </SidebarNavGroup>
  )
}

function StaticDomainNavigation({
  activeArea,
  activeSection,
}: {
  activeArea: DocAreaId
  activeSection?: string
}) {
  return (
    <>
      {DOC_NAV_DOMAINS.system.areaIds.map(areaId => (
        <StaticAreaNavigation
          activeSection={activeArea === areaId ? activeSection : undefined}
          docArea={DOC_AREAS[areaId]}
          key={areaId}
        />
      ))}
    </>
  )
}

function StaticAreaNavigation({
  activeSection,
  docArea,
}: {
  activeSection?: string
  docArea: DocArea
}) {
  const [primarySection, ...secondarySections] = docArea.sections

  return (
    <>
      <SidebarNavGroup label={docArea.label}>
        <SidebarNavLink
          area={docArea.id}
          isActive={activeSection === docArea.defaultSlug}
          slug={docArea.defaultSlug}
        >
          {docArea.startLabel}
        </SidebarNavLink>
        {primarySection?.items.map(item => (
          <SidebarNavLink
            area={item.area}
            isActive={activeSection === item.slug}
            key={item.slug}
            slug={item.slug}
          >
            {item.label}
          </SidebarNavLink>
        ))}
      </SidebarNavGroup>

      {secondarySections.map(section => (
        <SidebarNavSection activeSection={activeSection} key={section.title} section={section} />
      ))}
    </>
  )
}

function MobileDomainNav({ activeArea }: { activeArea: DocAreaId }) {
  const { isMobile } = useSidebar()
  const activeDomain = navDomainForArea(activeArea)

  if (!isMobile) return null

  return (
    <SidebarHeader className="p-2">
      <nav aria-label="Documentation sections" className="flex flex-col gap-1">
        {DOC_NAV_DOMAIN_IDS.map(domainId => {
          const domain = DOC_NAV_DOMAINS[domainId]
          const isActive = activeDomain === domainId
          return (
            <DomainNavLink isActive={isActive} key={domainId} to={pathForDoc(domain.defaultArea)}>
              {domain.label}
            </DomainNavLink>
          )
        })}
      </nav>
    </SidebarHeader>
  )
}

function DomainNavLink({
  children,
  isActive,
  to,
}: {
  children: ReactNode
  isActive: boolean
  to: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={`focus-visible:ring-ring focus-visible:ring-offset-sidebar flex h-11 items-center rounded-md px-2 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
      }`}
      onClick={() => isMobile && setOpenMobile(false)}
      to={to}
    >
      {children}
    </Link>
  )
}

function SidebarNavLink({
  area,
  children,
  isActive,
  slug,
}: {
  area: DocAreaId
  children: ReactNode
  isActive: boolean
  slug: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const touchTargetClassName = isMobile ? 'h-11' : undefined
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!isActive || !linkRef.current) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const link = linkRef.current
      const scrollRoot =
        link?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]') ??
        link?.closest<HTMLElement>('[data-slot="sidebar-content"]')
      if (!link || !scrollRoot) {
        return
      }

      const linkRect = link.getBoundingClientRect()
      const rootRect = scrollRoot.getBoundingClientRect()
      if (linkRect.top < rootRect.top || linkRect.bottom > rootRect.bottom) {
        scrollRoot.scrollTop +=
          linkRect.top - rootRect.top - (scrollRoot.clientHeight - linkRect.height) / 2
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isActive])

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarNavLinkItem isActive={isActive}>
      <Link
        aria-current={isActive ? 'page' : undefined}
        className={touchTargetClassName}
        onClick={closeMobileSidebar}
        ref={linkRef}
        to={pathForDoc(area, slug)}
      >
        {children}
      </Link>
    </SidebarNavLinkItem>
  )
}
