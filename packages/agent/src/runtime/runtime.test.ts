import { describe, expect, it, vi } from 'vitest'
import { createAgentStore } from './store'
import type { AgentTransport, AgentTransportEvent } from './transport'
import type { AgentMessage, AgentPublicError } from './types'
import { createAgentRuntime, type AgentRuntime, type CreateAgentRuntimeOptions } from './runtime'

const successfulTransport: AgentTransport = {
  async *stream(request) {
    yield { runId: request.runId, type: 'response-start' }
    yield { delta: 'Hello', runId: request.runId, type: 'text-delta' }
    yield { delta: ' world', runId: request.runId, type: 'text-delta' }
    yield { runId: request.runId, type: 'finish' }
  },
}

async function* throwTransportError(message: string): AsyncGenerator<AgentTransportEvent> {
  yield* []
  throw new Error(message)
}

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolve: ((value: T) => void) | undefined
  const promise = new Promise<T>(res => {
    resolve = res
  })
  if (!resolve) {
    throw new Error('Promise executor did not run synchronously.')
  }
  return { promise, resolve }
}

function createTestRuntime(
  transport: AgentTransport,
  overrides: Partial<CreateAgentRuntimeOptions> = {}
): AgentRuntime {
  const counters = new Map<string, number>()
  return createAgentRuntime({
    getSystemPrompt: () => 'System',
    idGenerator: kind => {
      const next = (counters.get(kind) ?? 0) + 1
      counters.set(kind, next)
      return `${kind}-${next}`
    },
    now: () => '2026-09-01T20:00:00.000Z',
    threadId: 'thread-1',
    transport,
    ...overrides,
  })
}

function createPendingTransport(): AgentTransport {
  return {
    stream() {
      return {
        [Symbol.asyncIterator]() {
          return {
            next: () =>
              new Promise<IteratorResult<AgentTransportEvent>>(() => {
                // Never resolves: simulates a hung network request.
              }),
          }
        },
      }
    },
  }
}

function createRuntimeWithGate(name: string, gate: Deferred<void>): AgentRuntime {
  const transport: AgentTransport = {
    async *stream(request) {
      yield { runId: request.runId, type: 'response-start' }
      await gate.promise
      yield { delta: `${name} answer`, runId: request.runId, type: 'text-delta' }
      yield { runId: request.runId, type: 'finish' }
    },
  }
  return createTestRuntime(transport, { threadId: name })
}

function createTransportThatYieldsAfterAbort(): AgentTransport & {
  releaseLateDelta: (text: string) => void
} {
  const gate = deferred<string>()
  return {
    releaseLateDelta(text) {
      gate.resolve(text)
    },
    async *stream(request) {
      yield { runId: request.runId, type: 'response-start' }
      const delta = await gate.promise
      yield { delta, runId: request.runId, type: 'text-delta' }
      yield { runId: request.runId, type: 'finish' }
    },
  }
}

function createMidStreamPauseTransport(context?: { onCleanup?: () => void }): AgentTransport {
  const gate = deferred<void>()

  return {
    async *stream(request) {
      try {
        yield { runId: request.runId, type: 'response-start' }
        yield { delta: 'partial answer', runId: request.runId, type: 'text-delta' }
        await gate.promise
      } finally {
        context?.onCleanup?.()
      }
    },
  }
}

