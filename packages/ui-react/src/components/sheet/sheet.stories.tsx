import { sheetContract, themes } from '@atom63/ui-foundation'
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
  UIProvider,
} from '@atom63/ui-react'
import type { SheetSide } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useRef,
} from 'react'

const sides = ['right', 'left', 'top', 'bottom'] as const
type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

/* A labelled stage cell. It paints its own panel surface so the label reads
   against the cell's theme and mode, not the light page behind the story. */
const cellStyle: CSSProperties = {
  background: 'var(--a63-surface-panel)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--a63-text-primary)',
  display: 'grid',
  gap: 6,
  padding: 12,
}

/*
 * A fixed-height box that holds one open overlay. The transform makes the box
 * the containing block of the sheet's fixed-position backdrop and viewport, and
 * --a63-viewport-height sizes them to the box, so the sheet lays out as it
 * would over a short window. Staged sheets are non-modal: two open modal sheets
 * would each hide the other from assistive tech.
 */
function OverlayStage({
  children,
  height = 360,
  style,
}: {
  children: (container: RefObject<HTMLDivElement | null>) => ReactNode
  height?: number
  style?: CSSProperties
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      style={
        {
          ...style,
          '--a63-viewport-height': `${height}px`,
          background: 'var(--a63-surface-page)',
          blockSize: height,
          borderRadius: 'var(--radius-lg)',
          color: 'var(--a63-text-primary)',
          overflow: 'hidden',
          position: 'relative',
          transform: 'translateZ(0)',
        } as CSSProperties
      }
    >
      {children(containerRef)}
    </div>
  )
}

function StagedSheet({
  cancelLabel = 'Cancel',
  closeLabel,
  description = 'A raised overlay surface tinted by this context.',
  footer = 'default',
  label,
  saveLabel = 'Save',
  side = 'right',
  stageStyle,
  title = 'Appearance',
  variant = 'default',
}: {
  cancelLabel?: string
  closeLabel?: string
  description?: string
  footer?: 'default' | 'bare'
  label: string
  saveLabel?: string
  side?: SheetSide
  stageStyle?: CSSProperties
  title?: string
  variant?: 'default' | 'inset'
}) {
  return (
    <div style={cellStyle}>
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>{label}</span>
      <OverlayStage style={stageStyle}>
        {container => (
          <Sheet defaultOpen modal={false}>
            <SheetContent
              closeProps={closeLabel ? { 'aria-label': closeLabel } : undefined}
              initialFocus={false}
              portalProps={{ container }}
              side={side}
              variant={variant}
            >
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>{description}</SheetDescription>
              </SheetHeader>
              <SheetPanel>
                <p style={{ color: 'var(--a63-text-secondary)' }}>
                  Content scrolls inside the panel.
                </p>
              </SheetPanel>
              <SheetFooter variant={footer}>
                <SheetClose render={<Button variant="secondary">{cancelLabel}</Button>} />
                <SheetClose render={<Button variant="primary">{saveLabel}</Button>} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </OverlayStage>
    </div>
  )
}

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  return (
    <UIProvider {...providerProps}>
      <StagedSheet label={label} variant="inset" />
    </UIProvider>
  )
}

const meta = {
  title: 'UI React/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary">Open sheet</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>Slides in from the edge. Press Esc to dismiss.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p style={{ color: 'var(--a63-text-secondary)' }}>
            The sheet is a raised overlay surface. Content scrolls inside the panel.
          </p>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="secondary">Cancel</Button>} />
          <SheetClose render={<Button variant="primary">Save</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** The sheet open as an app shows it: modal, over the whole page. */
export const Open: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>Slides in from the edge. Press Esc to dismiss.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p style={{ color: 'var(--a63-text-secondary)' }}>
            The sheet is a raised overlay surface. Content scrolls inside the panel.
          </p>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="secondary">Cancel</Button>} />
          <SheetClose render={<Button variant="primary">Save</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** Each side, open. */
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {sides.map(side => (
        <StagedSheet key={side} label={side} side={side} />
      ))}
    </div>
  ),
}

/* Right-to-left: `left` and `right` are screen edges, so a left sheet still
   docks to the left edge and slides in from it, while its content reads right
   to left. */
