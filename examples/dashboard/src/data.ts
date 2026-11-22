/*
 * Sample data for Tidepool, a fictional subscription-analytics product. There
 * is no backend: every number here is generated from fixed lists, so each
 * build renders the same pages. Replace this module with real queries.
 */

export type Plan = 'starter' | 'growth' | 'scale' | 'enterprise'
export type AccountStatus = 'active' | 'trial' | 'past-due' | 'churned'

export interface Account {
  id: string
  name: string
  /** Billing contact. */
  email: string
  plan: Plan
  status: AccountStatus
  /** Monthly recurring revenue in US dollars. */
  mrr: number
  seats: number
  owner: string
  country: string
  /** ISO date the account started paying or started its trial. */
  since: string
  /** ISO date of the last sign-in by anyone on the account. */
  lastActive: string
}

export const plans: readonly { label: string; value: Plan }[] = [
  { label: 'Starter', value: 'starter' },
  { label: 'Growth', value: 'growth' },
  { label: 'Scale', value: 'scale' },
  { label: 'Enterprise', value: 'enterprise' },
]

export const statuses: readonly { label: string; value: AccountStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Trial', value: 'trial' },
  { label: 'Past due', value: 'past-due' },
  { label: 'Churned', value: 'churned' },
]

export const owners = ['Maya Chen', 'Jonas Weber', 'Priya Nair', 'Leo Martins'] as const

const names = [
  'Brightline Health',
  'Cobalt Freight',
  'Driftwood Studio',
  'Ember Analytics',
  'Fable & Finch',
  'Granite Legal',
  'Harbor Robotics',
  'Iris Optics',
  'Juniper Foods',
  'Kestrel Aviation',
  'Lantern Learning',
  'Meridian Bank',
  'Nimbus Weather',
  'Orchard Retail',
  'Pinecrest Clinics',
  'Quarry Games',
  'Riverstone Energy',
  'Saffron Kitchens',
  'Tundra Outdoor',
  'Umber Architects',
  'Vela Mobility',
  'Willow Insurance',
  'Xenon Labs',
  'Yardline Sports',
  'Zephyr Travel',
  'Atlas Payroll',
  'Beacon Media',
  'Cinder Security',
  'Delta Dental Group',
  'Evergreen Homes',
  'Foxglove Beauty',
  'Gale Logistics',
  'Hollow Pine Coffee',
  'Indigo Print',
  'Jetty Marine',
  'Keystone Civic',
  'Larkspur Events',
  'Mosaic Hiring',
  'Northpoint Realty',
  'Opal Fintech',
  'Prairie Farms',
  'Quill Docs',
  'Redwood Clinics',
  'Sable Fashion',
  'Tessellate AI',
  'Upland Water',
  'Verdant Labs',
  'Wavecrest Audio',
] as const

const countries = ['United States', 'Germany', 'India', 'Brazil', 'Japan', 'United Kingdom']
const planMrr: Record<Plan, number> = { starter: 49, growth: 290, scale: 990, enterprise: 4200 }

/* A small deterministic sequence, so the sample stays the same between builds. */
function sequence(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const random = sequence(63)
const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const today = new Date(Date.UTC(2026, 10, 20))
const daysAgo = (days: number) => isoDay(new Date(today.getTime() - days * 86_400_000))

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const sampleAccounts: readonly Account[] = names.map((name, index) => {
  const plan = plans[Math.floor(random() * plans.length)]!.value
  const roll = random()
  const status: AccountStatus =
    roll < 0.66 ? 'active' : roll < 0.8 ? 'trial' : roll < 0.9 ? 'past-due' : 'churned'
  const seats = Math.max(1, Math.round(random() * (plan === 'enterprise' ? 400 : 60)))
  const mrr =
    status === 'trial' || status === 'churned'
      ? 0
      : Math.round(planMrr[plan] * (1 + random() * 1.5))
  return {
    id: `acc-${String(index + 101)}`,
    name,
    email: `billing@${slug(name)}.example`,
    plan,
    status,
    mrr,
    seats,
    owner: owners[index % owners.length]!,
    country: countries[Math.floor(random() * countries.length)]!,
    since: daysAgo(Math.round(30 + random() * 900)),
    lastActive: daysAgo(
      status === 'churned' ? 40 + Math.round(random() * 60) : Math.round(random() * 14)
    ),
  }
})

/* Twelve months of revenue, ending with November 2026. */
export interface MonthPoint {
  /** Short month label, for example "Nov". */
  label: string
  /** MRR at the end of the month, in US dollars. */
  mrr: number
  newMrr: number
  churnedMrr: number
  activeAccounts: number
}

const monthLabels = [
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
]

export const months: readonly MonthPoint[] = (() => {
  const series = sequence(7)
  let mrr = 61_400
  let accounts = 21
  return monthLabels.map(label => {
    const newMrr = Math.round(4200 + series() * 5200)
    const churnedMrr = Math.round(900 + series() * 2600)
    mrr += newMrr - churnedMrr
    accounts += Math.round(1 + series() * 3)
    return { activeAccounts: accounts, churnedMrr, label, mrr, newMrr }
  })
})()

export interface Activity {
  action: string
  actor: string
  dateTime: string
  id: string
  target: string
  time: string
}

export const activity: readonly Activity[] = [
  {
    action: 'moved to Scale:',
    actor: 'Maya Chen',
    dateTime: '2026-11-20T09:12:00Z',
    id: 'ev1',
    target: 'Harbor Robotics',
    time: '2 hours ago',
  },
  {
    action: 'started a trial for',
    actor: 'Leo Martins',
    dateTime: '2026-11-20T07:40:00Z',
    id: 'ev2',
    target: 'Tessellate AI',
    time: '4 hours ago',
  },
  {
    action: 'flagged a failed payment for',
    actor: 'Priya Nair',
    dateTime: '2026-11-19T16:05:00Z',
    id: 'ev3',
    target: 'Cobalt Freight',
    time: 'Yesterday',
  },
  {
    action: 'added 40 seats to',
    actor: 'Jonas Weber',
    dateTime: '2026-11-19T10:30:00Z',
    id: 'ev4',
    target: 'Meridian Bank',
    time: 'Yesterday',
  },
  {
    action: 'recorded a cancellation for',
    actor: 'Maya Chen',
    dateTime: '2026-11-18T14:00:00Z',
    id: 'ev5',
    target: 'Quarry Games',
    time: '2 days ago',
  },
]

export const currency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})
export const compactCurrency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
})
export const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
export const planLabel = (plan: Plan) => plans.find(item => item.value === plan)!.label
export const statusLabel = (status: AccountStatus) =>
  statuses.find(item => item.value === status)!.label
