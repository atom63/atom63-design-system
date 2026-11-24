import {
  Button,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from '@atom63/ui-react'
import { Link } from '@tanstack/react-router'
import { Menu, Palette, Sparkles } from 'lucide-react'

import { useAssistant } from '../modules/assistant/assistant'
import { isOn, portfolio } from '../portfolio.config'
import { AppearanceControls } from '../theme'

export type NavItem = { label: string; to: string }

const linkClassName =
  'text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-sm transition-colors'

function AppearanceMenu() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button aria-label="Appearance" size="icon-sm" tone="muted" variant="ghost">
            <Palette aria-hidden />
          </Button>
        }
      />
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Appearance</PopoverTitle>
        </PopoverHeader>
        <AppearanceControls />
      </PopoverContent>
    </Popover>
  )
}

/* On a phone the links move into a sheet. */
function MobileMenu({ nav }: { nav: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Menu"
            className="md:hidden"
            size="icon-sm"
            tone="muted"
            variant="ghost"
          >
            <Menu aria-hidden />
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{portfolio.person.name}</SheetTitle>
        </SheetHeader>
        <SheetPanel>
          <nav aria-label="Main">
            <ul className="grid gap-1">
              {[{ label: 'Home', to: '/' }, ...nav].map(item => (
                <li key={item.to}>
                  <Link
                    activeOptions={{ exact: item.to === '/' }}
                    activeProps={{ 'aria-current': 'page', className: 'text-foreground' }}
                    className={`${linkClassName} block text-base`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SheetPanel>
      </SheetContent>
    </Sheet>
  )
}

export function SiteHeader({ nav }: { nav: NavItem[] }) {
  const assistant = useAssistant()
  return (
    <header className="border-border border-b print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <Link className="text-foreground font-semibold" to="/">
          {portfolio.person.name}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map(item => (
            <Link
              activeProps={{ 'aria-current': 'page', className: 'text-foreground' }}
              className={linkClassName}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          {isOn('assistant') && assistant ? (
            <Button onClick={assistant.open} size="sm" variant="outline">
              <Sparkles aria-hidden />
              Ask
            </Button>
          ) : null}
          <AppearanceMenu />
          <MobileMenu nav={nav} />
        </div>
      </div>
    </header>
  )
}