export const RightToLeft: Story = {
  render: () => {
    const portalContainerRef = useRef<HTMLDivElement>(null)
    return (
      <UIProvider dir="rtl" lang="ar" ref={portalContainerRef}>
        <Sheet defaultOpen>
          <SheetTrigger render={<Button variant="secondary">فتح اللوحة</Button>} />
          <SheetContent
            closeProps={{ 'aria-label': 'إغلاق' }}
            portalProps={{ container: portalContainerRef }}
            side="left"
          >
            <SheetHeader>
              <SheetTitle>المظهر</SheetTitle>
              <SheetDescription>تثبت اللوحة على الحافة اليسرى.</SheetDescription>
            </SheetHeader>
            <SheetPanel>
              <p style={{ color: 'var(--a63-text-secondary)' }}>
                يقرأ المحتوى من اليمين إلى اليسار.
              </p>
            </SheetPanel>
            <SheetFooter>
              <SheetClose render={<Button variant="secondary">إلغاء</Button>} />
              <SheetClose render={<Button variant="primary">حفظ</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </UIProvider>
    )
  },
}

/*
 * The logical sides follow the text direction: `inline-start` docks to the left
 * edge in left-to-right and to the right edge in right-to-left, and
 * `inline-end` the other way round. The play function checks the edges.
 */
export const LogicalSides: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <StagedSheet label="ltr / inline-start" side="inline-start" />
      <UIProvider dir="rtl" lang="ar">
        <StagedSheet
          cancelLabel="إلغاء"
          closeLabel="إغلاق"
          description="تفتح اللوحة من حافة بداية القراءة."
          label="rtl / inline-start"
          saveLabel="حفظ"
          side="inline-start"
          title="المظهر"
        />
      </UIProvider>
      <UIProvider dir="rtl" lang="ar">
        <StagedSheet
          cancelLabel="إلغاء"
          closeLabel="إغلاق"
          description="تفتح اللوحة من حافة نهاية القراءة."
          label="rtl / inline-end"
          saveLabel="حفظ"
          side="inline-end"
          title="المظهر"
        />
      </UIProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const popups = await waitForPopups(canvasElement, 3)
    const expected = ['left', 'right', 'left'] as const
    popups.forEach((popup, index) => {
      const stage = popup.closest<HTMLElement>('[style*="translateZ"]')
      if (!stage) throw new Error('Expected the overlay stage')
      const box = popup.getBoundingClientRect()
      const frame = stage.getBoundingClientRect()
      const edge =
        Math.abs(box.left - frame.left) < 1
          ? 'left'
          : Math.abs(box.right - frame.right) < 1
            ? 'right'
            : 'none'
      if (edge !== expected[index]) {
        throw new Error(`Expected sheet ${index + 1} at the ${expected[index]} edge, got ${edge}`)
      }
    })
  },
}

async function waitForPopups(root: HTMLElement, count: number): Promise<HTMLElement[]> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const popups = [...root.querySelectorAll<HTMLElement>('.a63-Sheet-popup')]
    if (popups.length === count) return popups
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error(`Expected ${count} open sheets`)
}

/* Keyboard focus on the built-in close button. */
export const FocusVisibleClose: Story = {
  render: () => <StagedSheet label="focused close" />,
  parameters: { visualState: { focusVisible: '.a63-Sheet-close-button' } },
}

/* A long title in both directions: it wraps before the close button's corner
   instead of running under it. */
export const LongTitle: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <StagedSheet
        label="ltr / long title"
        title="Appearance and accessibility preferences for every workspace you belong to"
      />
      <UIProvider dir="rtl" lang="ar">
        <StagedSheet
          cancelLabel="إلغاء"
          closeLabel="إغلاق"
          description="سطح عائم مرتفع يتلون بحسب هذا السياق."
          label="rtl / long title"
          saveLabel="حفظ"
          side="left"
          title="تفضيلات المظهر وإمكانية الوصول لكل مساحة عمل تنتمي إليها"
        />
      </UIProvider>
    </div>
  ),
}

/* Phone safe-area insets (a notch and a home indicator), as an iPhone reports
   them. */
const phoneSafeArea = {
  '--a63-safe-area-top': '47px',
  '--a63-safe-area-bottom': '34px',
} as CSSProperties

/* At phone width on touch, the sheet's main use (a mobile nav menu): from the
   bottom and from the right, with the safe-area insets applied. */
export const OpenPhone: Story = {
  render: () => (
    <UIProvider designLanguage="ios" input="touch">
      <div style={{ display: 'grid', gap: 12 }}>
        <StagedSheet label="bottom" side="bottom" stageStyle={phoneSafeArea} />
        <StagedSheet label="right" side="right" stageStyle={phoneSafeArea} />
      </div>
    </UIProvider>
  ),
}

export const Inset: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {sides.map(side => (
        <StagedSheet key={side} label={`inset / ${side}`} side={side} variant="inset" />
      ))}
    </div>
  ),
}

export const BareFooter: Story = {
  render: () => <StagedSheet footer="bare" label="bare footer" />,
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell label="Web" providerProps={{ designLanguage: 'web', input: 'pointer' }} />
      <ReviewCell label="iOS touch" providerProps={{ designLanguage: 'ios', input: 'touch' }} />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(sheetContract, null, 2)}
    </pre>
  ),
}
