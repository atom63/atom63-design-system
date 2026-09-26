import { act, renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createAgentRuntime, type AgentRuntime, type AgentTransport } from '../runtime'
import { useOwnedAgentRuntime } from './use-owned-agent-runtime'

const idleTransport: AgentTransport = {
  // eslint-disable-next-line require-yield -- an idle transport never emits events.
  async *stream() {
    return
  },
}

const echoTransport: AgentTransport = {
  async *stream(request) {
    yield { runId: request.runId, type: 'response-start' }
    yield { delta: 'reply', runId: request.runId, type: 'text-delta' }
    yield { runId: request.runId, type: 'finish' }
  },
}

function createTestRuntime(threadId: string): AgentRuntime {
  return createAgentRuntime({
    getSystemPrompt: () => 'System',
    threadId,
    transport: idleTransport,
  })
}

describe('useOwnedAgentRuntime', () => {
  it('creates the runtime once and disposes it on unmount', () => {
    const factory = vi.fn(() => createTestRuntime('owned'))
    const { rerender, result, unmount } = renderHook(() => useOwnedAgentRuntime(factory))
    const runtime = result.current

    rerender()

    expect(result.current).toBe(runtime)
    expect(factory).toHaveBeenCalledTimes(1)
    expect(runtime.getState().status).toBe('idle')

    unmount()

    expect(runtime.getState().status).toBe('disposed')
  })

  it('replaces a StrictMode-replayed disposed runtime and disposes the survivor once on unmount', async () => {
    const disposeSpies = new WeakMap<AgentRuntime, ReturnType<typeof vi.spyOn>>()
    const factory = vi.fn(() => {
      const runtime = createAgentRuntime({
        getSystemPrompt: () => 'System',
        threadId: `owned-${factory.mock.calls.length + 1}`,
        transport: echoTransport,
      })
      disposeSpies.set(runtime, vi.spyOn(runtime, 'dispose'))
      return runtime
    })
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>
    const { result, unmount } = renderHook(() => useOwnedAgentRuntime(factory), { wrapper })

    await act(async () => {})

    const runtime = result.current
    const disposeSpy = disposeSpies.get(runtime)

    act(() => {
      runtime.setDraft('hello')
    })
    const sendResult = await act(async () => runtime.send({ text: 'hello' }))

    expect(runtime.getState()).toMatchObject({
      activeRunId: null,
      draft: '',
      messages: [
        { parts: [{ text: 'hello', type: 'text' }], role: 'user', status: 'complete' },
        { parts: [{ text: 'reply', type: 'text' }], role: 'assistant', status: 'complete' },
      ],
      status: 'idle',
    })
    expect(sendResult).toMatchObject({ outcome: 'completed' })
    expect(disposeSpy).toHaveBeenCalledTimes(0)

    unmount()

    expect(disposeSpy).toHaveBeenCalledTimes(1)
    expect(runtime.getState().status).toBe('disposed')
  })
})
