import { paginationContract, themes } from '@atom63/ui-foundation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { repeatedLandmarks } from '../story-probes'

function Demo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#previous" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const meta = {
  title: 'UI React/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => <Demo />,
}

/** On the first page, Previous is disabled: no href, out of the tab order, announced as disabled. */
export const FirstPage: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const previous = canvasElement.querySelector<HTMLElement>('[aria-label="Go to previous page"]')
    if (!previous) throw new Error('Expected the Previous control')
    if (previous.hasAttribute('href')) throw new Error('Expected a disabled Previous without href')
    if (previous.getAttribute('aria-disabled') !== 'true') {
      throw new Error('Expected aria-disabled="true" on the disabled Previous')
    }
    previous.focus()
    if (document.activeElement === previous) throw new Error('Expected Previous to be unfocusable')
    const label = previous.querySelector<HTMLElement>('.a63-Button-label')
    if (!label || Number(getComputedStyle(label).opacity) >= 1) {
      throw new Error('Expected the disabled Previous to be drawn faded')
    }
  },
}

/** Under dir="rtl" the list runs from the right and the chevrons mirror, so Previous points
 *  to the inline start. Children replace the visible labels. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Pagination aria-label="ترقيم الصفحات">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious aria-label="الصفحة السابقة" href="#previous">
              السابق
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#page-2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis>صفحات أخرى</PaginationEllipsis>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext aria-label="الصفحة التالية" href="#next">
              التالي
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector<SVGElement>('[aria-label="الصفحة السابقة"] svg')
    if (!icon || getComputedStyle(icon).transform === 'none') {
      throw new Error('Expected the Previous chevron to mirror under dir="rtl"')
    }
  },
}

export const Themes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Demo />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointPagination label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointPagination label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointPagination label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(paginationContract, null, 2)}
    </pre>
  ),
}

function EndpointPagination({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>{label}</span>
      <div style={{ flex: 1 }}>
        <Demo />
      </div>
    </div>
  )
}
