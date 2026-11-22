import { AlertTriangle, Inbox } from 'lucide-react'
import { emptyContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyErrorDetail,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from 'sonner'

const meta = {
  title: 'UI React/Empty',
  component: Empty,
  decorators: [
    Story => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

/* The sRGBA channels of a computed CSS colour, read back through a canvas so any
   colour syntax (oklch, color-mix) resolves the way the browser paints it. */
function paintedRgba(color: string): [number, number, number, number] {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) throw new Error('Expected a 2D canvas context')
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

function over(
  top: [number, number, number, number],
  base: [number, number, number]
): [number, number, number] {
  const [r, g, b, a] = top
  return [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]
}

/* The colour an element's text sits on: its own and its ancestors' fills,
   composited from the first opaque one up. */
function backdrop(element: HTMLElement): [number, number, number] {
  const layers: [number, number, number, number][] = []
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const fill = paintedRgba(getComputedStyle(node).backgroundColor)
    if (fill[3] > 0) layers.push(fill)
    if (fill[3] >= 0.99) break
  }
  return layers.reduceRight<[number, number, number]>(
    (base, layer) => over(layer, base),
    [255, 255, 255]
  )
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const luminance = (rgb: [number, number, number]) => {
    const [r = 0, g = 0, b = 0] = rgb.map(channel => {
      const c = channel / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/* The "Show details" toggle is a text label, so at rest it reaches WCAG's 4.5:1
   on the surface behind it (1.4.3). */
function expectToggleContrast(canvasElement: HTMLElement) {
  const toggles = canvasElement.querySelectorAll<HTMLElement>('.a63-Empty-errorToggle')
  if (toggles.length === 0) throw new Error('Expected an error-detail toggle')
  for (const toggle of toggles) {
    const label = toggle.closest<HTMLElement>('[data-empty-row]')?.dataset.emptyRow ?? 'default'
    const ratio = contrast(
      over(paintedRgba(getComputedStyle(toggle).color), backdrop(toggle)),
      backdrop(toggle)
    )
    if (ratio < 4.5) throw new Error(`${label}: details toggle is ${ratio.toFixed(2)}:1`)
  }
}

/* The canonical empty state: an icon chip, title, description + a primary CTA. */
export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Create your first project to see it listed here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="primary">
            New project
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
}

/* EmptyMedia default (no chip) vs. icon (a rounded muted chip). */
export const MediaVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Inbox aria-hidden style={{ height: 32, width: 32 }} />
          </EmptyMedia>
          <EmptyTitle>default</EmptyTitle>
        </EmptyHeader>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
          <EmptyTitle>icon</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </div>
  ),
}

/* Error state: the collapsible EmptyErrorDetail with an embedded CopyButton. */
export const ErrorState: Story = {
  play: ({ canvasElement }) => expectToggleContrast(canvasElement),
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>We couldn't load your data. Please try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline">
            Retry
          </Button>
          <EmptyErrorDetail
            error={'TypeError: Cannot read properties of undefined\n    at load (app.tsx:42)'}
          />
        </EmptyContent>
      </Empty>
    </div>
  ),
}

function ExpandedError({ rtl }: { rtl?: boolean }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{rtl ? 'حدث خطأ ما' : 'Something went wrong'}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyErrorDetail
          error={'TypeError: Cannot read properties of undefined\n    at load (app.tsx:42)'}
          labels={
            rtl
              ? { copy: 'الخطأ', hideDetails: 'إخفاء التفاصيل', showDetails: 'عرض التفاصيل' }
              : undefined
          }
        />
      </EmptyContent>
    </Empty>
  )
}

/* The expanded error detail: the error text with its copy button at the inline end,
   in light, dark and right to left (where the button sits on the left). */
export const ErrorExpanded: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
      {(['light', 'dark'] as const).map(mode => (
        <UIProvider key={mode} mode={mode}>
          <div style={{ background: 'var(--a63-surface-page)', padding: 8 }}>
            <ExpandedError />
          </div>
        </UIProvider>
      ))}
      <div dir="rtl" lang="ar">
        <ExpandedError rtl />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const toggle of canvasElement.querySelectorAll<HTMLElement>('.a63-Empty-errorToggle')) {
      toggle.click()
    }
    await new Promise(resolve => setTimeout(resolve, 0))
    const boxes = canvasElement.querySelectorAll<HTMLElement>('[data-slot="empty-error-box"]')
    if (boxes.length !== 3) throw new Error(`Expected 3 expanded details, got ${boxes.length}`)
    const rtlBox = boxes[2]
    const copy = rtlBox?.querySelector<HTMLElement>('[data-slot="empty-error-copy"]')
    if (!rtlBox || !copy) throw new Error('Expected the RTL copy button')
    if (copy.getBoundingClientRect().left - rtlBox.getBoundingClientRect().left > 16) {
      throw new Error('Expected the copy button at the inline end (left) in RTL')
    }
  },
}

/* The error state's details toggle across all 4 DS themes × light/dark. */
export const ErrorThemes: Story = {
  play: ({ canvasElement }) => expectToggleContrast(canvasElement),
  render: () => (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
            <div
              data-empty-row={`${theme} / ${mode}`}
              style={{
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: '0.75rem',
              }}
            >
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    {theme} / {mode}
                  </EmptyTitle>
                  <EmptyDescription>We couldn't load your data.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <EmptyErrorDetail error="TypeError: Cannot read properties of undefined" />
                </EmptyContent>
              </Empty>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The empty state rendered across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={theme + mode} mode={mode} theme={theme}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Create your first project to see it here.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" variant="primary">
                    New project
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: { density: 'compact', designLanguage: 'web', input: 'pointer' } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-page)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <div style={{ flex: 1, maxWidth: 420 }}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>No projects yet</EmptyTitle>
                  <EmptyDescription>Create your first project to see it here.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" variant="primary">
                    New project
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(emptyContract, null, 2)}
    </pre>
  ),
}
