import assert from 'node:assert/strict'
import { it } from 'node:test'

import { commandLine, execCommandSync, quoteArg, spawnServer, stopCommand } from './command.mjs'

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

/* A parent that leaves its own child running when it is stopped, as `pnpm exec
   vite preview` does on macOS. The child prints its pid once it is set up. */
const parentWithChild = ignoreTerm => [
  '-e',
  `const { spawn } = require('node:child_process')
   spawn(process.execPath, ['-e', ${JSON.stringify(
     `${ignoreTerm ? "process.on('SIGTERM', () => {});" : ''} process.stdout.write(String(process.pid)); setInterval(() => {}, 1000)`
   )}], { stdio: ['ignore', 'inherit', 'ignore'] })
   setInterval(() => {}, 1000)`,
]

const alive = pid => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function grandchildAfterStop(ignoreTerm, waitMs) {
  const server = spawnServer(process.execPath, parentWithChild(ignoreTerm), {
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const pid = await new Promise(resolve =>
    server.stdout.once('data', data => resolve(Number(data)))
  )
  stopCommand(server)
  const deadline = Date.now() + waitMs
  while (alive(pid) && Date.now() < deadline) await new Promise(r => setTimeout(r, 100))
  const stillAlive = alive(pid)
  if (stillAlive) process.kill(pid, 'SIGKILL')
  return stillAlive
}

it(
  'stops the whole tree behind a server, not just its wrapper',
  { skip: process.platform === 'win32' },
  async () => {
    assert.equal(await grandchildAfterStop(false, 3000), false)
  }
)

it(
  'kills a server that ignores SIGTERM once the grace period ends',
  { skip: process.platform === 'win32' },
  async () => {
    assert.equal(await grandchildAfterStop(true, 8000), false)
  }
)
