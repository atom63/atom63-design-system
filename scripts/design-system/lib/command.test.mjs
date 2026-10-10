import assert from 'node:assert/strict'
import { it } from 'node:test'

import { commandLine, execCommandSync, quoteArg } from './command.mjs'

it('leaves plain arguments, scoped names and paths unquoted', () => {
  assert.equal(quoteArg('--filter'), '--filter')
  assert.equal(quoteArg('@atom63/ui-react@0.2.0-beta.10'), '@atom63/ui-react@0.2.0-beta.10')
  assert.equal(quoteArg('C:\\work\\atom63\\tarballs'), 'C:\\work\\atom63\\tarballs')
})

it('quotes arguments with spaces or shell characters', () => {
  assert.equal(quoteArg('a b'), '"a b"')
  assert.equal(quoteArg('x&y'), '"x&y"')
  assert.equal(quoteArg('%PATH%'), '"%PATH%"')
  assert.equal(quoteArg('say "hi"'), '"say \\"hi\\""')
})

it('joins the command and its arguments into one line', () => {
  assert.equal(
    commandLine('pnpm', ['exec', 'prettier', '--write', 'a b.ts']),
    'pnpm exec prettier --write "a b.ts"'
  )
})

it('runs a command and passes arguments through intact', () => {
  const output = execCommandSync(
    'node',
    ['-e', 'process.stdout.write(JSON.stringify(process.argv.slice(1)))', 'a b', '--x'],
    { encoding: 'utf8' }
  )
  assert.deepEqual(JSON.parse(output), ['a b', '--x'])
})
