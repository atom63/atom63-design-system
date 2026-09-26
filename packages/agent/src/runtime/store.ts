import { createStore, type StoreApi } from 'zustand/vanilla'
import type { AgentMessage, AgentRuntimeState } from './types'

export type AgentStore = StoreApi<AgentRuntimeState>

export interface CreateAgentStoreOptions {
  initialMessages?: AgentMessage[]
  threadId: string
}

export function createAgentStore({
  initialMessages = [],
  threadId,
}: CreateAgentStoreOptions): AgentStore {
  return createStore<AgentRuntimeState>()(() => ({
    activeRunId: null,
    draft: '',
    error: null,
    messages: structuredClone(initialMessages),
    status: 'idle',
    threadId,
  }))
}
