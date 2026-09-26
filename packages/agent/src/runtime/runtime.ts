import { createAgentStore, type AgentStore } from './store'
import {
  AgentTransportError,
  type AgentRunRequest,
  type AgentTransport,
  type AgentTransportEvent,
  type AgentTransportMessage,
} from './transport'
import type {
  AgentInput,
  AgentMessage,
  AgentPublicError,
  AgentRunResult,
  AgentRuntimeState,
} from './types'

export type AgentIdKind = 'message' | 'run' | 'thread'
export type AgentIdGenerator = (kind: AgentIdKind) => string

export interface CreateAgentRuntimeOptions {
  getSystemPrompt: (userQuery: string) => string
  historyLimit?: number
  idGenerator?: AgentIdGenerator
  now?: () => string
  startDelayMs?: number
  store?: AgentStore
  threadId?: string
  transport: AgentTransport
}

export interface AgentRuntime {
  readonly store: AgentStore
  readonly threadId: string
  clear(): void
  dispose(): void
  getState(): AgentRuntimeState
  retry(messageId: string): Promise<AgentRunResult>
  send(input: AgentInput): Promise<AgentRunResult>
  setDraft(value: string): void
  stop(reason?: string): void
  subscribe(listener: (state: AgentRuntimeState) => void): () => void
}

const defaultIdGenerator: AgentIdGenerator = kind => `${kind}_${globalThis.crypto.randomUUID()}`

const defaultNow = () => new Date().toISOString()

const UNKNOWN_ERROR: AgentPublicError = {
  code: 'unknown',
  message: 'Something went wrong. Please try again.',
  retryable: true,
}

const INVALID_RESPONSE_ERROR: AgentPublicError = {
  code: 'invalid-response',
  message: 'Something went wrong. Please try again.',
  retryable: true,
}

const EMPTY_MESSAGE: AgentMessage = {
  createdAt: '',
  id: '',
  parts: [],
  role: 'assistant',
  status: 'complete',
}

interface ActiveRun {
  abortResult?: AgentRunResult
  assistantMessageId: string
  controller: AbortController
  runId: string
}

export function getMessageText(message: AgentMessage): string {
  return message.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('')
}

