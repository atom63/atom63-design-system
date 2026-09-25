# Agent interface plan: `atom63` CLI and MCP server

Status: decided, 2026-09-25. The recommended option was accepted for D1–D6. Phase C, item 3 of
the roadmap ("MCP / CLI + AGENTS.md").

## Goal

An agent building a product with Atom63 should query the design system before it writes UI,
the same way a designer opens the docs. It asks what component fits an idea, what a component's
contract allows, which token to use, and what a good example looks like. It then gets precise,
current answers that come from the same sources the packages are built from. The payoff is the
"pipeline with craft" goal: fewer invented values and fewer misused components, and output that
can be checked.

Two audiences, in order:

1. **Product agents**: agents working in an app that consumes `@atom63/*` (atom63-vite, the demo
   apps, the planned example app). They need to find, understand and compose.
2. **System agents**: agents working in this repo. They already have `pnpm ds:new`, the checks
   and the source. The CLI helps them with lookups, but it is not their main tool.

## What exists today

Every piece of data the interface needs is already generated or checked somewhere. None of it is
reachable from one place:

| Data | Source | Kept honest by |
| --- | --- | --- |
| Component catalog: slug, group, summary, usage, related, status | `apps/docs/src/lib/component-catalog.ts` | `component-catalog.test.ts` |
| Contracts: axes, defaults, slots, states, token slots, archetype | `@atom63/ui-foundation` `*-contract.ts` | typecheck, docs contract tests |
| Web + iOS shared contracts | `cross-renderer-contracts.json` | generator `--check`, conformance tests |
| Guidance and contract as Markdown | `component-docs.ts`, `component-contract.ts` (#60) | docs tests |
| Tokens: CSS var, value, layer, Figma path, Swift name | `packages/styles/generated/atom63.tokens.json`, Swift map | `check:tokens`, `check:figma`, parity tests |
| Examples | co-located `*.stories.tsx` in ui-react and mdx | Storybook render, axe and visual tests |
| Craft rules | `scripts/design-system/lib/craft-rules.mjs` | `check:craft` |
| Docs pages | `apps/docs` `llms.txt` and per-page `.md` | docs build |

## Reference: Astryx

Astryx ships a CLI whose commands also run as MCP tools. What we should copy:

- **One ranked `search`** across components, hooks, docs and templates. Name and keyword matches
  rank above prose mentions, and it matches fuzzily for typos. Every result carries a follow-up
  command.
- **`--json` on every command**, returning a typed envelope `{"type": "component.detail",
  "data": {…}}`.
- **A self-describing manifest** (`astryx manifest --json`): every command, argument, flag type
  and default, and the response `type` names.
- **Stable, append-only error codes** that agents branch on instead of message text.
- **`build <idea>`**, a "composition kit": the closest templates, blocks, components and the
  always-on foundation for an idea.
- **A programmatic API**, the same functions importable from a module.

What we add that Astryx cannot: contracts shared with SwiftUI and tokens that map 1:1 to Figma
and Swift. A query can answer "how does this look on iOS" and "what is this called in Figma".

## Proposed architecture

```
sources (catalog, contracts, tokens, stories, craft rules, docs Markdown)
        │  generated at build time, checked in CI
        ▼
agent index  ──►  query core (pure functions: search, component, token, example, rules)
                          │                    │
                          ▼                    ▼
                  CLI `atom63 …`         MCP server (stdio)
                  text or --json         one tool per command
```

- **Agent index:** one generated JSON file that holds everything a query needs. A consumer
  install then has no repo, no network and no build to depend on. A CI check regenerates it and
  fails on drift, like the audit files.
- **Query core:** pure functions over the index. They are unit-testable, and both front ends
  share them, so the CLI and MCP give the same answer.
- **CLI:** a thin front end over the core. It prints human text by default and a typed envelope
  with `--json`.
- **MCP server:** a thin front end over the core, served over stdio. One tool per CLI command,
  with the same names and inputs, registered from the same command table.

## Commands, version 1

| Command | Input | Returns (`type`) |
| --- | --- | --- |
| `manifest` | none | `manifest`: every command, argument, flag and response type |
| `search <query>` | text, optional `--kind component\|token\|doc\|example` | `search.results`: ranked hits with kind, id, a one-line summary and the follow-up command |
| `component <slug>` | slug | `component.detail`: summary, usage, guidance, import line, exports, contract (axes, defaults, slots, states, token slots, archetype), web + iOS contract when present, related, story names |
| `example <slug> [story]` | slug, optional story | `example.source`: the story's code, as a known-good usage sample |
| `token <query>` | CSS var or text | `token.detail` or `token.results`: value per mode and theme, layer, Figma collection and path, Swift name |
| `rules` | none | `rules`: the craft rules and composition rules an agent must follow, with the reason for each |
| `docs <page>` | page slug | `docs.page`: the page's Markdown |

Error envelope: `{"type": "error", "code": "component.not_found", "message": "…",
"suggestions": [...]}`. Codes are append-only.

Deferred to version 2, after the template library exists: `build <idea>` (composition kit),
`template`, and `doctor` (checks that a consumer app imports the styles, recipes and provider
correctly).

## Decisions

### D1. Where the data comes from

- **Background:** the answers must match the shipped packages exactly, or the tool teaches
  agents wrong things.
- **Options:**
  - **A. A generated agent index**, built from the sources at build time and shipped with the
    CLI. A CI check fails when it is stale.
  - **B. Read the repo sources at query time.** No index, but this only works inside the repo.
  - **C. Fetch the live docs site** (`llms.txt` and the page `.md`). No build step, but it needs
    the network, and it can lag behind the installed version.
- **Trade-offs:** A works offline and matches the installed version, at the cost of a generator
  and a drift check (the repo already runs a dozen of both). B leaves out product agents, who are
  audience 1. C ties answers to deploy timing and adds a network failure mode.
- **Recommendation: A.**

### D2. Package and name

- **Background:** `@atom63/agent` is reserved. The roadmap moves the chat runtime from
  atom63-vite into a package of that name.
- **Options:**
  - **A. New package `@atom63/cli`, binary `atom63`,** holding the index, the query core, the
    CLI and the MCP server (`atom63 mcp`).
  - **B. Two packages:** `@atom63/cli` and `@atom63/mcp`.
  - **C. Scripts in this repo only** (`pnpm ds:query`), with no package.
- **Trade-offs:** A gives one install and one version, and the index can never disagree between
  the CLI and MCP. B splits the MCP SDK dependency out of the CLI, but two packages must stay in
  lockstep. C cannot reach product agents.
- **Recommendation: A**, private at first. A new npm package needs a manual first publish before
  trusted publishing can be configured (the same step still pending for `@atom63/mdx`), and
  release work is on hold. Inside the repo it runs as `pnpm atom63 …`; publishing comes later.

### D3. MCP SDK

- **Background:** the TypeScript SDK v2 is stable. `@modelcontextprotocol/server` 2.0.0 shipped
  on 2026-07-27, and 2.1.0 on 2026-09-23. It implements the 2026-07-28 spec (stateless requests,
  Standard Schema tool schemas) and needs Node ≥ 20 and zod 4. v1 (`@modelcontextprotocol/sdk`)
  gets fixes for at least six months, but no new features.
- **Options:**
  - **A. v2 (`@modelcontextprotocol/server`)** with the stdio transport and zod 4 schemas.
  - **B. v1 (`@modelcontextprotocol/sdk`)**, for older hosts.
- **Trade-offs:** v2 is where the protocol is going, and zod 4 is already in the lockfile.
  Before relying on it, confirm that the hosts we use (Claude Code, Codex) connect to a v2
  server.
- **Recommendation: A.** Step 1 of the implementation proves that with a smoke test.

### D4. How search ranks

- **Background:** agents describe needs in words ("a thing that shows progress"), not slugs.
- **Options:**
  - **A. Weighted text scoring.** Exact name, then name prefix, then keywords (summary, usage,
    exports, token names), then prose. Add typo tolerance (edit distance ≤ 2 on names) and a
    small synonym table maintained with the catalog.
  - **B. Embeddings**, with a vector index shipped in the package.
- **Trade-offs:** A is deterministic, testable with golden queries and has no model dependency.
  B handles paraphrase better, but results shift with the model, the index is large, and it
  cannot be checked in CI.
- **Recommendation: A**, with a golden-query test set (query → expected top hit). Revisit B only
  if the golden set shows gaps that synonyms cannot close.

### D5. What an agent is told to do (AGENTS.md)

- **Background:** a tool helps only if agents know to call it, and know the rules it cannot
  enforce by itself.
- **Options:**
  - **A. Ship an `AGENTS.md` snippet** with the CLI (`atom63 rules` prints it too): query before
    building, use tokens not literals, compose existing components before writing new ones, keep
    logical directions and `:focus-visible`. Consumers copy it into their repo's AGENTS.md.
  - **B. Rules only inside tool results**, with no standing file.
- **Trade-offs:** A reaches agents before their first tool call. B only reaches agents that
  already chose to query.
- **Recommendation: A**, generated from the same rule table as `atom63 rules` so the two cannot
  drift. Add an `AGENTS.md` for this repo too, pointing system agents at `ds:new` and the checks.

### D6. Scope of version 1

- **Background:** `build <idea>` is the most valuable Astryx command, but it needs curated
  templates and blocks, and we have none yet (that is the next roadmap item).
- **Options:**
  - **A. Ship the lookup commands first** (table above), then `build` with the template library.
  - **B. Wait and ship everything together.**
- **Trade-offs:** A gets agents onto contracts and tokens now, and the template work can then
  plug into a proven index and search. B delays all of it behind the slowest part.
- **Recommendation: A.**

## Implementation steps

Each step ends green in CI and is its own pull request.

1. **Index generator and query core.** Add `packages/cli` with a generator that builds
   `agent-index.json` from the catalog, contracts, cross-renderer contracts, tokens, stories
   and docs Markdown. Add `check:agent-index`, and pure query functions with unit tests. The
   generator loads the docs site's own TypeScript helpers (catalog, component docs, contract docs,
   llms Markdown) through Vite's `runnerImport` with the `@atom63/source` condition, so the docs
   pages and the index read one implementation without moving it.
   *Verify:* index generated; drift check fails on a hand edit; tests cover every command's
   core function.
