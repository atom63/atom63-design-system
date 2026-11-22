import type { AgentTransport } from '@atom63/agent'

import { answerFromContent } from './answers'

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>(resolve => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })

/**
 * The offline transport: it answers from the site's content (answers.ts) and
 * streams the reply word by word, the way a model would. It needs no network
 * and no API key.
 *
 * To use a real model, replace it with a transport that calls your own
 * server (never put an API key in the browser). The README has an example.
 */
export const offlineTransport: AgentTransport = {
  async *stream(request, { signal }) {
    const question = request.messages.filter(message => message.role === 'user').at(-1)
    yield { runId: request.runId, type: 'response-start' }
    for (const word of answerFromContent(question?.content ?? '').split(/(?<=\s)/)) {
      if (signal.aborted) return
      await wait(24, signal)
      yield { delta: word, runId: request.runId, type: 'text-delta' }
    }
    yield { runId: request.runId, type: 'finish' }
  },
}

/** The transport the assistant uses. Swap it here. */
export const transport: AgentTransport = offlineTransport
