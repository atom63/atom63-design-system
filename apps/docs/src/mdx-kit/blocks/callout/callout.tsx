import type { ReactNode } from 'react'
import { NoticeBlock } from '../../foundations/notice/notice-block'
import type { CalloutType } from '../../mdx-styles'
import { createSlot, hasSlot, pickRest, pickSlot } from '../../primitives/slots'

export type CalloutProps = {
  children: ReactNode
  className?: string
  type?: CalloutType
}

const CalloutIcon = createSlot('callout-icon')
const CalloutTitle = createSlot('callout-title')
const CalloutBody = createSlot('callout-body')
const CalloutActions = createSlot('callout-actions')

const SLOTS = [CalloutIcon, CalloutTitle, CalloutBody, CalloutActions]

export function Callout({ children, type = 'info', className }: CalloutProps) {
  const icon = pickSlot(children, CalloutIcon)
  const title = pickSlot(children, CalloutTitle)
  const body = pickSlot(children, CalloutBody)
  const actions = pickSlot(children, CalloutActions)
  const rest = pickRest(children, SLOTS)
  const usesSlots = SLOTS.some(slot => hasSlot(children, slot))

  return usesSlots ? (
    <NoticeBlock
      actions={actions ?? undefined}
      body={
        body !== null || rest.length > 0 ? (
          <>
            {body}
            {rest.length > 0 ? rest : null}
          </>
        ) : undefined
      }
      className={className}
      icon={icon ?? undefined}
      mode="callout"
      title={title ?? undefined}
      tone={type}
    />
  ) : (
    <NoticeBlock className={className} mode="callout" tone={type}>
      {children}
    </NoticeBlock>
  )
}

Callout.Icon = CalloutIcon
Callout.Title = CalloutTitle
Callout.Body = CalloutBody
Callout.Actions = CalloutActions
