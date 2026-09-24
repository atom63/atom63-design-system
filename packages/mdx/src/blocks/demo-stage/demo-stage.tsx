import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { MdxFrame, MdxFrameHeader, MdxFramePanel } from '../../foundations/frame/framed-block'

export type DemoStageProps = {
  children: ReactNode
  className?: string
  headerEnd?: ReactNode
  headerStart?: ReactNode
  panelClassName?: string
}

export const DemoStage = forwardRef<HTMLElement, DemoStageProps>(function DemoStage(
  { children, className, headerEnd, headerStart, panelClassName },
  ref
) {
  const hasHeader = Boolean(headerStart || headerEnd)

  return (
    <MdxFrame
      className={clsx('demo-stage', className)}
      frameClassName="mdx-demo-stage-frame"
      ref={ref}
      spacing="media"
      width="wide"
    >
      {hasHeader ? (
        <MdxFrameHeader className="mdx-demo-stage-header flex-row items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">{headerStart}</div>
          {headerEnd ? <div className="flex shrink-0 items-center gap-1.5">{headerEnd}</div> : null}
        </MdxFrameHeader>
      ) : null}
      <MdxFramePanel
        className={clsx(
          'mdx-demo-stage not-prose flex aspect-[4/3] items-center justify-center overflow-hidden px-4 md:aspect-video md:px-10',
          panelClassName
        )}
      >
        {children}
      </MdxFramePanel>
    </MdxFrame>
  )
})
