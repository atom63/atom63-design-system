import { act, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createAgentRuntime, type AgentMessage, type AgentTransport } from '../runtime'
import { DEFAULT_AGENT_CHROME_LABELS, useAgentChromeController } from './agent-chrome-controller'

const transport: AgentTransport = {
  async *stream(request) {
    yield { runId: request.runId, type: 'response-start' }
    yield { runId: request.runId, type: 'finish' }
  },
}

function createRuntime() {
  return createAgentRuntime({
    getSystemPrompt: () => 'system',
    threadId: crypto.randomUUID(),
    transport,
  })
}

function createCanonicalMessage(role: AgentMessage['role'], text: string): AgentMessage {
  return {
    createdAt: '2026-09-01T00:00:00.000Z',
    id: `${role}-${text}`,
    parts: [{ text, type: 'text' }],
    role,
    status: 'complete',
  }
}

describe('useAgentChromeController', () => {
  it('merges labels and derives idle visibility', () => {
    const runtime = createRuntime()
    const { result } = renderHook(() =>
      useAgentChromeController({
        labels: { clear: 'Erase conversation' },
        runtime,
      })
    )

    expect(result.current.labels).toEqual({
      ...DEFAULT_AGENT_CHROME_LABELS,
      clear: 'Erase conversation',
    })
    expect(result.current).toMatchObject({
      canClear: false,
      messageCount: 0,
      showClear: false,
      statusLabel: null,
      userMessageCount: 0,
    })
  })

  it('describes clearing as permanent and irreversible by default', () => {
    expect(DEFAULT_AGENT_CHROME_LABELS.clearDescription).toBe(
      'This conversation will be permanently cleared. This action cannot be undone.'
    )
  })

  it('shows but disables clear while a run is active', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const runtime = createRuntime()
    const pending = runtime.send({ text: 'Question' })
    const { result } = renderHook(() => useAgentChromeController({ runtime }))

    expect(result.current.showClear).toBe(true)
    expect(result.current.canClear).toBe(false)
    expect(result.current.statusLabel).toBe('Thinking')

    // Stopping settles the run, which re-renders the hook. Unwrapped, React
    // warns that the update escaped `act`.
    await act(async () => {
      runtime.stop()
      await pending
    })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('keeps controller identity stable when nothing it exposes changed', () => {
    const runtime = createRuntime()
    const labels = { clear: 'Erase conversation' }
    const { rerender, result } = renderHook(() => useAgentChromeController({ labels, runtime }))
    const first = result.current

    rerender()

    // Chrome puts this object straight into context, so a new identity per
    // render would invalidate every consumer for no state change.
    expect(result.current).toBe(first)
  })

  it('does not carry an open confirmation onto a new runtime', () => {
    const first = createRuntime()
    first.store.setState(state => ({
      ...state,
      messages: [createCanonicalMessage('user', 'First thread')],
    }))
    const second = createRuntime()
    second.store.setState(state => ({
      ...state,
      messages: [createCanonicalMessage('user', 'Second thread')],
    }))

    const { rerender, result } = renderHook(
      ({ runtime }) => useAgentChromeController({ runtime }),
      { initialProps: { runtime: first } }
    )

    act(() => result.current.requestClear())
    expect(result.current.clearConfirmationOpen).toBe(true)

    rerender({ runtime: second })

    // A different runtime is a different conversation; a confirmation raised
    // against the previous one must not be able to land on it.
    expect(result.current.clearConfirmationOpen).toBe(false)
    expect(first.getState().messages).toHaveLength(1)
    expect(second.getState().messages).toHaveLength(1)
  })

  it('clears only after confirmation', () => {
    const runtime = createRuntime()
    runtime.store.setState(state => ({
      ...state,
      messages: [createCanonicalMessage('user', 'Question')],
    }))
    const { result } = renderHook(() => useAgentChromeController({ runtime }))

    act(() => result.current.requestClear())
    expect(result.current.clearConfirmationOpen).toBe(true)
    expect(runtime.getState().messages).toHaveLength(1)

    act(() => result.current.confirmClear())
    expect(result.current.clearConfirmationOpen).toBe(false)
    expect(runtime.getState().messages).toEqual([])
  })

  it('auto-cancels and no-ops after disposal', () => {
    const runtime = createRuntime()
    runtime.store.setState(state => ({
      ...state,
      messages: [createCanonicalMessage('user', 'Question')],
    }))
    const { result } = renderHook(() => useAgentChromeController({ runtime }))

    act(() => result.current.requestClear())
    act(() => runtime.dispose())

    expect(result.current.clearConfirmationOpen).toBe(false)
    expect(() => result.current.requestClear()).not.toThrow()
    expect(() => result.current.confirmClear()).not.toThrow()
  })

  it('does not warn when confirming after disposal', () => {
    const runtime = createRuntime()
    runtime.store.setState(state => ({
      ...state,
      messages: [createCanonicalMessage('user', 'Question')],
    }))
    const { result } = renderHook(() => useAgentChromeController({ runtime }))

    act(() => result.current.requestClear())
    act(() => runtime.dispose())

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    result.current.confirmClear()

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(result.current.clearConfirmationOpen).toBe(false)
    expect(runtime.getState().messages).toHaveLength(1)

    consoleErrorSpy.mockRestore()
  })
  it('keeps a stable controller when the host passes labels inline', () => {
    // `labels={{ … }}` is a new object every render. Keying the labels memo on
    // that object invalidated the controller memo too, re-rendering every
    // chrome consumer once per streamed token.
    const runtime = createRuntime()
    const seen: unknown[] = []

    function Harness({ tick }: { tick: number }) {
      const controller = useAgentChromeController({
        labels: { clear: 'Clear thread' },
        runtime,
      })
      seen.push(controller)
      return <span data-testid="tick">{tick}</span>
    }

    const { rerender } = render(<Harness tick={1} />)
    rerender(<Harness tick={2} />)
    rerender(<Harness tick={3} />)

    expect(seen.length).toBeGreaterThanOrEqual(3)
    expect(new Set(seen).size).toBe(1)
    expect((seen[0] as { labels: { clear: string } }).labels.clear).toBe('Clear thread')
  })
})
