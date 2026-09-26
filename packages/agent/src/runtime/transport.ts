import type { AgentPublicError } from './types'

export interface AgentTransportMessage {
  content: string
  role: 'user' | 'assistant' | 'system'
}

export interface AgentRunRequest {
  messages: AgentTransportMessage[]
  runId: string
  threadId: string
}

export type AgentTransportEvent =
  | { runId: string; type: 'response-start' }
  | { delta: string; runId: string; type: 'text-delta' }
  | { runId: string; type: 'finish' }

export interface AgentTransport {
  stream(
    request: AgentRunRequest,
    context: { signal: AbortSignal }
  ): AsyncIterable<AgentTransportEvent>
}

export class AgentTransportError extends Error {
  readonly publicError: AgentPublicError

  constructor(publicError: AgentPublicError, options?: ErrorOptions) {
    super(publicError.message, options)
    this.name = 'AgentTransportError'
    this.publicError = publicError
  }
}