export function createAgentRuntime(options: CreateAgentRuntimeOptions): AgentRuntime {
  const idGenerator = options.idGenerator ?? defaultIdGenerator
  const now = options.now ?? defaultNow
  const threadId = options.threadId ?? options.store?.getState().threadId ?? idGenerator('thread')
  const store = options.store ?? createAgentStore({ threadId })

  if (store.getState().threadId !== threadId) {
    store.setState(state => ({ ...state, threadId }))
  }

  let disposed = false
  let active: ActiveRun | undefined

  return {
    clear,
    dispose,
    getState,
    retry,
    send,
    setDraft,
    stop,
    store,
    subscribe,
    threadId,
  }

  function clear(): void {
    assertUsableRuntime()
    abortActiveRun('Runtime cleared.')
    store.setState(state => ({
      ...state,
      activeRunId: null,
      draft: '',
      error: null,
      messages: [],
      status: 'idle',
    }))
  }

  function dispose(): void {
    if (disposed) {
      return
    }

    abortActiveRun('Runtime disposed.')
    disposed = true
    store.setState(state => ({
      ...state,
      activeRunId: null,
      draft: '',
      error: null,
      status: 'disposed',
    }))
  }

  function getState(): AgentRuntimeState {
    return store.getState()
  }

  /**
   * Phase 1 has no branching or positional replay, so only the newest
   * transcript entry can be re-run — and only when it is the failed assistant
   * answer. Retrying an older failure would have to drop or reorder the turns
   * that followed it, which is a Phase 3 concern.
   */
  async function retry(messageId: string): Promise<AgentRunResult> {
    assertUsableRuntime()

    if (store.getState().activeRunId !== null) {
      throw invalidState('A run is already in progress.')
    }

    const messages = store.getState().messages
    const failedIndex = messages.length - 1
    const failed = messages[failedIndex]

    if (
      !failed ||
      failed.id !== messageId ||
      failed.role !== 'assistant' ||
      failed.status !== 'error'
    ) {
      throw invalidState('Only the most recent failed assistant message can be retried.')
    }

    const userMessage = findPrecedingUserMessage(messages, failedIndex)
    if (!userMessage) {
      throw invalidState('The failed response has no user message to retry.')
    }

    removeMessageById(messageId)
    return startRun(getMessageText(userMessage), {
      appendUserMessage: false,
      userMessage,
    })
  }

  async function send(input: AgentInput): Promise<AgentRunResult> {
    return startRun(input.text, { appendUserMessage: true })
  }

  function setDraft(value: string): void {
    assertUsableRuntime()
    store.setState(state => ({ ...state, draft: value }))
  }

  function stop(reason = 'Stopped by caller.'): void {
    assertUsableRuntime()
    abortActiveRun(reason)
  }

  function subscribe(listener: (state: AgentRuntimeState) => void): () => void {
    return store.subscribe(listener)
  }

  function assertUsableRuntime(): void {
    if (disposed || store.getState().status === 'disposed') {
      throw invalidState('The runtime has been disposed.')
    }
  }

  function assertCanStartRun(text: string): void {
    const state = store.getState()
    if (text.length === 0) {
      throw invalidState('A message is required.')
    }
    if (state.activeRunId !== null) {
      throw invalidState('A run is already in progress.')
    }
  }

  async function startRun(
    inputText: string,
    runOptions: { appendUserMessage: boolean; userMessage?: AgentMessage }
  ): Promise<AgentRunResult> {
    const text = inputText.trim()
    assertUsableRuntime()
    assertCanStartRun(text)

    const runId = idGenerator('run')
    const userMessage =
      runOptions.userMessage ?? createTextMessage('user', text, 'complete', { idGenerator, now })
    const assistantMessage = createTextMessage('assistant', '', 'streaming', {
      idGenerator,
      now,
    })
    const controller = new AbortController()

    active = { assistantMessageId: assistantMessage.id, controller, runId }
    store.setState(state => ({
      ...state,
      activeRunId: runId,
      draft: '',
      error: null,
      messages: runOptions.appendUserMessage ? [...state.messages, userMessage] : state.messages,
      status: 'submitted',
    }))

    try {
      await waitForStartDelay(controller.signal)
      appendAssistantMessageIfCurrent(runId, assistantMessage)
      throwIfAborted(controller.signal)

      const request: AgentRunRequest = {
        messages: buildTransportMessages(userMessage, assistantMessage.id),
        runId,
        threadId,
      }

      const result = await consumeTransport(request, controller.signal, runId, assistantMessage.id)

      if (result) {
        return result
      }

      throw new AgentTransportError(INVALID_RESPONSE_ERROR)
    } catch (error) {
      if (isAbortError(error)) {
        const cached = active?.runId === runId ? active.abortResult : undefined
        return cached ?? finishAbort(runId, assistantMessage.id)
      }

      const publicError = toPublicError(error)
      const failedMessageId = failRunIfCurrent(runId, assistantMessage, publicError)
      const result: AgentRunResult = {
        error: publicError,
        messageId: failedMessageId,
        outcome: 'failed',
        runId,
      }
      return result
    } finally {
      if (active?.runId === runId) {
        active = undefined
      }
    }
  }

  // Manually pumps the transport's async iterator instead of `for await...of`
  // so a run can be interrupted the instant it is aborted, even when the
  // transport itself never observes the abort signal (e.g. a hung request).
  // Once the abort wins the race, the outstanding `iterator.next()` call is
  // abandoned: any event it eventually resolves with is never read, so it
  // cannot reach the store as a stale write.
  async function consumeTransport(
    request: AgentRunRequest,
    signal: AbortSignal,
    runId: string,
    assistantMessageId: string
  ): Promise<AgentRunResult | null> {
    const iterator = options.transport.stream(request, { signal })[Symbol.asyncIterator]()
    const abortRejection = whenAborted(signal)
    let result: AgentRunResult | null = null
    let nextInFlight = false

    try {
      for (;;) {
        throwIfAborted(signal)
        nextInFlight = true
        const step = await Promise.race([iterator.next(), abortRejection])
        nextInFlight = false

        if (step.done) {
          return result
        }

        const nextResult = applyEventOnlyWhenCurrent(runId, assistantMessageId, step.value)
        if (nextResult) {
          result = nextResult
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        await closeIterator(iterator, { waitForReturn: !nextInFlight })
      }
      throw error
    }
  }

  function finishAbort(runId: string, assistantMessageId: string): AgentRunResult {
    const messageId = abortRunIfCurrent(runId, assistantMessageId)
    return { messageId, outcome: 'aborted', runId }
  }

  function waitForStartDelay(signal: AbortSignal): Promise<void> {
    const delayMs = Math.max(0, options.startDelayMs ?? 0)
    if (delayMs === 0) {
      throwIfAborted(signal)
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const timeout = globalThis.setTimeout(() => {
        signal.removeEventListener('abort', onAbort)
        resolve()
      }, delayMs)

      const onAbort = () => {
        globalThis.clearTimeout(timeout)
        reject(toAbortError(signal.reason))
      }

      signal.addEventListener('abort', onAbort, { once: true })
    })
  }

  function buildTransportMessages(
    userMessage: AgentMessage,
    assistantMessageId: string
  ): AgentTransportMessage[] {
    const history = limitHistory(
      store
        .getState()
        .messages.filter(message => message.id !== assistantMessageId && message.status !== 'error')
    )

    return [
      {
        content: options.getSystemPrompt(getMessageText(userMessage)),
        role: 'system',
      },
      ...history.map(message => ({
        content: getMessageText(message),
        role: message.role,
      })),
    ]
  }

  function limitHistory(messages: AgentMessage[]): AgentMessage[] {
    if (typeof options.historyLimit !== 'number') {
      return messages
    }

    const count = Math.max(0, Math.trunc(options.historyLimit))
    return count === 0 ? [] : messages.slice(-count)
  }

  function appendAssistantMessageIfCurrent(runId: string, assistantMessage: AgentMessage): void {
    store.setState(state => {
      if (!isCurrentRunState(state, runId)) {
        return state
      }
      if (state.messages.some(message => message.id === assistantMessage.id)) {
        return state
      }
      return {
        ...state,
        messages: [...state.messages, assistantMessage],
      }
    })
  }

  function applyEventOnlyWhenCurrent(
    runId: string,
    messageId: string,
    event: AgentTransportEvent
  ): AgentRunResult | null {
    if (event.runId !== runId) {
      return null
    }

    switch (event.type) {
      case 'response-start': {
        store.setState(state =>
          isCurrentRunState(state, runId) ? { ...state, status: 'streaming' } : state
        )
        return null
      }
      case 'text-delta': {
        store.setState(state => {
          if (!isCurrentRunState(state, runId)) {
            return state
          }
          return {
            ...state,
            messages: updateMessage(state.messages, messageId, message => ({
              ...message,
              parts: appendTextPart(message.parts, event.delta),
              status: 'streaming',
            })),
            status: 'streaming',
          }
        })
        return null
      }
      case 'finish': {
        // A run that finishes with no text is a failed run, not a successful
        // empty one. Completing it leaves an assistant message the transcript
        // renders as a permanently "typing" bubble, with no error state and no
        // retry control — the same outcome as a stream that never finishes,
        // so it takes the same `invalid-response` path.
        const answered = store.getState().messages.find(entry => entry.id === messageId)
        if (
          isCurrentRunState(store.getState(), runId) &&
          getMessageText(answered ?? EMPTY_MESSAGE) === ''
        ) {
          throw new AgentTransportError(INVALID_RESPONSE_ERROR)
        }

        let completed = false
        store.setState(state => {
          if (!isCurrentRunState(state, runId)) {
            return state
          }
          completed = true
          return {
            ...state,
            activeRunId: null,
            error: null,
            messages: updateMessage(state.messages, messageId, message => ({
              ...message,
              status: 'complete',
            })),
            status: 'idle',
          }
        })

        if (!completed) {
          return null
        }

        return {
          messageId,
          outcome: 'completed',
          runId,
        }
      }
    }
  }

  function abortRunIfCurrent(runId: string, messageId: string): string | undefined {
    let keptMessageId: string | undefined

    store.setState(state => {
      if (!isCurrentRunState(state, runId)) {
        return state
      }

      const message = state.messages.find(entry => entry.id === messageId)
      if (message && getMessageText(message).length > 0) {
        keptMessageId = messageId
        return {
          ...state,
          activeRunId: null,
          error: null,
          messages: updateMessage(state.messages, messageId, entry => ({
            ...entry,
            status: 'complete',
          })),
          status: 'idle',
        }
      }

      return {
        ...state,
        activeRunId: null,
        error: null,
        messages: removeMessage(state.messages, messageId),
        status: 'idle',
      }
    })

    return keptMessageId
  }

  function failRunIfCurrent(
    runId: string,
    assistantMessage: AgentMessage,
    publicError: AgentPublicError
  ): string | undefined {
    let failedMessageId: string | undefined

    store.setState(state => {
      if (!isCurrentRunState(state, runId)) {
        return state
      }

      failedMessageId = assistantMessage.id
      const messages: AgentMessage[] = state.messages.some(
        message => message.id === assistantMessage.id
      )
        ? updateMessage(state.messages, assistantMessage.id, message => ({
            ...message,
            error: publicError,
            status: 'error',
          }))
        : [
            ...state.messages,
            {
              ...assistantMessage,
              error: publicError,
              status: 'error',
            },
          ]

      return {
        ...state,
        activeRunId: null,
        error: publicError,
        messages,
        status: 'error',
      }
    })

    return failedMessageId
  }

  function abortActiveRun(reason: string): void {
    if (!active) {
      return
    }

    const current = active
    current.controller.abort(reason)
    current.abortResult ??= finishAbort(current.runId, current.assistantMessageId)
  }

  function removeMessageById(messageId: string): void {
    store.setState(state => ({
      ...state,
      messages: removeMessage(state.messages, messageId),
    }))
  }
}

