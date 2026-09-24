import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { MdxFrame, MdxFramePanel } from '../frame/framed-block'

export type SequenceBlockProps = {
  children: ReactNode
  className?: string
}

export function SequenceBlock({ children, className }: SequenceBlockProps) {
  return (
    <MdxFrame className={className}>
      <MdxFramePanel>
        <ol className="grid gap-0">{children}</ol>
      </MdxFramePanel>
    </MdxFrame>
  )
}

export type SequenceBodyProps = {
  children: ReactNode
  className?: string
  title: ReactNode
}

export function SequenceBody({ children, className, title }: SequenceBodyProps) {
  return (
    <div className={clsx('min-w-0 pb-6 group-last:pb-0', className)}>
      <h3 className="mdx-steps-title text-base leading-snug font-semibold text-wrap">{title}</h3>
      <div className="mdx-steps-body mt-1.5 text-sm leading-relaxed text-pretty [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}

export function SequenceSpine() {
  return <span aria-hidden className="mdx-steps-spine mt-1 w-px flex-1 group-last:hidden" />
}
