import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { agentsBlock, markers, syncAgentsBlock } from './agents-md.mjs'
import { rules } from './rules.mjs'

describe('AGENTS.md section', () => {
  it('states every rule and its reason from the rule table', () => {
    const block = agentsBlock()
    for (const rule of rules) {
      assert.ok(block.includes(rule.rule), rule.id)
      assert.ok(block.includes(rule.why), rule.id)
    }
    assert.ok(block.startsWith(markers.start) && block.endsWith(markers.end))
  })

  it('points projects without the CLI at the published docs', () => {
    const block = agentsBlock({ variant: 'docs' })
    assert.match(block, /https:\/\/system\.atom63\.io\/llms\.txt/)
    assert.doesNotMatch(block, /atom63 search/)
    for (const rule of rules) assert.ok(block.includes(rule.rule), rule.id)
  })

  it('replaces only the marked block', () => {
    const before = `# Guide\n\nKeep me.\n\n${markers.start}\nold\n${markers.end}\n\nAnd me.\n`
    const after = syncAgentsBlock(before)
    assert.ok(after.startsWith('# Guide\n\nKeep me.\n\n'))
    assert.ok(after.endsWith('\n\nAnd me.\n'))
    assert.ok(after.includes('## Building UI with Atom63'))
    assert.equal(syncAgentsBlock(after), after)
  })

  it('refuses a file without the markers', () => {
    assert.throws(() => syncAgentsBlock('# No block here\n'), /no atom63:agents block/)
  })

  it("keeps this repo's AGENTS.md in step with the table", () => {
    const file = readFileSync(new URL('../../../AGENTS.md', import.meta.url), 'utf8')
    assert.equal(syncAgentsBlock(file), file)
  })
})
