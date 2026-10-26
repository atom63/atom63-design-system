'use client'

import { type ChatComposerStatus } from '@atom63/ui-foundation'
import { ArrowUp, Square } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
  type InputGroupTextareaProps,
} from '../input/input-group'

export type ChatComposerProps = Omit<
  React.ComponentProps<'form'>,
  'children' | 'defaultValue' | 'onChange' | 'onSubmit'
> & {
  /** Controls after the attach slot and before the send button, such as a model picker or a mic button. */
  actions?: React.ReactNode
  /** A leading control in the toolbar, usually a `+` button that attaches a file. */
  attach?: React.ReactNode
  /** The starting text when the composer owns its value. */
  defaultValue?: string
  /** Disables the field and the send button. */
  disabled?: boolean
  /** A line under the field, such as "AI can make mistakes. Check important info." */
  footnote?: React.ReactNode
  /** The field's accessible name. Defaults to "Message". */
  label?: string
  /** Called with the new text on every change. */
  onValueChange?: (value: string) => void
  /** Called when the reader stops a reply with the stop button. */
  onStop?: () => void
  /**
   * Called with the text when the reader sends it, with the send button or
   * Enter. When the composer owns its value it clears the field after.
   */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** Replaces the send icon (an arrow). */
  sendIcon?: React.ReactNode
  /** The send button's accessible name. Defaults to "Send message". */
  sendLabel?: string
  /** `submitted` or `streaming` turns the send button into a stop button. Defaults to idle. */
  status?: ChatComposerStatus
  /** Replaces the stop icon (a square). */
  stopIcon?: React.ReactNode
  /** The stop button's accessible name. Defaults to "Stop response". */
  stopLabel?: string
  /** Props for the textarea, such as `ref`, `name`, `autoFocus` or `maxLength`. */
  textareaProps?: Omit<
    InputGroupTextareaProps,
    'defaultValue' | 'disabled' | 'onChange' | 'placeholder' | 'value'
  >
  /** The text, when the host owns it (pair it with `onValueChange`). */
  value?: string
}

/*
 * The message field at the bottom of a chat: a rounded field with a textarea
 * that grows with its text, a toolbar under it with the attach slot on the
 * leading side and the send button on the trailing side. Enter sends and
 * Shift+Enter starts a new line (an input method's composition is left
 * alone). While a reply is submitted or streaming, the send button becomes a
 * stop button and Enter does not send. Built from InputGroup, Textarea and
 * Button; it sends nothing itself, `onSubmit` hands the text to the host.
 */
export function ChatComposer({
  actions,
  attach,
  className,
  defaultValue = '',
  disabled = false,
  footnote,
  label = 'Message',
  onStop,
  onSubmit,
  onValueChange,
  placeholder,
  sendIcon,
  sendLabel = 'Send message',
  status = 'idle',
  stopIcon,
  stopLabel = 'Stop response',
  textareaProps,
  value: valueProp,
  ...props
}: ChatComposerProps): React.ReactElement {
  const [ownValue, setOwnValue] = React.useState(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : ownValue
  const busy = status !== 'idle'
  const canSend = !disabled && !busy && value.trim() !== ''

  const setValue = (next: string) => {
    if (!controlled) setOwnValue(next)
    onValueChange?.(next)
  }

  const send = () => {
    if (!canSend) return
    onSubmit?.(value)
    if (!controlled) setOwnValue('')
  }

  const { onKeyDown, ...fieldProps } = textareaProps ?? {}

  return (
    <form
      className={cn('a63-ChatComposer', className)}
      data-disabled={disabled ? '' : undefined}
      data-slot="chat-composer"
      data-status={status}
      onSubmit={event => {
        event.preventDefault()
        send()
      }}
      {...props}
    >
      <InputGroup className="a63-ChatComposer-group" disabled={disabled}>
        <InputGroupTextarea
          aria-label={label}
          data-slot="chat-composer-field"
          rows={1}
          textareaClassName="a63-ChatComposer-field"
          {...fieldProps}
          disabled={disabled}
          onChange={event => setValue(event.currentTarget.value)}
          onKeyDown={event => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
            event.preventDefault()
            send()
          }}
          placeholder={placeholder}
          value={value}
        />
        <InputGroupAddon align="block-end" className="a63-ChatComposer-toolbar">
          {attach ? (
            <div className="a63-ChatComposer-attach" data-slot="chat-composer-attach">
              {attach}
            </div>
          ) : null}
          <div className="a63-ChatComposer-actions" data-slot="chat-composer-actions">
            {actions}
            {busy ? (
              <Button
                aria-label={stopLabel}
                className="a63-ChatComposer-submit"
                data-slot="chat-composer-submit"
                disabled={disabled}
                onClick={onStop}
                shape="round"
                size="icon-sm"
                variant="primary"
              >
                {stopIcon ?? <Square aria-hidden fill="currentColor" />}
              </Button>
            ) : (
              <Button
                aria-label={sendLabel}
                className="a63-ChatComposer-submit"
                data-slot="chat-composer-submit"
                disabled={!canSend}
                shape="round"
                size="icon-sm"
                type="submit"
                variant="primary"
              >
                {sendIcon ?? <ArrowUp aria-hidden />}
              </Button>
            )}
          </div>
        </InputGroupAddon>
      </InputGroup>
      {footnote ? (
        <p className="a63-ChatComposer-footnote" data-slot="chat-composer-footnote">
          {footnote}
        </p>
      ) : null}
    </form>
  )
}
