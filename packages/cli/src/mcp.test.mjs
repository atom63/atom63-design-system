import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

import { runCli } from './bin.mjs'
import { commands } from './commands.mjs'
import { createAtomServer } from './mcp.mjs'

const samples = {
  search: { query: 'date picker', limit: 3 },
  component: { slug: 'dialog' },
  example: { slug: 'badge', story: 'Sizes' },
  token: { query: '--a63-surface-page' },
  docs: { slug: 'theme-system' },
  rules: {},
  agents: {},
  manifest: {},
}

describe('atom63 MCP server', () => {
  let client
  before(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await createAtomServer().connect(serverTransport)
    client = new Client({ name: 'test', version: '0.0.0' })
    await client.connect(clientTransport)
  })
  after(() => client.close())

  it('lists one read-only tool per command, with typed inputs', async () => {
    const { tools } = await client.listTools()
    assert.deepEqual(
      tools.map(tool => tool.name),
      commands.map(command => command.name)
    )
    const search = tools.find(tool => tool.name === 'search')
    assert.deepEqual(search.inputSchema.required, ['query'])
    assert.deepEqual(search.inputSchema.properties.kind.enum, [
      'component',
      'token',
      'doc',
      'example',
    ])
    assert.equal(search.inputSchema.properties.limit.type, 'integer')
    for (const tool of tools) assert.equal(tool.annotations.readOnlyHint, true, tool.name)
  })

  for (const command of commands) {
    it(`answers ${command.name} with the same envelope as the CLI`, async () => {
      const input = samples[command.name]
      assert.ok(input, `add a sample input for ${command.name}`)
      const result = await client.callTool({ name: command.name, arguments: input })
      assert.ok(!result.isError, JSON.stringify(result.content))
      assert.ok(command.returns.includes(result.structuredContent.type))
      assert.ok(result.content[0].text.length > 0)

      const argv = [
        command.name,
        ...command.args.flatMap(arg => (input[arg.name] ? [input[arg.name]] : [])),
        ...command.flags.flatMap(flag =>
          input[flag.name] === undefined ? [] : [`--${flag.name}`, String(input[flag.name])]
        ),
        '--json',
      ]
      assert.deepEqual(result.structuredContent, JSON.parse(runCli(argv).output))
    })
  }

  it('returns a coded error result for a failed query', async () => {
    const result = await client.callTool({ name: 'component', arguments: { slug: 'buton' } })
    assert.equal(result.isError, true)
    assert.equal(result.structuredContent.data.code, 'component.not_found')
    assert.deepEqual(result.structuredContent.data.suggestions, ['button'])
  })

  it('rejects input that breaks the schema', async () => {
    const result = await client.callTool({ name: 'search', arguments: { query: 'x', limit: 0 } })
    assert.equal(result.isError, true)
  })
})

describe('atom63 mcp over stdio', () => {
  it('serves a host that launches `atom63 mcp`', async () => {
    const bin = fileURLToPath(new URL('./bin.mjs', import.meta.url))
    const stdioClient = new Client({ name: 'stdio-test', version: '0.0.0' })
    await stdioClient.connect(
      new StdioClientTransport({ command: process.execPath, args: [bin, 'mcp'], stderr: 'pipe' })
    )
    try {
      const { tools } = await stdioClient.listTools()
      assert.equal(tools.length, commands.length)
      const result = await stdioClient.callTool({ name: 'component', arguments: { slug: 'kbd' } })
      assert.equal(result.structuredContent.type, 'component.detail')
    } finally {
      await stdioClient.close()
    }
  })
})
