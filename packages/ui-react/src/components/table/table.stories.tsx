import { tableContract, themes } from '@atom63/ui-foundation'
import {
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
