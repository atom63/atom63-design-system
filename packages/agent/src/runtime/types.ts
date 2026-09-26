export type AgentMessageRole = 'user' | 'assistant' | 'system'
export type AgentMessageStatus = 'complete' | 'streaming' | 'error'
export type AgentRuntimeStatus = 'idle' | 'submitted' | 'streaming' | 'error' | 'disposed'

export interface AgentTextPart {
  text: string
  type: 'text'
}

export type AgentMessagePart = AgentTextPart

export type AgentErrorCode =
  | 'network'
  | 'timeout'
  | 'rate-limited'
  | 'quota-exceeded'
  | 'unauthorized'
  | 'invalid-request'
  | 'invalid-response'
  | 'invalid-state'
  | 'unknown'

export interface AgentPublicError {
  code: AgentErrorCode
  message: string
  retryable: boolean
}

export interface AgentMessage {
  createdAt: string
  error?: AgentPublicError
  id: string
  parts: AgentMessagePart[]
  role: AgentMessageRole
  status: AgentMessageStatus
}

export interface AgentRuntimeState {
  activeRunId: string | null
  draft: string
  error: AgentPublicError | null
  messages: AgentMessage[]
  status: AgentRuntimeStatus
  threadId: string
}

export interface AgentInput {
  text: string
}

export type AgentRunOutcome = 'completed' | 'aborted' | 'failed'

export interface AgentRunResult {
  error?: AgentPublicError
  messageId?: string
  outcome: AgentRunOutcome
  runId: string
}
