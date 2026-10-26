import { tableContract, tableTones, themes } from '@atom63/ui-foundation'
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { amount: '$250.00', invoice: 'INV001', method: 'Credit Card', status: 'Paid' },
  { amount: '$150.00', invoice: 'INV002', method: 'PayPal', status: 'Pending' },
  { amount: '$350.00', invoice: 'INV003', method: 'Bank Transfer', status: 'Unpaid' },
]

export const Playground: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.invoice} data-state={r.invoice === 'INV002' ? 'selected' : undefined}>
              <TableCell>{r.invoice}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.method}</TableCell>
              <TableCell>{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>$750.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
}

/* A compact three-row table reused by the theme matrix. */
function DemoTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.invoice} data-state={r.invoice === 'INV002' ? 'selected' : undefined}>
            <TableCell>{r.invoice}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell>{r.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* Wrapping in a data-slot="frame" ancestor switches on the bordered card. */
export const Framed: Story = {
  render: () => (
    <div data-slot="frame" style={{ width: 480 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.invoice}>
              <TableCell>{r.invoice}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

/* `sm` takes its row padding from the density contract: compare it with the
   default rows, then under compact density. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 480 }}>
      {tableContract.sizes.map(size => (
        <div key={size}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>size={size}</span>
          <Table size={size}>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.invoice}>
                  <TableCell>{r.invoice}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
      <UIProvider density="compact">
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
          size=sm, compact density
        </span>
        <Table size="sm">
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.invoice}>
                <TableCell>{r.invoice}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </UIProvider>
    </div>
  ),
}

/* `plain` drops the dividers between body rows, for lists such as a track list. */
export const Plain: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Table variant="plain">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.invoice}>
              <TableCell>{r.invoice}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

/* size="sm" with row checkboxes: the checkbox keeps its hit area but no longer
   sets the row height. */
export const SelectableRows: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Table size="sm">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox aria-label="Select all invoices" />
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.invoice}>
              <TableCell>
                <Checkbox aria-label={`Select ${r.invoice}`} />
              </TableCell>
              <TableCell>{r.invoice}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

/* tone colours selected rows (data-state="selected"): neutral (the default) is a
   muted fill with primary text, accent is the opt-in primary wash. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 480 }}>
      {tableTones.map(tone => (
        <Table key={tone} size="sm" tone={tone}>
          <TableCaption>tone=&quot;{tone}&quot;</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 3).map((r, index) => (
              <TableRow data-state={index === 1 ? 'selected' : undefined} key={r.invoice}>
                <TableCell>{r.invoice}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
    </div>
  ),
}

const wideColumns = ['Customer', 'Method', 'Created', 'Refunded', 'Dispute', 'Reason']

/* A table wider than its container: the invoice stays pinned at the start and
   the row menu at the end while the middle scrolls. */
export const StickyColumns: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Table size="sm">
        <TableHeader>
          <TableRow>
            <TableHead sticky="start">Invoice</TableHead>
            {wideColumns.map(column => (
              <TableHead key={column}>{column}</TableHead>
            ))}
            <TableHead sticky="end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.invoice} data-state={r.invoice === 'INV002' ? 'selected' : undefined}>
              <TableCell sticky="start">{r.invoice}</TableCell>
              {wideColumns.map(column => (
                <TableCell key={column}>{column === 'Method' ? r.method : '—'}</TableCell>
              ))}
              <TableCell sticky="end">
                <Button aria-label={`Actions for ${r.invoice}`} size="icon-xs" variant="ghost">
                  …
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'flex-start',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  color: 'var(--a63-text-secondary)',
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <div data-slot="frame" style={{ width: 360 }}>
                <DemoTable />
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>web / pointer</span>
          <DemoTable />
        </div>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>ios / touch</span>
          <DemoTable />
        </div>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <div style={{ background: 'var(--a63-surface-panel)', padding: '1rem' }}>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>
            extension / compact
          </span>
          <DemoTable />
        </div>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(tableContract, null, 2)}
    </pre>
  ),
}
