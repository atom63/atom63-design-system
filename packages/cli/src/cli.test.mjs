import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { runCli } from './bin.mjs'
import { commands, errorCodes } from './commands.mjs'

const json = argv => {
  const result = runCli([...argv, '--json'])
  return { ...result, envelope: JSON.parse(result.output) }
}

/** One valid invocation per command, so every command is exercised end to end. */
const samples = {
  search: ['search', 'dialog'],
  component: ['component', 'dialog'],
  example: ['example', 'badge', 'Sizes'],
  token: ['token', '--a63-surface-page'],
  docs: ['docs', 'theme-system'],
  rules: ['rules'],
  manifest: ['manifest'],
}

describe('atom63 CLI', () => {
  it('describes exactly the command table in its manifest', () => {
    const { envelope } = json(['manifest'])
    assert.equal(envelope.type, 'manifest')
    assert.deepEqual(
      envelope.data.commands.map(command => command.name),
      commands.map(command => command.name)
    )
    assert.deepEqual(envelope.data.errorCodes, errorCodes)
  })

  for (const command of commands) {
    it(`answers \`${command.name}\` with a declared type, as JSON and as text`, () => {
      const argv = samples[command.name]
      assert.ok(argv, `add a sample invocation for ${command.name}`)
      const { exitCode, envelope } = json(argv)
      assert.equal(exitCode, 0)
      assert.ok(command.returns.includes(envelope.type), envelope.type)
      const text = runCli(argv)
      assert.equal(text.exitCode, 0)
      assert.ok(text.output.trim().length > 0)
    })
  }

  it('renders every response type a command declares, including token.results', () => {
    const { envelope } = json(['token', 'on', 'media', 'surface'])
    assert.equal(envelope.type, 'token.results')
    assert.match(runCli(['token', 'on', 'media', 'surface']).output, /--a63-on-media-surface/)
  })

  it('joins the words of an unquoted query', () => {
    const { envelope } = json(['search', 'date', 'picker', '--limit', '1'])
    assert.equal(envelope.data.query, 'date picker')
    assert.equal(envelope.data.results[0].id, 'calendar')
  })

  it('exits 1 with a coded error envelope when a query fails', () => {
    const { exitCode, envelope } = json(['component', 'buton'])
    assert.equal(exitCode, 1)
    assert.deepEqual(envelope, {
      type: 'error',
      data: {
        code: 'component.not_found',
        message: 'No component "buton".',
        suggestions: ['button'],
      },
    })
  })

  it('exits 2 for a wrong command line', () => {
    assert.equal(json(['nope']).envelope.data.code, 'usage.unknown_command')
    assert.equal(json(['component']).envelope.data.code, 'usage.missing_argument')
    assert.equal(json(['search', 'x', '--kind', 'widget']).envelope.data.code, 'usage.invalid_flag')
    assert.equal(json(['search', 'x', '--limit', '0']).envelope.data.code, 'usage.invalid_flag')
    assert.equal(json(['search', 'x', '--bogus']).envelope.data.code, 'usage.invalid_flag')
    for (const argv of [['nope'], ['component'], ['search', 'x', '--limit', '0']]) {
      assert.equal(runCli(argv).exitCode, 2)
    }
  })

  it('only uses documented error codes', () => {
    const codes = [
      json(['nope']),
      json(['component']),
      json(['component', 'buton']),
      json(['example', 'badge', 'Size']),
      json(['docs', 'nope']),
    ].map(result => result.envelope.data.code)
    for (const code of codes) assert.ok(errorCodes.includes(code), code)
  })

  it('prints the manifest for no command or --help', () => {
    assert.match(runCli([]).output, /^atom63 search <query>/)
    assert.match(runCli(['--help']).output, /^atom63 search <query>/)
  })

  it('runs as an executable: JSON on stdout, exit code from the result', () => {
    const bin = fileURLToPath(new URL('./bin.mjs', import.meta.url))
    const ok = execFileSync(process.execPath, [bin, 'component', 'kbd', '--json'], {
      encoding: 'utf8',
    })
    assert.equal(JSON.parse(ok).type, 'component.detail')
    const missing = spawnSync(process.execPath, [bin, 'component', 'buton', '--json'], {
      encoding: 'utf8',
    })
    assert.equal(missing.status, 1)
    assert.equal(JSON.parse(missing.stdout).data.code, 'component.not_found')
  })
})
