import type { InformMessage, InformRegistry } from './types'

export function dismissalKey(message: Pick<InformMessage, 'id' | 'version'>): string {
  return `${message.id}:${message.version ?? 1}`
}

function assertValidDate(value: string | undefined, field: string, id: string): number | undefined {
  if (value === undefined) return undefined

  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Inform message "${id}" has an invalid "${field}": ${value}`)
  }
  return parsed
}

/**
 * Validates a registry at module load. A malformed message is a build-time
 * authoring mistake, so it throws rather than being skipped at render.
 */
export function defineInformRegistry(messages: readonly InformMessage[]): InformRegistry {
  const seen = new Set<string>()

  for (const message of messages) {
    if (seen.has(message.id)) {
      throw new Error(`Duplicate inform message id "${message.id}".`)
    }
    seen.add(message.id)

    if (!Number.isFinite(message.priority)) {
      throw new Error(`Inform message "${message.id}" needs a finite "priority".`)
    }

    if (message.surface === 'spotlight') {
      if (message.anchor === undefined || message.anchor.trim() === '') {
        throw new Error(`Inform message "${message.id}" requires an "anchor" to spotlight.`)
      }
    } else if (message.anchor !== undefined) {
      throw new Error(
        `Inform message "${message.id}" sets "anchor", which is only valid on the "spotlight" surface.`
      )
    }

    const startsAt = assertValidDate(message.startsAt, 'startsAt', message.id)
    const endsAt = assertValidDate(message.endsAt, 'endsAt', message.id)
    if (startsAt !== undefined && endsAt !== undefined && endsAt <= startsAt) {
      throw new Error(`Inform message "${message.id}": "endsAt" must come after "startsAt".`)
    }
  }

  return { messages: [...messages] }
}