function createTextMessage(
  role: AgentMessage['role'],
  text: string,
  status: AgentMessage['status'],
  context?: {
    error?: AgentPublicError
    idGenerator?: AgentIdGenerator
    now?: () => string
  }
): AgentMessage {
  const parts = text.length > 0 ? [{ text, type: 'text' as const }] : []

  return {
    createdAt: context?.now?.() ?? new Date().toISOString(),
    error: context?.error,
    id: context?.idGenerator?.('message') ?? `message_${globalThis.crypto.randomUUID()}`,
    parts,
    role,
    status,
  }
}

function updateMessage(
  messages: AgentMessage[],
  messageId: string,
  updater: (message: AgentMessage) => AgentMessage
): AgentMessage[] {
  return messages.map(message => (message.id === messageId ? updater(message) : message))
}

function findPrecedingUserMessage(
  messages: AgentMessage[],
  failedIndex: number
): AgentMessage | undefined {
  for (let index = failedIndex - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message?.role === 'user') {
      return message
    }
  }

  return undefined
}

function appendTextPart(parts: AgentMessage['parts'], delta: string): AgentMessage['parts'] {
  const text = [...parts.map(part => part.text), delta].join('')
  return text.length > 0 ? [{ text, type: 'text' }] : []
}

function removeMessage(messages: AgentMessage[], messageId: string): AgentMessage[] {
  return messages.filter(message => message.id !== messageId)
}

