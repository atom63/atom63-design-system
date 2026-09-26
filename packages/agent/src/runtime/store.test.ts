import { describe, expect, it } from 'vitest'
import { createAgentStore } from './store'

describe('createAgentStore', () => {
  it('creates isolated JSON-safe thread state', () => {
    const first = createAgentStore({ threadId: 'thread-a' })
    const second = createAgentStore({ threadId: 'thread-b' })

    first.setState({
      ...first.getState(),
      draft: 'hello',
    })

    expect(first.getState().draft).toBe('hello')
    expect(second.getState().draft).toBe('')
    expect(JSON.parse(JSON.stringify(first.getState()))).toEqual(first.getState())
  })

  it('copies initial messages so callers cannot mutate store state', () => {
    const initialMessages = [
      {
        createdAt: '2026-09-01T20:00:00.000Z',
        id: 'message-1',
        parts: [{ type: 'text' as const, text: 'Hello' }],
        role: 'user' as const,
        status: 'complete' as const,
      },
    ]
    const store = createAgentStore({ initialMessages, threadId: 'thread-a' })

    initialMessages[0]!.parts[0]!.text = 'mutated'

    expect(store.getState().messages[0]?.parts[0]).toEqual({
      type: 'text',
      text: 'Hello',
    })
  })
})
