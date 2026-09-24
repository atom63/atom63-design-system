import { CopyButton } from '@atom63/ui-react'
import { clsx } from 'clsx'
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react'
import { ExampleContainer } from '../../example-container'
import { TechnicalFrame } from '../../foundations/frame/framed-block'
import { mdxStyles } from '../../mdx-styles'
import { createSlot, pickRest, pickSlot } from '../../primitives/slots'
import { DocExampleCode } from '../doc-example-code'

const DocExampleTitleSlot = createSlot('doc-example-title')
const DocExamplePreviewSlot = createSlot('doc-example-preview')
const DocExampleCodeSlot = createSlot('doc-example-code')

const DOC_EXAMPLE_SLOTS = [DocExampleTitleSlot, DocExamplePreviewSlot, DocExampleCodeSlot]

export type DocExampleProps = {
  align?: 'left' | 'center'
  children: ReactNode
  className?: string
  code: string
  /** Label for the code tab (default: "Code"). */
  codeLabel?: string
  /** aria-label for the copy control when idle (default: "Copy example code"). */
  copyCodeLabel?: string
  /** aria-label for the copy control right after copying (default: "Copied to clipboard"). */
  copiedLabel?: string
  /** Visually-hidden live-region text announced after copying (default: "Example code copied"). */
  copiedAnnouncement?: string
  lang?: string
  /** Label for the preview tab (default: "Preview"). */
  previewLabel?: string
  title?: string
  wide?: boolean
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

const tabButtonClass =
  'mdx-doc-example-tab h-11 px-3 font-medium text-xs transition-colors motion-reduce:transition-none md:h-7'

export function DocExample({
  title,
  code,
  codeLabel = 'Code',
  copyCodeLabel = 'Copy example code',
  copiedLabel = 'Copied to clipboard',
  copiedAnnouncement = 'Example code copied',
  lang,
  previewLabel = 'Preview',
  children,
  className,
  align = 'center',
  wide = false,
}: DocExampleProps) {
  const baseId = useId()
  const previewId = `${baseId}-preview`
  const codeId = `${baseId}-code`
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  const slotTitle = pickSlot(children, DocExampleTitleSlot)
  const slotPreview = pickSlot(children, DocExamplePreviewSlot)
  const slotCode = pickSlot(children, DocExampleCodeSlot)
  const restChildren = pickRest(children, DOC_EXAMPLE_SLOTS)

  // Slots win over props; otherwise fall back to prop/bare-children behavior.
  const resolvedTitle = slotTitle ?? title
  const titleString = typeof resolvedTitle === 'string' ? resolvedTitle : undefined
  const previewContent = slotPreview ?? restChildren
  const codeContent = slotCode ?? <DocExampleCode code={code} lang={lang} />

  const headingId = titleString ? slugifyTitle(titleString) : undefined
  const previewTabRef = useRef<HTMLButtonElement>(null)
  const codeTabRef = useRef<HTMLButtonElement>(null)

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextTab = (() => {
      if (event.key === 'Home') {
        return 'preview'
      }

      if (event.key === 'End') {
        return 'code'
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        return tab === 'preview' ? 'code' : 'preview'
      }

      return null
    })()

    if (!nextTab) {
      return
    }

    event.preventDefault()
    setTab(nextTab)
    window.requestAnimationFrame(() => {
      const nextRef = nextTab === 'preview' ? previewTabRef : codeTabRef
      nextRef.current?.focus()
    })
  }

  return (
    <figure
      className={clsx(
        'doc-example not-prose',
        resolvedTitle ? 'scroll-mt-24' : null,
        resolvedTitle ? mdxStyles.spacing.media : mdxStyles.spacing.block,
        className
      )}
      data-mdx-width="wide"
      id={headingId}
    >
      {resolvedTitle ? (
        <figcaption
          className="mdx-doc-example-title mb-2.5 text-sm font-medium tracking-tight"
          data-slot="title"
        >
          {resolvedTitle}
        </figcaption>
      ) : null}

      <TechnicalFrame
        className="doc-example-shell"
        headerClassName="gap-4 px-4 py-0.5 md:py-1.5"
        headerEnd={
          <div
            className={clsx(
              'flex shrink-0 items-center justify-center',
              tab !== 'code' && 'pointer-events-none opacity-0'
            )}
          >
            <CopyButton
              aria-hidden={tab !== 'code'}
              className="size-11 md:size-7"
              copiedLabel={copiedLabel}
              label={copyCodeLabel}
              size="icon-sm"
              successMessage={copiedAnnouncement}
              tabIndex={tab === 'code' ? 0 : -1}
              value={code.trim()}
              variant="ghost"
            />
          </div>
        }
        headerStart={
          <div
            aria-label={titleString ? `${titleString} example view` : 'Component example view'}
            className="mdx-doc-example-tablist inline-flex h-12 items-center p-0.5 md:h-8"
            onKeyDown={handleTabKeyDown}
            role="tablist"
            tabIndex={-1}
          >
            <button
              aria-controls={previewId}
              aria-selected={tab === 'preview'}
              className={tabButtonClass}
              data-active={tab === 'preview'}
              id={`${baseId}-tab-preview`}
              ref={previewTabRef}
              role="tab"
              tabIndex={tab === 'preview' ? 0 : -1}
              type="button"
              onClick={() => {
                setTab('preview')
              }}
            >
              {previewLabel}
            </button>
            <button
              aria-controls={codeId}
              aria-selected={tab === 'code'}
              className={tabButtonClass}
              data-active={tab === 'code'}
              id={`${baseId}-tab-code`}
              ref={codeTabRef}
              role="tab"
              tabIndex={tab === 'code' ? 0 : -1}
              type="button"
              onClick={() => {
                setTab('code')
              }}
            >
              {codeLabel}
            </button>
          </div>
        }
        panelClassName="overflow-hidden p-0"
      >
        {tab === 'preview' ? (
          <div
            aria-labelledby={`${baseId}-tab-preview`}
            className="doc-example-preview mdx-doc-example-preview"
            id={previewId}
            role="tabpanel"
          >
            <ExampleContainer align={align} embedded wide={wide}>
              {previewContent}
            </ExampleContainer>
          </div>
        ) : (
          <div
            aria-labelledby={`${baseId}-tab-code`}
            className="doc-example-code"
            id={codeId}
            role="tabpanel"
          >
            {codeContent}
          </div>
        )}
      </TechnicalFrame>
    </figure>
  )
}

DocExample.Title = DocExampleTitleSlot
DocExample.Preview = DocExamplePreviewSlot
DocExample.Code = DocExampleCodeSlot