describe('createAgentRuntime', () => {
  it('targets the generated assistant message through completion', async () => {
    const counters = new Map<string, number>()
    const runtime = createAgentRuntime({
      getSystemPrompt: input => `System for ${input}`,
      idGenerator: kind => {
        const next = (counters.get(kind) ?? 0) + 1
        counters.set(kind, next)
        return `${kind}-${next}`
      },
      now: () => '2026-09-01T20:00:00.000Z',
      threadId: 'thread-1',
      transport: successfulTransport,
    })

    const result = await runtime.send({ text: 'Question' })
    const state = runtime.getState()

    expect(result).toEqual({
      messageId: 'message-2',
      outcome: 'completed',
      runId: 'run-1',
    })
    expect(state.activeRunId).toBeNull()
    expect(state.status).toBe('idle')
    expect(state.messages.map(message => message.id)).toEqual(['message-1', 'message-2'])
    expect(state.messages[1]?.parts).toEqual([{ type: 'text', text: 'Hello world' }])
    expect(state.messages[1]?.status).toBe('complete')
  })

  it('ignores transport events tagged with another run id', async () => {
    // A transport that multiplexes runs over one connection, or replays a
    // cancelled run, can hand this stream an event belonging to a different
    // run. It must not reach the transcript, and its `finish` must not end
    // the run that is actually in flight.
    const crossTalkingTransport: AgentTransport = {
      async *stream(request) {
        yield { runId: request.runId, type: 'response-start' }
        yield { delta: 'Hello', runId: request.runId, type: 'text-delta' }
        yield { delta: ' STALE', runId: 'run-from-another-conversation', type: 'text-delta' }
        yield { runId: 'run-from-another-conversation', type: 'finish' }
        yield { delta: ' world', runId: request.runId, type: 'text-delta' }
        yield { runId: request.runId, type: 'finish' }
      },
    }

    const runtime = createTestRuntime(crossTalkingTransport)

    await expect(runtime.send({ text: 'Question' })).resolves.toMatchObject({
      messageId: 'message-2',
      outcome: 'completed',
    })

    const state = runtime.getState()
    expect(state.messages[1]?.parts).toEqual([{ text: 'Hello world', type: 'text' }])
    expect(state.messages[1]?.status).toBe('complete')
    expect(state.status).toBe('idle')
    expect(state.activeRunId).toBeNull()
  })

  it('fails a run that finishes without any text', async () => {
    // Completing an empty answer leaves a message the transcript renders as a
    // permanently "typing" bubble, with no error and nothing to retry.
    const emptyTransport: AgentTransport = {
      async *stream(request) {
        yield { runId: request.runId, type: 'response-start' }
        yield { runId: request.runId, type: 'finish' }
      },
    }

    const runtime = createTestRuntime(emptyTransport)

    await expect(runtime.send({ text: 'Question' })).resolves.toMatchObject({
      error: { code: 'invalid-response', retryable: true },
      outcome: 'failed',
    })

    const state = runtime.getState()
    expect(state.status).toBe('error')
    expect(state.messages[1]?.status).toBe('error')
    expect(state.activeRunId).toBeNull()
  })

  it('stores a safe retryable error instead of a provider body', async () => {
    const transport: AgentTransport = {
      stream() {
        return throwTransportError('provider-secret-response')
      },
    }
    const runtime = createAgentRuntime({
      getSystemPrompt: () => 'System',
      idGenerator: kind => `${kind}-1`,
      now: () => '2026-09-01T20:00:00.000Z',
      threadId: 'thread-1',
      transport,
    })

    const result = await runtime.send({ text: 'Question' })

    expect(result.outcome).toBe('failed')
    expect(runtime.getState().error?.message).toBe('Something went wrong. Please try again.')
    expect(JSON.stringify(runtime.getState())).not.toContain('provider-secret-response')
  })

  it('limits transport history after excluding failed assistant messages', async () => {
    const requests: string[][] = []
    const store = createAgentStore({
      initialMessages: [
        createMessage('message-1', 'user', 'First question'),
        createMessage('message-2', 'assistant', 'First answer'),
        createMessage('message-3', 'assistant', 'Hidden provider failure', 'error', {
          code: 'unknown',
          message: 'Something went wrong. Please try again.',
          retryable: true,
        }),
        createMessage('message-4', 'user', 'Second question'),
        createMessage('message-5', 'assistant', 'Second answer'),
      ],
      threadId: 'thread-1',
    })
    const counters = new Map<string, number>([['message', 5]])
    const runtime = createAgentRuntime({
      getSystemPrompt: input => `System for ${input}`,
      historyLimit: 3,
      idGenerator: kind => {
        const next = (counters.get(kind) ?? 0) + 1
        counters.set(kind, next)
        return `${kind}-${next}`
      },
      now: () => '2026-09-01T20:00:00.000Z',
      store,
      threadId: 'thread-1',
      transport: {
        async *stream(request) {
          requests.push(request.messages.map(message => `${message.role}:${message.content}`))
          yield { runId: request.runId, type: 'response-start' }
          yield { runId: request.runId, type: 'finish' }
        },
      },
    })

    await runtime.send({ text: 'Question' })

    expect(requests).toEqual([
      [
        'system:System for Question',
        'user:Second question',
        'assistant:Second answer',
        'user:Question',
      ],
    ])
  })

  it('fails with an invalid-response error when the stream never finishes', async () => {
    const counters = new Map<string, number>()
    const runtime = createAgentRuntime({
      getSystemPrompt: () => 'System',
      idGenerator: kind => {
        const next = (counters.get(kind) ?? 0) + 1
        counters.set(kind, next)
        return `${kind}-${next}`
      },
      now: () => '2026-09-01T20:00:00.000Z',
      threadId: 'thread-1',
      transport: {
        async *stream(request) {
          yield { runId: request.runId, type: 'response-start' }
          yield { delta: 'Partial answer', runId: request.runId, type: 'text-delta' }
        },
      },
    })

    const result = await runtime.send({ text: 'Question' })

    expect(result).toEqual({
      error: {
        code: 'invalid-response',
        message: 'Something went wrong. Please try again.',
        retryable: true,
      },
      messageId: 'message-2',
      outcome: 'failed',
      runId: 'run-1',
    })
    expect(runtime.getState()).toMatchObject({
      activeRunId: null,
      error: {
        code: 'invalid-response',
        message: 'Something went wrong. Please try again.',
        retryable: true,
      },
      messages: [
        {
          id: 'message-1',
          parts: [{ text: 'Question', type: 'text' }],
          role: 'user',
          status: 'complete',
        },
        {
          id: 'message-2',
          parts: [{ text: 'Partial answer', type: 'text' }],
          role: 'assistant',
          status: 'error',
        },
      ],
      status: 'error',
    })
  })

  it('retries a failed assistant message without duplicating the user message', async () => {
    const counters = new Map<string, number>()
    const requests: string[][] = []
    let attempt = 0
    const transport: AgentTransport = {
      async *stream(request) {
        attempt += 1
        requests.push(request.messages.map(message => `${message.role}:${message.content}`))
        yield { runId: request.runId, type: 'response-start' }

        if (attempt === 1) {
          throw new Error('provider-secret-response')
        }

        yield { delta: 'Retried answer', runId: request.runId, type: 'text-delta' }
        yield { runId: request.runId, type: 'finish' }
      },
    }
    const runtime = createAgentRuntime({
      getSystemPrompt: input => `System for ${input}`,
      idGenerator: kind => {
        const next = (counters.get(kind) ?? 0) + 1
        counters.set(kind, next)
        return `${kind}-${next}`
      },
      now: () => '2026-09-01T20:00:00.000Z',
      threadId: 'thread-1',
      transport,
    })

    const firstResult = await runtime.send({ text: 'Question' })
    const retryResult = await runtime.retry(firstResult.messageId ?? '')
    const state = runtime.getState()

    expect(firstResult).toMatchObject({
      messageId: 'message-2',
      outcome: 'failed',
      runId: 'run-1',
    })
    expect(retryResult).toEqual({
      messageId: 'message-3',
      outcome: 'completed',
      runId: 'run-2',
    })
    expect(state.messages.map(message => message.id)).toEqual(['message-1', 'message-3'])
    expect(state.messages[0]?.parts).toEqual([{ text: 'Question', type: 'text' }])
    expect(state.messages[1]?.parts).toEqual([{ text: 'Retried answer', type: 'text' }])
    expect(requests).toEqual([
      ['system:System for Question', 'user:Question'],
      ['system:System for Question', 'user:Question'],
    ])
  })

  it('rejects retrying a failed message that is no longer the last transcript entry', async () => {
    let attempt = 0
    const transport: AgentTransport = {
      async *stream(request) {
        attempt += 1
        yield { runId: request.runId, type: 'response-start' }

        if (attempt === 1) {
          throw new Error('provider-secret-response')
        }

        yield { delta: 'Second answer', runId: request.runId, type: 'text-delta' }
        yield { runId: request.runId, type: 'finish' }
      },
    }
    const runtime = createTestRuntime(transport)

    const failed = await runtime.send({ text: 'First question' })
    await runtime.send({ text: 'Second question' })

    await expect(runtime.retry(failed.messageId ?? '')).rejects.toMatchObject({
      publicError: { code: 'invalid-state', retryable: false },
    })
    expect(runtime.getState().messages.map(message => message.id)).toEqual([
      'message-1',
      'message-2',
      'message-3',
      'message-4',
    ])
  })

  it('rejects retrying a message that is not a failed assistant message', async () => {
    const runtime = createTestRuntime(successfulTransport)

    await runtime.send({ text: 'Question' })

    // The last transcript entry is a completed assistant message.
    await expect(runtime.retry('message-2')).rejects.toMatchObject({
      publicError: { code: 'invalid-state', retryable: false },
    })
    // The user message is not the last entry and is not an assistant message.
    await expect(runtime.retry('message-1')).rejects.toMatchObject({
      publicError: { code: 'invalid-state', retryable: false },
    })
  })

  it('clears and disposes an active run without throwing', async () => {
    const runtime = createTestRuntime(createPendingTransport())

    const run = runtime.send({ text: 'Question' })

    expect(() => runtime.clear()).not.toThrow()
    await expect(run).resolves.toMatchObject({ outcome: 'aborted' })
    expect(runtime.getState()).toMatchObject({ activeRunId: null, messages: [], status: 'idle' })

    const second = runtime.send({ text: 'Second question' })
    expect(() => runtime.dispose()).not.toThrow()
    await expect(second).resolves.toMatchObject({ outcome: 'aborted' })
    expect(runtime.getState().status).toBe('disposed')
  })

  it('does not mutate a caller-supplied abort reason error', async () => {
    const runtime = createTestRuntime(createPendingTransport())
    const reason = new Error('host cancelled')
    const run = runtime.send({ text: 'Question' })

    // `stop` is typed for a string reason; the cast covers an untyped JS host
    // passing an Error it still owns and inspects afterwards.
    runtime.stop(reason as unknown as string)

    await expect(run).resolves.toMatchObject({ outcome: 'aborted' })
    expect(reason.name).toBe('Error')
    expect(reason.message).toBe('host cancelled')
  })

  it('aborts one runtime without affecting another runtime', async () => {
    const firstGate = deferred<void>()
    const secondGate = deferred<void>()
    const first = createRuntimeWithGate('first', firstGate)
    const second = createRuntimeWithGate('second', secondGate)

    const firstRun = first.send({ text: 'first question' })
    const secondRun = second.send({ text: 'second question' })

    first.stop('user')
    secondGate.resolve()

    await expect(firstRun).resolves.toMatchObject({ outcome: 'aborted' })
    await expect(secondRun).resolves.toMatchObject({ outcome: 'completed' })
    expect(first.getState().status).toBe('idle')
    expect(second.getState().messages.at(-1)?.parts).toEqual([
      { type: 'text', text: 'second answer' },
    ])
  })

  it('rejects late events from an aborted run', async () => {
    const transport = createTransportThatYieldsAfterAbort()
    const runtime = createTestRuntime(transport)
    const run = runtime.send({ text: 'question' })

    runtime.stop()
    transport.releaseLateDelta('late token')
    await run

    expect(JSON.stringify(runtime.getState())).not.toContain('late token')
  })

  it('disposes permanently and cleans the active run', async () => {
    const runtime = createTestRuntime(createPendingTransport())
    const run = runtime.send({ text: 'question' })

    runtime.dispose()

    await expect(run).resolves.toMatchObject({ outcome: 'aborted' })
    expect(runtime.getState().status).toBe('disposed')
    await expect(runtime.send({ text: 'again' })).rejects.toThrow('disposed')
  })

  it('prevents two active runs in the same runtime', async () => {
    const runtime = createTestRuntime(createPendingTransport())
    void runtime.send({ text: 'first' })

    await expect(runtime.send({ text: 'second' })).rejects.toMatchObject({
      publicError: { code: 'invalid-state', retryable: false },
    })
  })

  it('aborts during start delay without starting transport', async () => {
    vi.useFakeTimers()
    try {
      const transport = { stream: vi.fn() } as unknown as AgentTransport
      const runtime = createTestRuntime(transport, { startDelayMs: 500 })
      const run = runtime.send({ text: 'question' })

      runtime.stop()
      await vi.runAllTimersAsync()

      await expect(run).resolves.toMatchObject({ outcome: 'aborted' })
      expect(transport.stream).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('interrupts a run that is already mid-stream on a hung transport', async () => {
    const transport: AgentTransport = {
      async *stream(request) {
        yield { runId: request.runId, type: 'response-start' }
        await new Promise<void>(() => {
          // Never resolves: the provider connection hangs after the response starts.
        })
      },
    }
    const runtime = createTestRuntime(transport)
    const run = runtime.send({ text: 'question' })

    // Let the transport genuinely emit "response-start" and enter the hung
    // await before cancelling, instead of racing the pre-stream start-delay
    // window (where the current run has not touched the transport yet).
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(runtime.getState().status).toBe('streaming')

    runtime.dispose()

    await expect(run).resolves.toMatchObject({ outcome: 'aborted' })
    expect(runtime.getState().status).toBe('disposed')
  })

  it('keeps partial assistant text when a run is aborted after streaming starts', async () => {
    const runtime = createTestRuntime(createMidStreamPauseTransport())
    let stopped = false
    const unsubscribe = runtime.subscribe(state => {
      const assistant = state.messages.at(-1)
      if (assistant?.role === 'assistant' && assistant.parts[0]?.text === 'partial answer') {
        stopped = true
        runtime.stop('user')
      }
    })

    try {
      const result = await runtime.send({ text: 'question' })

      expect(stopped).toBe(true)
      expect(result).toEqual({
        messageId: 'message-2',
        outcome: 'aborted',
        runId: 'run-1',
      })
      expect(runtime.getState()).toMatchObject({
        activeRunId: null,
        error: null,
        messages: [
          {
            id: 'message-1',
            parts: [{ text: 'question', type: 'text' }],
            role: 'user',
            status: 'complete',
          },
          {
            id: 'message-2',
            parts: [{ text: 'partial answer', type: 'text' }],
            role: 'assistant',
            status: 'complete',
          },
        ],
        status: 'idle',
      })
    } finally {
      unsubscribe()
    }
  })

  it('awaits iterator cleanup when aborting an active stream', async () => {
    let cleanedUp = false
    const runtime = createTestRuntime(
      createMidStreamPauseTransport({
        onCleanup() {
          cleanedUp = true
        },
      })
    )
    const unsubscribe = runtime.subscribe(state => {
      const assistant = state.messages.at(-1)
      if (assistant?.role === 'assistant' && assistant.parts[0]?.text === 'partial answer') {
        runtime.stop('user')
      }
    })

    try {
      await expect(runtime.send({ text: 'question' })).resolves.toMatchObject({
        outcome: 'aborted',
      })
      expect(cleanedUp).toBe(true)
    } finally {
      unsubscribe()
    }
  })

  it('keeps dispose idempotent but rejects stop and clear after disposal', () => {
    const runtime = createTestRuntime(successfulTransport)

    runtime.dispose()

    expect(() => runtime.dispose()).not.toThrow()
    expectInvalidState(() => runtime.stop())
    expectInvalidState(() => runtime.clear())
  })
})

function createMessage(
  id: string,
  role: AgentMessage['role'],
  text: string,
  status: AgentMessage['status'] = 'complete',
  error?: AgentPublicError
): AgentMessage {
  return {
    createdAt: '2026-09-01T20:00:00.000Z',
    error,
    id,
    parts: text.length > 0 ? [{ text, type: 'text' }] : [],
    role,
    status,
  }
}

function expectInvalidState(action: () => void): void {
  try {
    action()
  } catch (error) {
    expect(error).toMatchObject({
      message: 'The runtime has been disposed.',
      publicError: { code: 'invalid-state', retryable: false },
    })
    return
  }

  throw new Error('Expected an invalid-state error to be thrown.')
}
