export type InvoiceStatus = 'paid' | 'open' | 'overdue'

export interface Invoice {
  amount: number
  customer: string
  id: string
  /** ISO date, read as UTC. */
  issued: string
  status: InvoiceStatus
}

/* Sample rows for the template; a product replaces them with its own data. */
export const invoices: readonly Invoice[] = [
  {
    amount: 1250,
    customer: 'Northwind Traders',
    id: 'INV-1042',
    issued: '2026-09-01',
    status: 'paid',
  },
  { amount: 480.5, customer: 'Lumen Studio', id: 'INV-1043', issued: '2026-09-03', status: 'open' },
  {
    amount: 3200,
    customer: 'Harbor & Co.',
    id: 'INV-1044',
    issued: '2026-08-12',
    status: 'overdue',
  },
  { amount: 915, customer: 'Fieldnote Labs', id: 'INV-1045', issued: '2026-09-08', status: 'open' },
  {
    amount: 76.2,
    customer: 'Pine Street Bakery',
    id: 'INV-1046',
    issued: '2026-09-10',
    status: 'paid',
  },
  {
    amount: 2045,
    customer: 'Arcadia Health',
    id: 'INV-1047',
    issued: '2026-08-28',
    status: 'overdue',
  },
  {
    amount: 640,
    customer: 'Quill Publishing',
    id: 'INV-1048',
    issued: '2026-09-15',
    status: 'paid',
  },
  {
    amount: 1580,
    customer: 'Summit Outfitters',
    id: 'INV-1049',
    issued: '2026-09-18',
    status: 'open',
  },
]
