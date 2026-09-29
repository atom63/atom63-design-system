/**
 * Turns a token set into use_figma scripts: the runtime plus a packed part of
 * the token set, each under Figma MCP's 50,000-character limit. Variables are
 * ordered so an alias target is always written by the same or an earlier
 * script; every script carries every collection, so modes exist first.
 */
import { type PackedModel, packModel } from './pack'
import type { SyncModel, SyncVariable } from './plan'
import { RUNTIME_SOURCE } from './runtime-source.generated'

/** Figma MCP accepts 50,000 characters; keep a margin for how the host passes the code. */
const LIMIT = 49_000

interface Entry {
  collection: string
  variable: SyncVariable
}

function targets(variable: SyncVariable): string[] {
  return Object.values(variable.values).flatMap(value =>
    'alias' in value ? [value.alias] : 'composed' in value ? [value.composed.alias] : []
  )
}

/** Every variable, alias targets first. */
function ordered(model: SyncModel): Entry[] {
  const entries = model.collections.flatMap(collection =>
    collection.variables.map(variable => ({ collection: collection.name, variable }))
  )
  const byToken = new Map(entries.map(entry => [entry.variable.token, entry]))
  const done = new Set<string>()
  const out: Entry[] = []
  const visit = (entry: Entry) => {
    if (done.has(entry.variable.token)) return
    done.add(entry.variable.token)
    for (const target of targets(entry.variable)) {
      const next = byToken.get(target)
      if (next) visit(next)
    }
    out.push(entry)
  }
  entries.forEach(visit)
  return out
}

function partOf(model: SyncModel, entries: Entry[]): SyncModel {
  return {
    ...model,
    collections: model.collections.map(collection => ({
      ...collection,
      variables: entries
        .filter(entry => entry.collection === collection.name)
        .map(entry => entry.variable),
    })),
  }
}

function wrap(packed: PackedModel, action: 'sync' | 'check', part: number, parts: number) {
  return `${RUNTIME_SOURCE}\nconst result = await A63Figma.${action}(figma, ${JSON.stringify(packed)});\nreturn { part: ${part}, parts: ${parts}, ...result };`
}

export function buildScripts(
  model: SyncModel,
  action: 'sync' | 'check',
  { maxLength = LIMIT }: { maxLength?: number } = {}
): string[] {
  const entries = ordered(model)
  // A script's size is the runtime and the collection headers plus each variable's packed size.
  const base = wrap(packModel(partOf(model, [])), action, 99, 99).length
  const sizeOf = (entry: Entry) =>
    JSON.stringify(packModel(partOf(model, [entry])).c.flatMap(item => item[2])[0]).length + 1
  const budget = maxLength - base - 256 // room for scope lists that only some parts carry
  const groups: Entry[][] = [[]]
  let used = 0
  for (const entry of entries) {
    const size = sizeOf(entry)
    if (used + size > budget && groups[groups.length - 1].length > 0) {
      groups.push([])
      used = 0
    }
    groups[groups.length - 1].push(entry)
    used += size
  }
  const scripts = groups.map((group, index) =>
    wrap(packModel(partOf(model, group)), action, index + 1, groups.length)
  )
  for (const script of scripts)
    if (script.length >= maxLength)
      throw new Error(`A sync script is ${script.length} characters, over ${maxLength}`)
  return scripts
}

/**
 * A read-only script that returns one page of the file's variables; the result
 * says how many pages there are. Merge the pages with mergeSnapshots.
 */
export function buildReadScript(page = 1): string {
  return `${RUNTIME_SOURCE}\nreturn await A63Figma.read(figma, ${Math.max(1, Math.floor(page))});`
}
