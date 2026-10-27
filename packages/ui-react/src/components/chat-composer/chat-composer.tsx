'use client'

import {
  type ChatComposerLayout,
  type ChatComposerStatus,
  chatComposerContract,
} from '@atom63/ui-foundation'
import { ArrowUp, AudioLines, Square } from 'lucide-react'
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
  /** A leading control, usually a `+` button that attaches a file. */
  attach?: React.ReactNode
  /** The starting text when the composer owns its value. */
  defaultValue?: string
  /** Disables the field and the send button. */
  disabled?: boolean
  /** A line under the field, such as "AI can make mistakes. Check important info." */
  footnote?: React.ReactNode
  /** The field's accessible name. Defaults to "Message". */
  label?: string
  /**
   * `inline` (the default) is one pill row: the attach slot, the field, then the
   * actions and the send button. It grows into a block, the controls in a row
   * under the text, once the text wraps. `stacked` always keeps the controls in
   * a row under the field.
   */
  layout?: ChatComposerLayout
  /** Called with the new text on every change. */
  onValueChange?: (value: string) => void
  /** Called when the reader stops a reply with the stop button. */
  onStop?: () => void
  /**
   * Starts voice mode. When it is given, an empty idle composer shows a voice
   * button in place of the send button, as most assistants do.
   */
  onVoice?: () => void
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
  /** Replaces the voice icon (sound bars). */
  voiceIcon?: React.ReactNode
  /** The voice button's accessible name. Defaults to "Start voice mode". */
  voiceLabel?: string
}

/* True when the text runs past one line of the field. */
function wraps(field: HTMLTextAreaElement): boolean {
  const style = getComputedStyle(field)
  const line = Number.parseFloat(style.lineHeight)
  if (!Number.isFinite(line)) return false
  const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  return field.scrollHeight - (padding || 0) > line * 1.5
}

/*
 * The message field at the bottom of a chat: a rounded field with a textarea
 * that grows with its text, the attach slot on the leading side and the
 * actions and send button on the trailing side. Inline, they share one pill
 * row until the text wraps, then the field takes the full width and the
 * controls move to a row under it (back to one row once the text is shorter
 * than where it wrapped and has no line breaks). Enter sends and Shift+Enter
 * starts a new line (an input method's composition is left alone). While a
 * reply is submitted or streaming, the send button becomes a stop button and
 * Enter does not send. The send, stop and voice buttons are neutral solid
 * circles. Built from InputGroup, Textarea and Button; it sends nothing
 * itself, `onSubmit` hands the text to the host.
 */
export function ChatComposer({
  actions,
  attach,
  className,
  defaultValue = '',
  disabled = false,
  footnote,
  label = 'Message',
  layout = chatComposerContract.defaultLayout,
  onStop,
  onVoice,
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
  voiceIcon,
  voiceLabel = 'Start voice mode',
  ...props
}: ChatComposerProps): React.ReactElement {
  const [ownValue, setOwnValue] = React.useState(defaultValue)
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : ownValue
  const busy = status !== 'idle'
  const empty = value.trim() === ''
  const canSend = !disabled && !busy && !empty
  // The text length at which the inline row wrapped; null while it fits.
  const [wrappedAt, setWrappedAt] = React.useState<number | null>(null)
  const multiline =
    layout === 'inline' &&
    (value.includes('\n') || (wrappedAt !== null && value.length >= wrappedAt))

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
      data-layout={layout}
      data-multiline={multiline ? '' : undefined}
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
          onChange={event => {
            const field = event.currentTarget
            if (layout === 'inline') {
              if (wrappedAt !== null && field.value.length < wrappedAt) setWrappedAt(null)
              else if (wrappedAt === null && !multiline && wraps(field)) {
                setWrappedAt(field.value.length)
              }
            }
            setValue(field.value)
          }}
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
        {attach ? (
          <InputGroupAddon
            align="inline-start"
            className="a63-ChatComposer-attach"
            data-slot="chat-composer-attach"
          >
            {attach}
          </InputGroupAddon>
        ) : null}
        <InputGroupAddon
          align="inline-end"
          className="a63-ChatComposer-actions"
          data-slot="chat-composer-actions"
        >
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
              variant="default"
            >
              {stopIcon ?? <Square aria-hidden fill="currentColor" />}
            </Button>
          ) : onVoice && empty ? (
            <Button
              aria-label={voiceLabel}
              className="a63-ChatComposer-submit"
              data-slot="chat-composer-submit"
              disabled={disabled}
              onClick={onVoice}
              shape="round"
              size="icon-sm"
              variant="default"
            >
              {voiceIcon ?? <AudioLines aria-hidden />}
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
              variant="default"
            >
              {sendIcon ?? <ArrowUp aria-hidden />}
            </Button>
          )}
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
