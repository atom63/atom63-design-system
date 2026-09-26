import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { craftCriteria, craftRubricMarkdown, summarizeCraftScores } from './craft-rubric.mjs'

const allScores = score =>
  craftCriteria.map(({ id }) => ({ criterion: id, evidence: 'Rows use gap-4.', score }))

describe('craftCriteria', () => {
  it('has 5 to 7 criteria with unique ids and all three levels', () => {
    assert.ok(craftCriteria.length >= 5 && craftCriteria.length <= 7)
    assert.equal(new Set(craftCriteria.map(({ id }) => id)).size, craftCriteria.length)
    for (const criterion of craftCriteria) {
      assert.deepEqual(Object.keys(criterion.levels).sort(), ['1', '2', '3'], criterion.id)
      assert.ok(criterion.definition && criterion.judged && criterion.automated.length)
    }
  })

  it('renders one Markdown section per criterion', () => {
    const markdown = craftRubricMarkdown()
    for (const { name } of craftCriteria) assert.match(markdown, new RegExp(`^## ${name}$`, 'm'))
  })
})

describe('summarizeCraftScores', () => {
  it('totals the scores and passes when no criterion scores 1', () => {
    const result = summarizeCraftScores(allScores(2))
    assert.equal(result.total, craftCriteria.length * 2)
    assert.equal(result.max, craftCriteria.length * 3)
    assert.equal(result.passed, true)
  })

  it('fails a result with any criterion at 1, whatever the total', () => {
    const scores = allScores(3)
    scores[0].score = 1
    assert.equal(summarizeCraftScores(scores).passed, false)
  })

  it('rejects unknown, duplicate, missing and unexplained criteria', () => {
    const [first, ...rest] = allScores(2)
    assert.throws(() => summarizeCraftScores({}), /must be an array/)
    assert.throws(
      () => summarizeCraftScores([...rest, { ...first, criterion: 'vibes' }]),
      /Unknown/
    )
    assert.throws(() => summarizeCraftScores([first, first, ...rest]), /Duplicate/)
    assert.throws(() => summarizeCraftScores(rest), /Missing/)
    assert.throws(() => summarizeCraftScores([{ ...first, score: 4 }, ...rest]), /1, 2 or 3/)
    assert.throws(() => summarizeCraftScores([{ ...first, evidence: ' ' }, ...rest]), /evidence/)
  })
})
