import { DetailPanel, EmptyState, FilterBar, PageHeader } from '@atom63/templates'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldLabel,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableSort,
} from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Building2, ChevronRight, Ellipsis, Plus, SearchX } from 'lucide-react'
import { type MouseEvent, type ReactNode, useId, useState } from 'react'

import { AccountFormDialog } from '../components/account-form-dialog'
import { LoadError, LoadingBlock } from '../components/states'
import {
  type Account,
  type AccountStatus,
  currency,
  dateFormat,
  planLabel,
  statuses,
  statusLabel,
} from '../data'
import { accountsRoute } from '../router'
import { useAccounts, useDataState } from '../store'

const pageSize = 10

type SortKey = 'name' | 'plan' | 'mrr' | 'seats' | 'lastActive'
type Sort = TableSort & { column: SortKey }

const planOrder = { starter: 0, growth: 1, scale: 2, enterprise: 3 } as const
const compare: Record<SortKey, (a: Account, b: Account) => number> = {
  lastActive: (a, b) => a.lastActive.localeCompare(b.lastActive),
  mrr: (a, b) => a.mrr - b.mrr,
  name: (a, b) => a.name.localeCompare(b.name),
  plan: (a, b) => planOrder[a.plan] - planOrder[b.plan],
  seats: (a, b) => a.seats - b.seats,
}

const sortOptions = [
  { label: 'Name, A to Z', value: 'name:ascending' },
  { label: 'MRR, highest first', value: 'mrr:descending' },
  { label: 'Seats, most first', value: 'seats:descending' },
  { label: 'Plan, largest first', value: 'plan:descending' },
  { label: 'Last active, recent first', value: 'lastActive:descending' },
]

const statusOptions = [{ label: 'All statuses', value: 'all' }, ...statuses]

const statusVariant: Record<AccountStatus, 'success' | 'info' | 'warning' | 'muted'> = {
  active: 'success',
  churned: 'muted',
  'past-due': 'warning',
  trial: 'info',
}

