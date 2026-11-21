import { AppShell, type AppShellLinkProps } from '@atom63/templates'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@atom63/ui-react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Building2, LayoutDashboard, Settings } from 'lucide-react'

import { type DataState, dataStates, useDataState } from '../store'

const nav = [
  { href: '/', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '/accounts', icon: <Building2 aria-hidden />, label: 'Accounts' },
  { href: '/settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

const stateLabels: Record<DataState, string> = {
  empty: 'Empty',
  error: 'Error',
  loading: 'Loading',
  ready: 'Sample data',
}
const stateItems = dataStates.map(value => ({ label: stateLabels[value], value }))

/* Shell links go through the router and keep the forced data state, if any. */
function RouterLink({ href, ...props }: AppShellLinkProps) {
  const state = useDataState()
  return <Link search={state === 'ready' ? {} : { state }} to={href} {...props} />
}
const renderLink = (props: AppShellLinkProps) => <RouterLink {...props} />

/* Switches the data pages between sample data and their loading, empty and error states. */
function DataStateSelect() {
  const state = useDataState()
  const navigate = useNavigate()
  return (
    <Select
      items={stateItems}
      onValueChange={next =>
        navigate({
          to: '.',
          search: next && next !== 'ready' ? { state: next as DataState } : {},
        })
      }
      value={state}
    >
      <SelectTrigger aria-label="Data state" className="w-36" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {stateItems.map(item => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <AppShell
      navItems={nav.map(item => ({
        ...item,
        current: item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
      }))}
      productName="Tidepool"
      renderLink={renderLink}
      topBarActions={<DataStateSelect />}
    >
      <Outlet />
    </AppShell>
  )
}
