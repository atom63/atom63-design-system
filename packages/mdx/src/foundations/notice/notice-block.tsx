import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { type CalloutType, mdxStyles } from '../../mdx-styles'
import {
  MdxFrame,
  MdxFrameDescription,
  MdxFrameHeader,
  MdxFramePanel,
  MdxFrameTitle,
} from '../frame/framed-block'

type CalloutNoticeProps = {
  actions?: ReactNode
  body?: ReactNode
  children?: ReactNode
  className?: string
  icon?: ReactNode
  mode: 'callout'
  title?: ReactNode
  tone?: CalloutType
}

type InsightNoticeProps = {
  body: ReactNode
  className?: string
  label?: ReactNode
  mode: 'insight'
  title?: ReactNode
}

export type NoticeBlockProps = CalloutNoticeProps | InsightNoticeProps

export function NoticeBlock(props: NoticeBlockProps) {
  if (props.mode === 'insight') {
    const { body, className, label = 'Key idea', title } = props
    return (
      <MdxFrame as="aside" className={className} frameClassName="mdx-insight-frame">
        <MdxFrameHeader>
          <MdxFrameDescription className="mdx-insight-eyebrow font-mono text-xs tracking-wider uppercase">
            {label}
          </MdxFrameDescription>
          {title ? (
            <MdxFrameTitle className="mdx-insight-title mt-2 text-xl leading-tight tracking-tight text-wrap">
              {title}
            </MdxFrameTitle>
          ) : null}
        </MdxFrameHeader>
        <MdxFramePanel className="mdx-insight-panel">
          <div className="mdx-insight-body max-w-prose text-base leading-relaxed text-pretty [&_p]:mt-3 [&_strong]:font-semibold [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {body}
          </div>
        </MdxFramePanel>
      </MdxFrame>
    )
  }

  const { actions, body, children, className, icon, title, tone = 'info' } = props
  const hasStructure =
    icon !== undefined || title !== undefined || body !== undefined || actions !== undefined

  return (
    <div
      className={clsx('callout not-mdx', mdxStyles.layout.callout.base, className)}
      data-tone={tone}
    >
      {hasStructure ? (
        <div className="flex gap-2.5">
          {icon !== undefined ? (
            <div className="shrink-0 pt-0.5" data-slot="icon">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            {title !== undefined ? (
              <div
                className="mdx-callout-title text-base leading-6 font-semibold"
                data-slot="title"
              >
                {title}
              </div>
            ) : null}
            {body !== undefined ? (
              <div className={title !== undefined ? 'mt-1' : undefined} data-slot="body">
                {body}
              </div>
            ) : null}
            {actions !== undefined ? (
              <div className="mt-3 flex gap-2" data-slot="actions">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
