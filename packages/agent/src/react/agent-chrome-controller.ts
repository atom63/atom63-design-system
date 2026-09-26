import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'
import type { AgentRuntime, AgentRuntimeStatus } from '../runtime'

export interface AgentChromeLabels {
  cancel: string
  clear: string
  clearConfirm: string
  clearDescription: string
  clearTitle: string
  close: string
  errorStatus: string
  streamingStatus: string
  submittedStatus: string
}

export const DEFAULT_AGENT_CHROME_LABELS: AgentChromeLabels = {
  cancel: 'Cancel',
  clear: 'Clear chat history',
  clearConfirm: 'Clear All',
  clearDescription: 'This conversation will be permanently cleared. This action cannot be undone.',
  clearTitle: 'Clear chat history?',
  close: 'Close chat',
  errorStatus: 'Unavailable',
  streamingStatus: 'Responding',
  submittedStatus: 'Thinking',
}

export interface UseAgentChromeControllerOptions {
  labels?: Partial<AgentChromeLabels>
  runtime: AgentRuntime
}

export interface AgentChromeController {
  canClear: boolean
  cancelClear(): void
  clearConfirmationOpen: boolean
  confirmClear(): void
  labels: AgentChromeLabels
  messageCount: number
  requestClear(): void
  runtimeStatus: AgentRuntimeStatus
  showClear: boolean
  statusLabel: string | null
  userMessageCount: number
}

export function useAgentChromeController({
  labels: labelOverrides,
  runtime,
}: UseAgentChromeControllerOptions): AgentChromeController {
  const status = useStore(runtime.store, state => state.status)
  const messageCount = useStore(runtime.store, state => state.messages.length)
  const userMessageCount = useStore(
    runtime.store,
    state => state.messages.filter(message => message.role === 'user').length
  )
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false)
  const [trackedRuntime, setTrackedRuntime] = useState(runtime)

  // A new runtime is a new conversation. Adjusting during render rather than in
  // an effect means a confirmation raised against the previous runtime is never
  // rendered — let alone confirmable — over the new one.
  if (trackedRuntime !== runtime) {
    setTrackedRuntime(runtime)
    setClearConfirmationOpen(false)
  }

  // Resolved field by field rather than by spreading `labelOverrides`, so the
  // memo keys on the label strings instead of the object's identity. A host
  // writing `labels={{ clear: '…' }}` inline hands us a new object on every
  // render; keying on it would invalidate this memo, then the controller memo
  // below, and with it every context consumer — once per token while
  // streaming, which is exactly what that memo exists to prevent.
  const {
    cancel = DEFAULT_AGENT_CHROME_LABELS.cancel,
    clear = DEFAULT_AGENT_CHROME_LABELS.clear,
    clearConfirm = DEFAULT_AGENT_CHROME_LABELS.clearConfirm,
    clearDescription = DEFAULT_AGENT_CHROME_LABELS.clearDescription,
    clearTitle = DEFAULT_AGENT_CHROME_LABELS.clearTitle,
    close = DEFAULT_AGENT_CHROME_LABELS.close,
    errorStatus = DEFAULT_AGENT_CHROME_LABELS.errorStatus,
    streamingStatus = DEFAULT_AGENT_CHROME_LABELS.streamingStatus,
    submittedStatus = DEFAULT_AGENT_CHROME_LABELS.submittedStatus,
  } = labelOverrides ?? {}

  const labels = useMemo(
    () => ({
      cancel,
      clear,
      clearConfirm,
      clearDescription,
      clearTitle,
      close,
      errorStatus,
      streamingStatus,
      submittedStatus,
    }),
    [
      cancel,
      clear,
      clearConfirm,
      clearDescription,
      clearTitle,
      close,
      errorStatus,
      streamingStatus,
      submittedStatus,
    ]
  )

  const showClear = messageCount > 0
  const canClear = showClear && (status === 'idle' || status === 'error')
  const statusLabel =
    status === 'submitted'
      ? labels.submittedStatus
      : status === 'streaming'
        ? labels.streamingStatus
        : status === 'error'
          ? labels.errorStatus
          : null

  useEffect(() => {
    if (status === 'submitted' || status === 'streaming' || status === 'disposed') {
      setClearConfirmationOpen(false)
    }
  }, [status])

  const requestClear = useCallback(() => {
    if (!canClear) {
      return
    }

    setClearConfirmationOpen(true)
  }, [canClear])

  const cancelClear = useCallback(() => {
    setClearConfirmationOpen(false)
  }, [])

  const confirmClear = useCallback(() => {
    if (runtime.getState().status === 'disposed') {
      return
    }

    setClearConfirmationOpen(false)
    runtime.clear()
  }, [runtime])

  // Chrome puts this object into context, so a fresh identity on every render
  // would invalidate every consumer even when nothing it exposes changed.
  return useMemo(
    () => ({
      canClear,
      cancelClear,
      clearConfirmationOpen,
      confirmClear,
      labels,
      messageCount,
      requestClear,
      runtimeStatus: status,
      showClear,
      statusLabel,
      userMessageCount,
    }),
    [
      canClear,
      cancelClear,
      clearConfirmationOpen,
      confirmClear,
      labels,
      messageCount,
      requestClear,
      status,
      showClear,
      statusLabel,
      userMessageCount,
    ]
  )
}
