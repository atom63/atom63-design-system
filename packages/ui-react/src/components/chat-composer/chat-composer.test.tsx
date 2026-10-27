import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChatComposer } from './chat-composer'

describe('ChatComposer', () => {
  it('sends on Enter, clears its own value, and keeps Shift+Enter for a new line', () => {
    const onSubmit = vi.fn()
    render(<ChatComposer onSubmit={onSubmit} />)
    const field = screen.getByRole('textbox', { name: 'Message' })

    fireEvent.change(field, { target: { value: 'Hello' } })
    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('Hello')
    expect(field).toHaveValue('')
  })

  it('does not send while an input method is composing', () => {
    const onSubmit = vi.fn()
    render(<ChatComposer defaultValue="こんにちは" onSubmit={onSubmit} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { isComposing: true, key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('enables the send button only when there is text', () => {
    const onSubmit = vi.fn()
    render(<ChatComposer onSubmit={onSubmit} />)
    const send = screen.getByRole('button', { name: 'Send message' })
    expect(send).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } })
    expect(send).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi' } })
    expect(send).toBeEnabled()
    fireEvent.click(send)
    expect(onSubmit).toHaveBeenCalledWith('Hi')
  })

  it('shows a stop button while streaming, and Enter does not send', () => {
    const onStop = vi.fn()
    const onSubmit = vi.fn()
    render(
      <ChatComposer defaultValue="Next" onStop={onStop} onSubmit={onSubmit} status="streaming" />
    )
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Stop response' }))
    expect(onStop).toHaveBeenCalledOnce()

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('Next')
  })

  it('leaves a controlled value to the host', () => {
    const onSubmit = vi.fn()
    const onValueChange = vi.fn()
    render(<ChatComposer onSubmit={onSubmit} onValueChange={onValueChange} value="Draft" />)
    const field = screen.getByRole('textbox')
    fireEvent.change(field, { target: { value: 'Draft 2' } })
    expect(onValueChange).toHaveBeenCalledWith('Draft 2')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('Draft')
    expect(field).toHaveValue('Draft')
  })

  it('disables the field and renders the attach, actions and footnote slots', () => {
    render(
      <ChatComposer
        actions={<button type="button">Dictate</button>}
        attach={<button type="button">Attach</button>}
        defaultValue="Hi"
        disabled
        footnote="AI can make mistakes."
      />
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Attach' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dictate' })).toBeInTheDocument()
    expect(screen.getByText('AI can make mistakes.')).toBeInTheDocument()
  })
})

describe('ChatComposer layout', () => {
  it('is one inline row by default and grows into a block on a line break', () => {
    const { container } = render(<ChatComposer />)
    const form = container.querySelector('[data-slot="chat-composer"]')
    expect(form).toHaveAttribute('data-layout', 'inline')
    expect(form).not.toHaveAttribute('data-multiline')

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'One\nTwo' } })
    expect(form).toHaveAttribute('data-multiline')

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    expect(form).not.toHaveAttribute('data-multiline')
  })

  it('keeps the stacked layout without a multiline flag', () => {
    const { container } = render(<ChatComposer defaultValue={'One\nTwo'} layout="stacked" />)
    const form = container.querySelector('[data-slot="chat-composer"]')
    expect(form).toHaveAttribute('data-layout', 'stacked')
    expect(form).not.toHaveAttribute('data-multiline')
  })

  it('shows a voice button in place of send while the field is empty', () => {
    const onVoice = vi.fn()
    render(<ChatComposer onVoice={onVoice} />)
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Start voice mode' }))
    expect(onVoice).toHaveBeenCalledOnce()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi' } })
    expect(screen.queryByRole('button', { name: 'Start voice mode' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
  })
})