function isCurrentRunState(state: AgentRuntimeState, runId: string): boolean {
  return state.activeRunId === runId && state.status !== 'disposed'
}

function invalidState(message: string): AgentTransportError {
  return new AgentTransportError({
    code: 'invalid-state',
    message,
    retryable: false,
  })
}

function toPublicError(error: unknown): AgentPublicError {
  if (error instanceof AgentTransportError) {
    return error.publicError
  }
  return UNKNOWN_ERROR
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw toAbortError(signal.reason)
  }
}

// Rejects once `signal` aborts and never resolves otherwise. Used to race
// against a transport call that might not observe the abort signal itself.
function whenAborted(signal: AbortSignal): Promise<never> {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) {
      reject(toAbortError(signal.reason))
      return
    }
    signal.addEventListener('abort', () => reject(toAbortError(signal.reason)), { once: true })
  })
}

async function closeIterator(
  iterator: AsyncIterator<AgentTransportEvent>,
  options: { waitForReturn: boolean }
): Promise<void> {
  if (typeof iterator.return !== 'function') {
    return
  }

  const returnPromise = iterator.return()
  if (options.waitForReturn) {
    await returnPromise
    return
  }

  void returnPromise.catch(() => {})
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

// Never mutates `reason`: a caller-supplied abort reason may be an Error the
// host still owns and inspects, so it is wrapped rather than renamed in place.
function toAbortError(reason: unknown): Error {
  if (reason instanceof Error) {
    if (reason.name === 'AbortError') {
      return reason
    }

    const wrapped = new Error(reason.message, { cause: reason })
    wrapped.name = 'AbortError'
    return wrapped
  }

  const error = new Error(
    typeof reason === 'string' && reason.length > 0 ? reason : 'The operation was aborted.'
  )
  error.name = 'AbortError'
  return error
}