function StatusBadge({ status }: { status: AccountStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel(status)}</Badge>
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

export function AccountsPage() {
  const state = useDataState()
  const { accounts: allAccounts } = useAccounts()
  const accounts = state === 'empty' ? [] : allAccounts
  const search = accountsRoute.useSearch()
  const navigate = useNavigate({ from: '/accounts' })
  const router = useRouter()
  const sortLabelId = useId()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<Sort>({ column: 'mrr', direction: 'descending' })
  const [form, setForm] = useState<{ account?: Account; open: boolean }>({ open: false })

  const go = (next: { account?: string; page?: number }) =>
    navigate({ search: previous => ({ state: previous.state, ...next }) })

  const needle = query.trim().toLowerCase()
  const visible = accounts
    .filter(
      account =>
        (status === 'all' || account.status === status) &&
        (needle === '' ||
          account.name.toLowerCase().includes(needle) ||
          account.email.toLowerCase().includes(needle) ||
          account.owner.toLowerCase().includes(needle))
    )
    .sort((a, b) => compare[sort.column](a, b) * (sort.direction === 'ascending' ? 1 : -1))
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const page = Math.min(search.page ?? 1, pageCount)
  const rows = visible.slice((page - 1) * pageSize, page * pageSize)
  const filtered = needle !== '' || status !== 'all'
  const open = allAccounts.find(account => account.id === search.account)

  const resetPage = () => {
    if (search.page) go({ account: search.account })
  }
  const clear = () => {
    setQuery('')
    setStatus('all')
    resetPage()
  }
  const sortBy = (next: TableSort) => {
    setSort(next as Sort)
    resetPage()
  }

  /* Page links are real URLs; a plain click stays in the app. */
  const pageHref = (target: number) =>
    router.buildLocation({
      search: previous => ({ ...previous, page: target > 1 ? target : undefined }),
      to: '/accounts',
    }).href
  const toPage = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    go({ account: search.account, page: target > 1 ? target : undefined })
  }

  const rowMenu = (account: Account) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Actions for ${account.name}`}
            size="icon-sm"
            tone="muted"
            variant="ghost"
          >
            <Ellipsis aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => go({ account: account.id, page: search.page })}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setForm({ account, open: true })}>
          Edit account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  let body: ReactNode
  if (state === 'error') {
    body = <LoadError what="accounts" />
  } else if (state === 'loading') {
    body = <LoadingBlock label="Loading accounts" rows={8} />
  } else if (accounts.length === 0) {
    body = (
      <EmptyState
        action={
          <Button onClick={() => setForm({ open: true })} variant="outline">
            Add an account
          </Button>
        }
        description="Accounts appear here once Tidepool reads your billing provider, or when you add one by hand."
        icon={<Building2 aria-hidden />}
        title="No accounts yet"
      />
    )
  } else {
    body = (
      <>
        <FilterBar
          filterLabel="Status"
          filterOptions={statusOptions}
          filterValue={status}
          onClear={clear}
          onFilterChange={value => {
            setStatus(value)
            resetPage()
          }}
          onQueryChange={value => {
            setQuery(value)
            resetPage()
          }}
          query={query}
          searchLabel="Search accounts"
          searchPlaceholder="Name, email or owner"
          showClear={filtered}
        />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p aria-live="polite" className="text-muted-foreground text-sm">
              {filtered
                ? `${visible.length} of ${accounts.length} accounts`
                : `${accounts.length} accounts`}
            </p>
            {/* On a phone the column headers are gone, so sorting moves here. */}
            <Field className="w-full sm:hidden">
              <FieldLabel id={sortLabelId}>Sort by</FieldLabel>
              <Select
                items={sortOptions}
                onValueChange={next => {
                  const [column, direction] = String(next).split(':') as [
                    SortKey,
                    Sort['direction'],
                  ]
                  sortBy({ column, direction })
                }}
                value={`${sort.column}:${sort.direction}`}
              >
                <SelectTrigger aria-labelledby={sortLabelId}>
                  <SelectValue placeholder="Custom order" />
                </SelectTrigger>
                <SelectPopup>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              action={
                <Button onClick={clear} variant="outline">
                  Clear filters
                </Button>
              }
              description="No account matches this search and status. Clear the filters to see every account."
              icon={<SearchX aria-hidden />}
              title="No matching accounts"
            />
          ) : (
            <>
              <div className="hidden sm:block" data-slot="frame">
                <Table aria-label="Accounts" onSortChange={sortBy} size="sm" sort={sort}>
                  <TableHeader>
                    <TableRow>
                      <TableHead sortKey="name">Account</TableHead>
                      <TableHead firstSortDirection="descending" sortKey="plan">
                        Plan
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-end" firstSortDirection="descending" sortKey="mrr">
                        MRR
                      </TableHead>
                      <TableHead
                        className="text-end"
                        firstSortDirection="descending"
                        sortKey="seats"
                      >
                        Seats
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">Owner</TableHead>
                      <TableHead firstSortDirection="descending" sortKey="lastActive">
                        Last active
                      </TableHead>
                      <TableHead className="w-0">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(account => (
                      <TableRow
                        data-selected={account.id === search.account ? '' : undefined}
                        key={account.id}
                      >
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar shape="square" size="xs">
                              <AvatarFallback>{initials(account.name)}</AvatarFallback>
                            </Avatar>
                            <Button
                              className="-ms-2 font-medium"
                              onClick={() => go({ account: account.id, page: search.page })}
                              size="xs"
                              variant="link"
                            >
                              {account.name}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{planLabel(account.plan)}</TableCell>
                        <TableCell>
                          <StatusBadge status={account.status} />
                        </TableCell>
                        <TableCell className="text-end tabular-nums">
                          {currency.format(account.mrr)}
                        </TableCell>
                        <TableCell className="text-end tabular-nums">{account.seats}</TableCell>
                        <TableCell className="hidden lg:table-cell">{account.owner}</TableCell>
                        <TableCell>{dateFormat.format(new Date(account.lastActive))}</TableCell>
                        <TableCell className="text-end">{rowMenu(account)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul
                aria-label="Accounts"
                className="divide-border border-border flex flex-col divide-y rounded-lg border sm:hidden"
              >
                {rows.map(account => (
                  <li key={account.id}>
                    <Item className="rounded-none" size="sm">
                      <ItemContent>
                        <ItemTitle>{account.name}</ItemTitle>
                        <ItemDescription>
                          {planLabel(account.plan)} · {currency.format(account.mrr)} ·{' '}
                          {account.seats} seats
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions className="gap-1">
                        <StatusBadge status={account.status} />
                        <Button
                          aria-label={`View ${account.name}`}
                          onClick={() => go({ account: account.id, page: search.page })}
                          size="icon-sm"
                          tone="muted"
                          variant="ghost"
                        >
                          <ChevronRight aria-hidden />
                        </Button>
                      </ItemActions>
                    </Item>
                  </li>
                ))}
              </ul>
              {pageCount > 1 ? (
                <Pagination aria-label="Account pages">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={page === 1}
                        href={pageHref(page - 1)}
                        onClick={toPage(page - 1)}
                      />
                    </PaginationItem>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => (
                      <PaginationItem key={number}>
                        <PaginationLink
                          aria-label={`Page ${number}`}
                          href={pageHref(number)}
                          isActive={number === page}
                          onClick={toPage(number)}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        disabled={page === pageCount}
                        href={pageHref(page + 1)}
                        onClick={toPage(page + 1)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <Container gap={6} maxWidth="wide" padding="none">
        <PageHeader
          actions={
            <Button onClick={() => setForm({ open: true })} variant="primary">
              <Plus aria-hidden />
              New account
            </Button>
          }
          description="Every customer account, its plan and what it pays."
          title="Accounts"
        />
        {body}
      </Container>
      <DetailPanel
        actions={
          open ? (
            <>
              <Button render={<a href={`mailto:${open.email}`} />} variant="outline">
                Email billing contact
              </Button>
              <Button onClick={() => setForm({ account: open, open: true })} variant="primary">
                Edit account
              </Button>
            </>
          ) : null
        }
        description={open ? `${planLabel(open.plan)} plan · ${open.country}` : undefined}
        fields={
          open
            ? [
                { label: 'Status', value: <StatusBadge status={open.status} /> },
                { label: 'MRR', value: currency.format(open.mrr) },
                { label: 'Seats', value: String(open.seats) },
                { label: 'Billing email', value: open.email },
                { label: 'Owner', value: open.owner },
                { label: 'Customer since', value: dateFormat.format(new Date(open.since)) },
                { label: 'Last active', value: dateFormat.format(new Date(open.lastActive)) },
              ]
            : []
        }
        onOpenChange={next => {
          if (!next) go({ page: search.page })
        }}
        open={state === 'ready' && open !== undefined}
        title={open?.name ?? ''}
      />
      <AccountFormDialog
        account={form.account}
        onOpenChange={next => setForm(current => ({ ...current, open: next }))}
        open={form.open}
      />
    </>
  )
}
