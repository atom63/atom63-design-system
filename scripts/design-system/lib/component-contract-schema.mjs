/**
 * Validates the component contract sources against
 * contracts/schema/component-intent.schema.json. It lives apart from
 * component-contracts.mjs because it needs ajv, and the iOS CI job runs the
 * cross-renderer generator, which reads that module, without installing
 * dependencies.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import Ajv2020 from 'ajv/dist/2020.js'

import { contractsDir } from './component-contracts.mjs'

/** Every schema problem in the sources, as `<source id><field path>: <message>`. */
export function schemaProblems(root, sources) {
  const schema = JSON.parse(
    readFileSync(path.join(root, contractsDir, 'schema/component-intent.schema.json'), 'utf8')
  )
  const validate = new Ajv2020({ allErrors: true }).compile(schema)
  const problems = []
  for (const source of sources.values()) {
    if (validate(source.doc)) continue
    for (const { instancePath, message, params } of validate.errors) {
      const detail = params.additionalProperty ?? params.allowedValues?.join(', ')
      problems.push(`${source.id}${instancePath || '/'}: ${message}${detail ? ` (${detail})` : ''}`)
    }
  }
  return problems
}
