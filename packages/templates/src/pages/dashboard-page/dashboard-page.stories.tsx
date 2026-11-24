import { UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  checkSafeArea,
  compactGlobals,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { DashboardPage } from './dashboard-page'

const meta = {
  title: 'Templates/Pages/Dashboard page',
  component: DashboardPage,
  parameters: { layout: 'fullscreen', ...landmarkParameters },
} satisfies Meta<typeof DashboardPage>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

/* The shell's top bar and page wrapper own the phone's safe-area insets. */
export const Phone: Story = {
  globals: phoneGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      'main > header': { paddingInlineStart: '47px', paddingTop: '29px' },
      'main > header + div': { paddingBottom: '63px', paddingInlineStart: '47px' },
    }),
}

/* From `md` the sidebar rail owns the inline-start inset. */
export const Tablet: Story = {
  globals: tabletGlobals,
  play: ({ canvasElement }) =>
    checkSafeArea(canvasElement, {
      '[data-slot="sidebar-container"]': { paddingInlineStart: '47px' },
    }),
}

export const Compact: Story = { globals: compactGlobals }

export const Wide: Story = { globals: wideGlobals }

/* Placeholders while the overview loads, each block announced once as busy. */
export const Loading: Story = {
  args: { state: 'loading' },
  play: ({ canvasElement }) => {
    const busy = canvasElement.querySelectorAll('[role="status"][aria-busy="true"]')
    if (busy.length !== 3) throw new Error(`Expected 3 loading blocks, got ${busy.length}`)
  },
}

/* A failed load says what happened and offers a retry. */
export const LoadError: Story = {
  args: { onRetry: () => undefined, state: 'error' },
  play: ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[role="alert"]')
    if (!alert?.querySelector('button')?.textContent?.includes('Try again'))
      throw new Error('The error state has no retry')
  },
}

/* A new workspace: zeros, the empty table with its way in, a quiet feed. */
export const Empty: Story = {
  args: { state: 'empty' },
  play: ({ canvasElement }) => {
    if (!canvasElement.textContent?.includes('No invoices yet'))
      throw new Error('The empty table state is missing')
    const summary = canvasElement.querySelector('p[aria-live="polite"]')
    if (summary?.textContent !== 'No invoices yet')
      throw new Error(`The empty summary reads "${summary?.textContent}"`)
  },
}

/* Long values wrap in their cards instead of overflowing. */
export const LongValues: Story = {
  args: {
    stats: [
      {
        change: { direction: 'up', text: '12.4%', tone: 'good' },
        label: 'Revenue this quarter',
        value: '$1,248,200.00',
      },
      { label: 'Outstanding across every region', value: '$312,904.17' },
      { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'Overdue', value: '27' },
      { label: 'Customers', value: '12,840' },
    ],
  },
  play: ({ canvasElement }) => {
    for (const card of canvasElement.querySelectorAll<HTMLElement>('[data-slot="card"]')) {
      if (card.scrollWidth > card.clientWidth + 1) throw new Error('A stat overflows its card')
    }
  },
}

/*
 * Right-to-left: the rail on the right, the content beside it. The shell's own
 * strings come from `shellLabels`; the page copy is the template's to translate.
 */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl">
      <DashboardPage
        shellLabels={{
          account: 'الحساب',
          navigation: 'الرئيسية',
          sheetDescription: 'يعرض الشريط الجانبي',
          sheetTitle: 'الشريط الجانبي',
          toggle: 'تبديل الشريط الجانبي',
        }}
      />
    </UIProvider>
  ),
  play: ({ canvasElement }) => {
    const rail = canvasElement.querySelector('[data-slot="sidebar-container"]')
    const main = canvasElement.querySelector('main')
    if (!rail || !main) throw new Error('Expected the rail and the main landmark')
    if (main.getBoundingClientRect().right > rail.getBoundingClientRect().left + 1)
      throw new Error('The rail covers the content under RTL')
    if (!canvasElement.querySelector('nav[aria-label="الرئيسية"]'))
      throw new Error('The shell labels are not passed through')
  },
}

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix frame>
      <DashboardPage />
    </ThemeMatrix>
  ),
}
