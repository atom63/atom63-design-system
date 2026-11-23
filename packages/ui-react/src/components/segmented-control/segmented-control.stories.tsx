import {
  segmentedControlContract,
  segmentedControlSizes,
  segmentedControlTones,
  segmentedControlVariants,
  themes,
} from '@atom63/ui-foundation'
import { SegmentedControl, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GitBranch, Grid, List } from 'lucide-react'
import { type ReactNode, useState } from 'react'

const ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree' },
]

const ICON_ITEMS = [
  { value: 'list', label: 'List', icon: <List /> },
  { value: 'grid', label: 'Grid', icon: <Grid /> },
  { value: 'tree', label: 'Tree', icon: <GitBranch /> },
]

const LONG_ITEMS = [
  { value: 'list', label: 'Project overview' },
  { value: 'activity', label: 'Recent activity' },
  { value: 'permissions', label: 'Access permissions' },
  { value: 'integrations', label: 'Connected integrations' },
]

const DISABLED_ITEMS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'tree', label: 'Tree', disabled: true },
]

const ARABIC_ITEMS = [
  { value: 'list', label: 'قائمة' },
  { value: 'grid', label: 'شبكة' },
  { value: 'tree', label: 'شجرة' },
]

const ARABIC_LONG_ITEMS = [
  { value: 'overview', label: 'نظرة عامة على المشروع' },
  { value: 'activity', label: 'النشاط الأخير' },
  { value: 'permissions', label: 'أذونات الوصول' },
  { value: 'integrations', label: 'التكاملات المتصلة' },
]

function Demo({
  animateBackplate,
  initialValue = 'list',
  items = ITEMS,
  size,
  tabClassName,
  tone,
  variant,
}: {
  animateBackplate?: boolean
  initialValue?: string
  items?: { disabled?: boolean; label: string; value: string }[]
  size?: (typeof segmentedControlSizes)[number]
  tabClassName?: string
  tone?: (typeof segmentedControlTones)[number]
  variant?: (typeof segmentedControlVariants)[number]
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <SegmentedControl
      animateBackplate={animateBackplate}
      aria-label="View"
      items={items}
      onValueChange={setValue}
      size={size}
      tabClassName={tabClassName}
      tone={tone}
      value={value}
      variant={variant}
    />
  )
}

const meta = {
  title: 'UI React/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: { control: 'inline-radio', options: segmentedControlSizes },
    variant: { control: 'inline-radio', options: segmentedControlVariants },
    tone: { control: 'inline-radio', options: segmentedControlTones },
    animateBackplate: { control: 'boolean' },
  },
  args: {
    size: 'md',
    tone: 'neutral',
    variant: 'label',
    animateBackplate: true,
    // Required props; every story renders its own items and state.
    items: [],
    value: '',
    onValueChange: () => {},
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/* A radio group named "View": Tab enters at the selected segment and the arrow
   keys move and select. The APG radio pattern test plays this story, which
   starts on the second segment. */
export const Playground: Story = {
  render: ({ animateBackplate, size, tone, variant }) => (
    <Demo
      animateBackplate={animateBackplate}
      initialValue="grid"
      size={size}
      tone={tone}
      variant={variant}
    />
  ),
}

// Documents `animateBackplate` (default true) — set false to drop the indicator's
// sliding transition — and the `tabClassName` per-segment escape hatch.
export const Backplate: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo animateBackplate />
      <Demo animateBackplate={false} />
      <Demo tabClassName="uppercase" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {segmentedControlSizes.map(size => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

/* The selected segment of every scrolling track sits fully inside the track. */
function expectSelectedInView(canvasElement: HTMLElement, when: string) {
  for (const track of canvasElement.querySelectorAll<HTMLElement>(
    '[data-slot="segmented-control-track"]'
  )) {
    const selected = track.querySelector('[data-slot="segmented-control-item"][data-checked]')
    if (!selected) continue
    const box = track.getBoundingClientRect()
    const start = box.left + track.clientLeft
    const end = start + track.clientWidth
    const rect = selected.getBoundingClientRect()
    if (rect.left < start - 1 || rect.right > end + 1)
      throw new Error(
        `${when}: the selected segment (${rect.left}-${rect.right}) is clipped by its track (${start}-${end})`
      )
  }
}

const frame = () => new Promise(resolve => requestAnimationFrame(() => resolve(null)))

export const MobileOverflow: Story = {
  tags: ['!manifest'],
  render: () => (
    <UIProvider input="touch">
      <div style={{ maxWidth: 320, width: 'min(100%, calc(100vw - 2rem))' }}>
        <Demo initialValue="integrations" items={LONG_ITEMS} />
      </div>
    </UIProvider>
  ),
  /* The last segment starts selected, so the track scrolls it into view. */
  play: async ({ canvasElement }) => {
    await frame()
    const track = canvasElement.querySelector<HTMLElement>('[data-slot="segmented-control-track"]')
    if (!track || track.scrollWidth <= track.clientWidth)
      throw new Error('The overflow track does not scroll')
    expectSelectedInView(canvasElement, 'At rest')
  },
}

/* Rest, selected and a disabled segment (Tree) in light and dark. The Hover and
   FocusVisible stories capture the same rows with the first row's state forced
   (parameters.visualState, see apps/storybook/README.md). */
function StateRows() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['light', 'dark'] as const).map(mode => (
        <UIProvider key={mode} mode={mode}>
          <div
            data-mode-row={mode}
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-page)',
              display: 'flex',
              gap: 16,
              padding: 12,
            }}
          >
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 48 }}>
              {mode}
            </span>
            <Demo items={DISABLED_ITEMS} />
            <Demo items={DISABLED_ITEMS} tone="accent" />
          </div>
        </UIProvider>
      ))}
    </div>
  )
}

