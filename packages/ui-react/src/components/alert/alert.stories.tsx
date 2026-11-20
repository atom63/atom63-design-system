import { alertContract, alertVariants, themes } from '@atom63/ui-foundation'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { Info } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>

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

/* Every alert action label is text, so it reaches WCAG's 4.5:1 on the tinted
   alert fill (1.4.3). */
function expectActionContrast(canvasElement: HTMLElement) {
  const actions = canvasElement.querySelectorAll<HTMLElement>('.a63-Alert-action .a63-Button')
  if (actions.length === 0) throw new Error('Expected alert actions')
  for (const action of actions) {
    const alert = action.closest<HTMLElement>('.a63-Alert')
    const label = action.closest<HTMLElement>('[data-alert-row]')?.dataset.alertRow ?? ''
    const ratio = contrast(
      over(paintedRgba(getComputedStyle(action).color), backdrop(action)),
      backdrop(action)
    )
    if (ratio < 4.5) {
      throw new Error(`${label} ${alert?.dataset.variant}: action label is ${ratio.toFixed(2)}:1`)
    }
  }
}

export const Playground: Story = {
  render: () => (
    <Alert style={{ maxWidth: 420 }}>
      <AlertIcon>
        <Info aria-hidden />
      </AlertIcon>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is a neutral, default alert callout.</AlertDescription>
    </Alert>
  ),
}

/* Every semantic tone. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
      {alertVariants.map(variant => (
        <Alert key={variant} variant={variant}>
          <AlertIcon>
            <Info aria-hidden />
          </AlertIcon>
          <AlertTitle style={{ textTransform: 'capitalize' }}>{variant}</AlertTitle>
          <AlertDescription>The {variant} tone recolors border, fill, and icon.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
}

/* With a trailing action slot. */
export const WithAction: Story = {
  render: () => (
    <Alert style={{ maxWidth: 460 }} variant="warning">
      <AlertIcon>
        <Info aria-hidden />
      </AlertIcon>
      <AlertTitle>Unsaved changes</AlertTitle>
      <AlertDescription>Your edits will be lost if you leave.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="ghost">
          Discard
        </Button>
      </AlertAction>
    </Alert>
  ),
}

/* Action treatment across every alert tone. */
export const ActionVariants: Story = {
  play: ({ canvasElement }) => expectActionContrast(canvasElement),
  render: () => (
    <div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
      {alertVariants.map(variant => (
        <Alert key={variant} variant={variant}>
          <AlertIcon>
            <Info aria-hidden />
          </AlertIcon>
          <AlertTitle style={{ textTransform: 'capitalize' }}>{variant}</AlertTitle>
          <AlertDescription>
            The action button inherits the {variant} alert tone inside the action slot.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" variant="ghost">
              Review
            </Button>
          </AlertAction>
        </Alert>
      ))}
    </div>
  ),
}

/* Every tone with its action in dark mode, where the error tone moves to the
   danger status accent and the danger text color. */
export const DarkActionVariants: Story = { ...ActionVariants, globals: { mode: 'dark' } }

/* Right to left: the action sits at the inline end (the left), clear of the title. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ maxWidth: 460 }}>
      <Alert variant="error">
        <AlertIcon>
          <Info aria-hidden />
        </AlertIcon>
        <AlertTitle>تعذر حفظ التغييرات</AlertTitle>
        <AlertDescription>تحقق من الاتصال ثم حاول مرة أخرى.</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="ghost">
            إعادة المحاولة
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
}

/* Renders across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <Alert style={{ flex: 1 }} variant="info">
                <AlertIcon>
                  <Info aria-hidden />
                </AlertIcon>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Status tones recolor per theme.</AlertDescription>
              </Alert>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Every tone's action label across all 4 DS themes × light/dark. */
export const ActionThemes: Story = {
  play: ({ canvasElement }) => expectActionContrast(canvasElement),
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              data-alert-row={`${theme} / ${mode}`}
              style={{
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'grid',
                gap: 8,
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                padding: '0.75rem',
              }}
            >
              {alertVariants.map(variant => (
                <Alert key={variant} variant={variant}>
                  <AlertTitle style={{ textTransform: 'capitalize' }}>
                    {theme} {mode} {variant}
                  </AlertTitle>
                  <AlertAction>
                    <Button size="sm" variant="ghost">
                      Review
                    </Button>
                  </AlertAction>
                </Alert>
              ))}
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same alert reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
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
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.68 }}>{endpoint.label}</div>
            <Alert variant="info">
              <AlertIcon>
                <Info aria-hidden />
              </AlertIcon>
              <AlertTitle>Endpoint fit</AlertTitle>
              <AlertDescription>
                The same Alert should keep its status-surface intent in this host context.
              </AlertDescription>
              <AlertAction>
                <Button size="sm" variant="ghost">
                  Review
                </Button>
              </AlertAction>
            </Alert>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(alertContract, null, 2)}
    </pre>
  ),
}
