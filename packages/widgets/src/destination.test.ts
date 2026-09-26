import { describe, expect, it } from 'vitest'
import { resolveDestination, resolveDestinationKind } from './destination'

/** jsdom serves the suite from a fixed origin; resolve against that one. */
const ORIGIN = globalThis.window.location.origin

describe('resolveDestination', () => {
  it('treats in-app paths and hashes as internal, unchanged', () => {
    expect(resolveDestination('/projects/windows-11')).toEqual({
      kind: 'internal',
      href: '/projects/windows-11',
    })
    expect(resolveDestination('#section')).toEqual({ kind: 'internal', href: '#section' })
  })

  it('treats protocol-relative urls as external', () => {
    expect(resolveDestination('//example.com/thing')).toEqual({
      kind: 'external',
      href: '//example.com/thing',
    })
  })

  // The card authors one absolute URL for both hosts. On its own origin that
  // is an in-app route, and a router can only route a path — an absolute URL
  // still points at the right page, so this fails silently: the link works but
  // routes nothing, and atom63.io reloads the site instead of opening the
  // project overlay.
  it('normalises a same-origin absolute url to a path', () => {
    expect(resolveDestination(`${ORIGIN}/projects/windows-11`)).toEqual({
      kind: 'internal',
      href: '/projects/windows-11',
    })
  })

  it('keeps search and hash when normalising', () => {
    expect(resolveDestination(`${ORIGIN}/resume?doc=cv#skills`)).toEqual({
      kind: 'internal',
      href: '/resume?doc=cv#skills',
    })
  })

  it('leaves a cross-origin url exactly as authored', () => {
    expect(resolveDestination('https://www.behance.net/atom63')).toEqual({
      kind: 'external',
      href: 'https://www.behance.net/atom63',
    })
  })

  it('treats a relative path as internal', () => {
    expect(resolveDestination('projects/windows-11')?.kind).toBe('internal')
  })

  it('reports no destination for protocols that leave the web', () => {
    expect(resolveDestination('mailto:hi@atom63.io')).toBeNull()
    expect(resolveDestination('tel:+15550100')).toBeNull()
    expect(resolveDestination('sms:+15550100')).toBeNull()
  })

  it('reports no destination for a missing href', () => {
    expect(resolveDestination(undefined)).toBeNull()
    expect(resolveDestination('')).toBeNull()
    expect(resolveDestination('   ')).toBeNull()
  })
})

describe('resolveDestination with declared app origins', () => {
  const REMOTE = 'https://atom63.io'

  // In production the running origin answers this. On localhost and on preview
  // deployments it does not, and the card silently becomes an external link
  // that leaves for production — which is every environment a change is
  // actually tested in.
  it('treats a declared origin as in-app and normalises it to a path', () => {
    expect(resolveDestination(`${REMOTE}/projects/windows-11`, [REMOTE])).toEqual({
      kind: 'internal',
      href: '/projects/windows-11',
    })
  })

  it('still treats an undeclared origin as external', () => {
    expect(resolveDestination('https://www.behance.net/atom63', [REMOTE])?.kind).toBe('external')
  })

  // OS63 declares nothing, because from there these genuinely leave the app.
  it('treats the same href as external when no origin is declared', () => {
    expect(resolveDestination(`${REMOTE}/projects/windows-11`)).toEqual({
      kind: 'external',
      href: `${REMOTE}/projects/windows-11`,
    })
  })

  it('keeps the running origin in-app regardless of what is declared', () => {
    expect(resolveDestination(`${ORIGIN}/projects/x`, [REMOTE])?.kind).toBe('internal')
  })
})

describe('resolveDestinationKind', () => {
  it('reports the kind without the href', () => {
    expect(resolveDestinationKind(`${ORIGIN}/projects/x`)).toBe('internal')
    expect(resolveDestinationKind('https://www.behance.net/atom63')).toBe('external')
    expect(resolveDestinationKind('mailto:hi@atom63.io')).toBeNull()
  })
})
