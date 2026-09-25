# @atom63/cli

Query the Atom63 design system from the command line or an MCP host: components, their contracts
(including the shared web and iOS contract), tokens with their Figma and Swift names, story
examples, docs pages and the rules for building UI with the system. The plan and its decisions
are in [`docs/design-system/agent-interface-plan.md`](../../docs/design-system/agent-interface-plan.md).

Private while the interface settles. Status by step:

1. **Agent index and query core.** `generated/agent-index.json` holds every answer, so queries
   need no repo, network or build. `src/core.mjs` exposes `search`, `component`, `example`,
   `token`, `docsPage` and `rules`. Each returns `{ type, data }` or throws an `AtomError` with a
   stable `code`.
2. **The `atom63` command.** See below.
3. `atom63 mcp`, an MCP server over stdio.
4. The AGENTS.md snippet, generated from `src/rules.mjs`.

## Usage

In this repo, run it through the root script:

```bash
pnpm atom63 search date picker
pnpm atom63 component dialog
pnpm atom63 example badge Sizes
pnpm atom63 token --a63-surface-page
pnpm atom63 docs theme-system
pnpm atom63 rules
pnpm atom63 manifest --json
```

Every command takes `--json` and prints one typed envelope on stdout, `{ "type": …, "data": … }`.
Failures print `{ "type": "error", "data": { "code", "message", "suggestions" } }`. The exit code
is 0 for an answer, 1 for a failed query (for example an unknown component) and 2 for a wrong
command line. `manifest` lists every command, argument, flag, response type and error code.
Error codes are append-only: once shipped, a code keeps its meaning. The command table in
`src/commands.mjs` defines the CLI and the manifest, and it will define the MCP tools too.

## Keeping the index current

The index is generated from the component catalog and docs helpers in `apps/docs`, the contracts
in `@atom63/ui-foundation`, the token manifest in `@atom63/styles`, the Swift token map and the
co-located stories. CI fails when it is stale:

```bash
pnpm --filter @atom63/cli generate:index
pnpm check:agent-index
```

Search quality is pinned by the golden queries in `src/core.test.mjs`. When a query should find a
component by another word, add it to `src/synonyms.mjs` and to the golden list.
