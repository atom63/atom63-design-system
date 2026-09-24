import type { ReactNode } from 'react'
import { NoticeBlock } from '../../foundations/notice/notice-block'

export type KeyIdeaProps = {
  children: ReactNode
  className?: string
  label?: ReactNode
  title?: ReactNode
}

export function KeyIdea({ children, className, label = 'Key idea', title }: KeyIdeaProps) {
  return (
    <NoticeBlock body={children} className={className} label={label} mode="insight" title={title} />
  )
}