export const States: Story = {
  render: () => <StateRows />,
  play: async ({ canvasElement }) => {
    const disabled = canvasElement.querySelector(
      '[data-slot="segmented-control-item"][data-disabled]'
    )
    if (!disabled) throw new Error('No disabled segment rendered')
    if (!disabled.matches(':disabled') && disabled.getAttribute('aria-disabled') !== 'true')
      throw new Error('The disabled segment is not disabled for assistive technology')
  },
}

/* The visual project hovers Grid, the first unselected segment, with the real pointer. */
export const Hover: Story = {
  render: () => <StateRows />,
  parameters: {
    visualState: { hover: '[data-slot="segmented-control-item"]:not([data-checked])' },
  },
}

/* The visual project tabs into the first group, which focuses its selected segment. */
export const FocusVisible: Story = {
  render: () => <StateRows />,
  parameters: {
    visualState: { focusVisible: '[data-slot="segmented-control-item"][data-checked]' },
  },
}

/* Right to left, in a track that fits and in one that scrolls: the sliding plate
   covers the selected segment in both, at rest and after the track scrolls. */
export const RightToLeft: Story = {
  render: () => (
    <UIProvider dir="rtl">
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Demo initialValue="grid" items={ARABIC_ITEMS} />
        <div data-testid="rtl-overflow" style={{ maxWidth: 240 }}>
          <Demo initialValue="permissions" items={ARABIC_LONG_ITEMS} />
        </div>
      </div>
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    const expectCovered = (when: string) => {
      const controls = canvasElement.querySelectorAll('[data-slot="segmented-control"]')
      if (controls.length !== 2) throw new Error(`Expected 2 controls, found ${controls.length}`)
      for (const control of controls) {
        const selected = control.querySelector('[data-slot="segmented-control-item"][data-checked]')
        const plate = control.querySelector<HTMLElement>(
          '[data-slot="segmented-control-indicator"]'
        )
        if (!selected || !plate || plate.hidden)
          throw new Error(`${when}: no selected segment or plate`)
        const a = selected.getBoundingClientRect()
        const b = plate.getBoundingClientRect()
        if (Math.abs(a.left - b.left) > 1 || Math.abs(a.width - b.width) > 1)
          throw new Error(
            `${when}: the plate (${b.left}, ${b.width}) does not cover the selected segment (${a.left}, ${a.width})`
          )
      }
    }
    await frame()
    expectCovered('At rest')
    expectSelectedInView(canvasElement, 'At rest')
    const track = canvasElement.querySelector<HTMLElement>(
      '[data-testid="rtl-overflow"] [data-slot="segmented-control-track"]'
    )
    if (!track || track.scrollWidth <= track.clientWidth)
      throw new Error('The RTL overflow track does not scroll')
    /* Segments that resize after mount (a web font settling) keep the
       selection in view: grow the labels, then put them back. */
    const control = track.closest<HTMLElement>('[data-slot="segmented-control"]')
    control?.style.setProperty('--segment-font-size', '1.25rem')
    await frame()
    await frame()
    expectSelectedInView(canvasElement, 'After the segments grow')
    control?.style.removeProperty('--segment-font-size')
    await frame()
    await frame()
    expectSelectedInView(canvasElement, 'After the segments shrink back')
    // Let the plate finish sliding back before checking it covers the segment.
    await Promise.all(
      Array.from(canvasElement.querySelectorAll('[data-slot="segmented-control-indicator"]'))
        .flatMap(plate => plate.getAnimations())
        .map(animation => animation.finished)
    )
    const rest = track.scrollLeft
    track.scrollLeft = -(track.scrollWidth - track.clientWidth)
    await frame()
    expectCovered('Scrolled to the end')
    track.scrollLeft = 0
    await frame()
    expectCovered('Scrolled to the start')
    track.scrollLeft = rest
    await frame()
  },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo variant="label" />
      <Demo items={ICON_ITEMS} variant="icon" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo tone="neutral" />
      <Demo tone="accent" />
    </div>
  ),
}

/* Captured with forced colors on (Windows High Contrast): the selected segment
   of both tones takes the system selection colours. */
export const ForcedColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Demo tone="neutral" />
      <Demo tone="accent" />
      <Demo items={ICON_ITEMS} variant="icon" />
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
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
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
              <Demo tone="accent" />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

function PreviewCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        background: 'var(--a63-surface-panel)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--a63-text-primary)',
        display: 'grid',
        gap: '0.875rem',
        padding: '1rem',
      }}
    >
      <div
        style={{
          color: 'var(--a63-text-secondary)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.75rem',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="web / light / pointer">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="web / dark / pointer">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="light">
        <PreviewCard label="ios / light / touch">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch" mode="dark">
        <PreviewCard label="ios / dark / touch">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer" mode="light">
        <PreviewCard label="compact extension / light">
          <Demo />
        </PreviewCard>
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer" mode="dark">
        <PreviewCard label="compact extension / dark">
          <Demo />
        </PreviewCard>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(segmentedControlContract, null, 2)}
    </pre>
  ),
}
