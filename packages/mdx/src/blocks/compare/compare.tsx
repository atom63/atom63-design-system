import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import {
  FramedBlock,
  FramedBlockHeader,
  MdxFrameItemPanel,
  type MdxFrameItemTone,
} from '../../foundations/frame/framed-block'
import { createSlot, pickRest, pickSlot } from '../../primitives/slots'
import { CodeBlockVariantProvider } from '../code-block-variant-context'

const CompareTitleSlot = createSlot('compare-title')
const CompareDescriptionSlot = createSlot('compare-description')

const HEADER_SLOTS = [CompareTitleSlot, CompareDescriptionSlot]

export type CompareProps = {
  children: ReactNode
  className?: string
  description?: ReactNode
  title?: ReactNode
}

export type CompareItemProps = {
  children: ReactNode
  className?: string
  eyebrow?: ReactNode
  title: ReactNode
  tone?: MdxFrameItemTone
}

function CompareItem({ children, className, eyebrow, title, tone = 'neutral' }: CompareItemProps) {
  return (
    <MdxFrameItemPanel
      bodyClassName="mdx-compare-item-body"
      className={clsx('mdx-compare-item', className)}
      eyebrow={eyebrow}
      title={title}
      tone={tone}
    >
      <CodeBlockVariantProvider variant="embedded">{children}</CodeBlockVariantProvider>
    </MdxFrameItemPanel>
  )
}

function Compare({ children, className, description, title }: CompareProps) {
  const slotTitle = pickSlot(children, CompareTitleSlot)
  const slotDescription = pickSlot(children, CompareDescriptionSlot)
  const items = pickRest(children, HEADER_SLOTS)

  const resolvedTitle = slotTitle ?? title
  const resolvedDescription = slotDescription ?? description

  return (
    <FramedBlock className={className} frameClassName="mdx-compare-frame">
      <FramedBlockHeader
        className="mdx-compare-header"
        description={resolvedDescription}
        descriptionClassName="mdx-compare-description max-w-prose leading-relaxed text-pretty"
        title={resolvedTitle}
        titleClassName="mdx-compare-title text-base leading-tight text-wrap"
      />
      <div className="grid min-w-0 gap-2 md:grid-cols-2">{items}</div>
    </FramedBlock>
  )
}

Compare.Item = CompareItem
Compare.Title = CompareTitleSlot
Compare.Description = CompareDescriptionSlot

export { Compare }
