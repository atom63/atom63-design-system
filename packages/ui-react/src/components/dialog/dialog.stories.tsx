import { dialogContract, dialogSizes, themes } from '@atom63/ui-foundation'
import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useRef,
} from 'react'

const meta = {
  title: 'UI React/Dialog',
  component: Dialog,
  decorators: [
    Story => (
      <div style={{ display: 'flex', gap: 24, padding: 48 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/*
 * `open` renders the dialog open on load so the visual and axe runs capture the
 * popup, not the trigger. `modal` is the dialog as an app shows it, over the
 * whole page (one per story). `inline` is non-modal and belongs inside an
 * OverlayStage, so several open dialogs can share one capture: two open modal
 * dialogs would each hide the other from assistive tech.
 */
type OpenMode = 'modal' | 'inline'

function RenameDialog({
  cancelLabel = 'Cancel',
  closeLabel,
  description = 'Give this project a new, memorable name.',
  open,
  panel,
  portalContainerRef,
  saveLabel = 'Save',
  size = 'md',
  title = 'Rename project',
  triggerLabel = 'Rename project',
}: {
  cancelLabel?: string
  closeLabel?: string
  description?: string
  open?: OpenMode
  panel?: ReactNode
  portalContainerRef?: RefObject<HTMLDivElement | null>
  saveLabel?: string
  size?: (typeof dialogSizes)[number]
  title?: string
  triggerLabel?: string
}) {
  return (
    <Dialog defaultOpen={open !== undefined} modal={open === 'inline' ? false : undefined}>
      {open ? null : <DialogTrigger render={<Button variant="outline">{triggerLabel}</Button>} />}
      <DialogPopup
        closeProps={closeLabel ? { 'aria-label': closeLabel } : undefined}
        initialFocus={open === 'inline' ? false : undefined}
        portalProps={{ container: portalContainerRef }}
        size={size}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {panel ?? <p style={{ margin: 0 }}>Any content can live in the scrollable panel.</p>}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">{cancelLabel}</Button>} />
          <DialogClose render={<Button variant="primary">{saveLabel}</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

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
 * the containing block of the popup's fixed-position backdrop and viewport, and
 * --a63-viewport-height sizes them to the box, so the overlay lays out as it
 * would over a short window.
 */
function OverlayStage({
  children,
  height = 340,
}: {
  children: (container: RefObject<HTMLDivElement | null>) => ReactNode
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      style={
        {
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

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  return (
    <UIProvider {...providerProps}>
      <div style={cellStyle}>
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{label}</span>
        <OverlayStage>
          {container => <RenameDialog open="inline" portalContainerRef={container} />}
        </OverlayStage>
      </div>
    </UIProvider>
  )
}

export const Playground: Story = {
  render: () => <RenameDialog triggerLabel="Open dialog" />,
}

/** The dialog open as an app shows it: modal, centred over the page. */
export const Open: Story = {
  render: () => <RenameDialog open="modal" />,
}

/** Below `sm` the default popup sticks to the bottom edge. */
export const OpenPhone: Story = {
  render: () => <RenameDialog open="modal" />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      {dialogSizes.map(size => (
        <div key={size} style={cellStyle}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>{size}</span>
          <OverlayStage>
            {container => <RenameDialog open="inline" portalContainerRef={container} size={size} />}
          </OverlayStage>
        </div>
      ))}
    </div>
  ),
}

export const BareFooter: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogPopup mobilePlacement="center">
        <DialogHeader>
          <DialogTitle>Centered on mobile</DialogTitle>
          <DialogDescription>This popup stays centered at every breakpoint.</DialogDescription>
        </DialogHeader>
        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="primary">Got it</Button>} />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
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
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <ReviewCell
        label="Web"
        providerProps={{ density: 'comfortable', designLanguage: 'web', input: 'pointer' }}
      />
      <ReviewCell
        label="iOS touch"
        providerProps={{ density: 'comfortable', designLanguage: 'ios', input: 'touch' }}
      />
      <ReviewCell
        label="Compact extension"
        providerProps={{
          density: 'compact',
          designLanguage: 'web',
          input: 'pointer',
          surface: 'n2',
        }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectTouchCloseTarget(canvasElement)
  },
}

async function waitFor<T>(find: () => T | null | undefined, what: string): Promise<T> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const found = find()
    if (found) return found
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error(`Expected ${what}`)
}

/* On a coarse pointer the close button's hit-area pseudo is at least 44px. */
async function expectTouchCloseTarget(root: HTMLElement) {
  const close = await waitFor(
    () => root.querySelector<HTMLElement>('[data-a63-input="touch"] .a63-Dialog-close-button'),
    'the close button inside the touch region'
  )
  const hitArea = getComputedStyle(close, '::before')
  const width = Number.parseFloat(hitArea.width)
  const height = Number.parseFloat(hitArea.height)
  if (!(width >= 44 && height >= 44)) {
    throw new Error(`Expected a 44px close hit area, got ${width}x${height}`)
  }
}

/* Keyboard focus on the built-in close button, beside a dialog at rest. */
export const FocusVisibleClose: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <div style={cellStyle}>
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>focused close</span>
        <OverlayStage>
          {container => <RenameDialog open="inline" portalContainerRef={container} />}
        </OverlayStage>
      </div>
    </div>
  ),
  parameters: { visualState: { focusVisible: '.a63-Dialog-close-button' } },
}

/* The built-in close button under the pointer. */
export const HoverClose: Story = {
  render: () => <RenameDialog open="modal" />,
  parameters: { visualState: { hover: '.a63-Dialog-close-button' } },
}

const longPanel = (
  <div style={{ display: 'grid', gap: 12 }}>
    {Array.from({ length: 12 }, (_, index) => (
      <p key={index} style={{ margin: 0 }}>
        Paragraph {index + 1}: the panel scrolls between the header and the footer, and its edge
        fades where more content is out of view.
      </p>
    ))}
    {/* Focusable content keeps the scrolled region reachable from the keyboard. */}
    <Button variant="outline">Read the full terms</Button>
  </div>
)

/* The fade sizes the panel's scroll timeline resolves to, in px. */
function panelFades(panel: HTMLElement) {
  const style = getComputedStyle(panel)
  return {
    end: Number.parseFloat(style.getPropertyValue('--a63-dialog-panel-fade-end')),
    start: Number.parseFloat(style.getPropertyValue('--a63-dialog-panel-fade-start')),
  }
}

/*
 * scrollFade (on by default): a long panel at the top fades at its bottom edge
 * only; scrolled to the middle it fades at both edges.
 */
export const ScrollFade: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      {(['top', 'middle'] as const).map(position => (
        <div data-scroll-position={position} key={position} style={cellStyle}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>
            scrolled to the {position}
          </span>
          <OverlayStage height={420}>
            {container => (
              <RenameDialog open="inline" panel={longPanel} portalContainerRef={container} />
            )}
          </OverlayStage>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panelAt = (position: string) =>
      canvasElement.querySelector<HTMLElement>(
        `[data-scroll-position="${position}"] .a63-Dialog-panel`
      )
    const top = await waitFor(() => panelAt('top'), 'the top panel')
    const middle = await waitFor(() => panelAt('middle'), 'the middle panel')
    if (middle.scrollHeight <= middle.clientHeight) throw new Error('Expected the panel to scroll')
    middle.scrollTop = (middle.scrollHeight - middle.clientHeight) / 2
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const atTop = panelFades(top)
    if (!(atTop.start === 0 && atTop.end > 0)) {
      throw new Error(`Expected a bottom fade only at the top, got ${JSON.stringify(atTop)}`)
    }
    const atMiddle = panelFades(middle)
    if (!(atMiddle.start > 0 && atMiddle.end > 0)) {
      throw new Error(`Expected both fades in the middle, got ${JSON.stringify(atMiddle)}`)
    }
  },
}

/*
 * Right-to-left with a long Arabic title, and a long CJK title: the close button
 * sits at the inline end, the header leaves room for it, and the title wraps.
 * The close button's name is passed through closeProps['aria-label'].
 */
export const RightToLeft: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, inlineSize: '100%' }}>
      <UIProvider dir="rtl" lang="ar">
        <div style={cellStyle}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>rtl / ar</span>
          <OverlayStage height={380}>
            {container => (
              <RenameDialog
                cancelLabel="إلغاء"
                closeLabel="إغلاق"
                description="امنح هذا المشروع اسمًا جديدًا يسهل تذكره."
                open="inline"
                portalContainerRef={container}
                saveLabel="حفظ"
                title="إعادة تسمية مشروع المراجعة الربعية للفريق بأكمله قبل الاجتماع القادم"
              />
            )}
          </OverlayStage>
        </div>
      </UIProvider>
      <UIProvider lang="ja">
        <div style={cellStyle}>
          <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)' }}>ltr / ja</span>
          <OverlayStage height={380}>
            {container => (
              <RenameDialog
                cancelLabel="キャンセル"
                closeLabel="閉じる"
                description="このプロジェクトに覚えやすい新しい名前を付けてください。"
                open="inline"
                portalContainerRef={container}
                saveLabel="保存"
                title="チーム全体の四半期レビュープロジェクトの名前を次の会議の前に変更する"
              />
            )}
          </OverlayStage>
        </div>
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(dialogContract, null, 2)}
    </pre>
  ),
}