2. **CLI.** `atom63 <command>` with text and `--json` output, typed envelopes, stable error
   codes and `manifest`. Add a golden-query set for `search`.
   *Verify:* snapshot tests of `--json` output for each command, and golden queries rank the
   expected hit first.
3. **MCP server.** `atom63 mcp` over stdio with `@modelcontextprotocol/server` v2. Tools are
   registered from the same command table, so the MCP tool list equals the manifest.
   *Verify:* an in-process MCP client test lists tools and calls each one; a manual check that
   Claude Code connects (`claude mcp add atom63 -- pnpm atom63 mcp`) and that a query returns
   the same data as the CLI.
4. **AGENTS.md.** The consumer snippet, `atom63 rules`, and this repo's `AGENTS.md`, all from one
   rule table.
   *Verify:* a test that the snippet and `rules` output come from the same table.
5. **Trial.** Give an agent a small product task in the example app with and without the tool,
   and compare invented values, misused components and craft violations. This previews the
   phase E vibe tests.

## Risks

- **The index drifts from the packages.** The CI drift check covers it, the same way the audit
  files are covered.
- **The docs helpers change shape.** The generator imports them as they are, so a change that
  breaks it also fails the index drift check in the same pull request.
- **The v2 SDK in older hosts.** Step 3 checks this before we depend on it; v1 stays a fallback
  (D3).
- **Answers that are too long for a context window.** Every command has a compact text form, and
  `component` returns the contract and a list of story names, not every story's code.

## Sources

- Astryx CLI documentation: <https://astryx.atmeta.com/docs/cli>
- MCP TypeScript SDK v2: <https://ts.sdk.modelcontextprotocol.io/v2/>
- MCP blog, SDK betas for the 2026-07-28 spec: <https://blog.modelcontextprotocol.io/posts/sdk-betas-2026-07-28/>
- npm, `@modelcontextprotocol/server` (2.1.0, 2026-09-23): <https://www.npmjs.com/package/@modelcontextprotocol/server>
