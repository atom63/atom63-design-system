# Vibe tests

`pnpm vibe` asks whether agents build better UI with the Atom63 tools than without them (E4 in
`docs/design-system/quality-plan.md`). It runs on demand on a developer machine; there is no
scheduled workflow. Each run writes a report that you commit.

## Run it

```bash
pnpm --filter "@atom63/mdx..." --filter "@atom63/ui-react..." build   # the ds arm packs dist
pnpm vibe --dry-run                  # set up every project and print the claude commands
pnpm vibe --brief sign-in            # one brief, both arms and the judge
pnpm vibe --yes                      # every brief (spends real money)
```

| Flag | Effect |
| --- | --- |
| `--brief <id>` | Run one brief (a file name in `briefs/` without `.md`). |
| `--arms ds,plain` | Pick the arms. Default: both. |
| `--model <id>` | Model for the builders and the judge. Default: the `claude` CLI default. |
| `--dry-run` | Pack, generate and install the projects, print the planned commands, call no agent. |
| `--keep` | Keep the temporary directory (projects, full-size screenshots, judge folder). |
| `--yes` | Required to run more than one brief. |

It needs a logged-in `claude` CLI, Playwright's Chromium (`pnpm exec playwright install chromium`)
and the network for third-party dependencies. Before it starts, it prints the cost ceiling: each
builder is capped at $5 and 80 turns and each judge at $2 (`--max-budget-usd`, `--max-turns`).

## What a run does

For each brief, two fresh `claude -p` agents get the same prompt: build the brief as a new page at
`/<brief id>`, add no dependencies, and leave `pnpm typecheck` and `pnpm build` passing.

- **`ds`:** a site from `@atom63/create`, installed against freshly packed tarballs of the design
  system packages (as `check:starter` does). Its `AGENTS.md` carries the `atom63` CLI rules block,
  and the agent gets the `atom63` MCP server from this repo.
- **`plain`:** Vite, React, TypeScript, Tailwind v4 and lucide-react at the versions the starter
  uses. No design system, no `AGENTS.md`, no MCP server, no router.

Both run with `--permission-mode dontAsk` and an allowlist: read, search and edit files inside the
project, and run `pnpm typecheck` and `pnpm build`. Everything else, including other shell
commands and writes outside the project, is denied. `--setting-sources project,local` keeps the
user's own `CLAUDE.md`, skills and settings out of the runs, and `--strict-mcp-config` keeps other
MCP servers out.

Then, on the source files each agent added or changed:

- **Craft violations:** the `check:craft` rules (`raw-color`, `physical-properties`,
  `focus-visible`).
- **Type errors:** `tsc --noEmit`; and whether `vite build` succeeds.
- **axe violations:** the build is served with `vite preview`, the page opened in Chromium at
  1280 px, and axe-core run on it.
- **System-component share:** JSX elements imported from `@atom63/*`, divided by those plus
  third-party components and interactive HTML elements (`button`, `input`, `a`, `select` and so
  on). Icons and components defined in the project are left out of both sides; their bodies are
  counted where they are defined. The plain arm scores 0% by construction; its raw counts are
  still reported.
- **Literal values:** Tailwind palette or arbitrary color utilities (`bg-blue-500`,
  `bg-[#fafafa]`), and hex, `rgb()`, `hsl()` or `oklch()` colors elsewhere.

Finally a third `claude -p` run judges both results against the craft rubric
(`scripts/design-system/lib/craft-rubric.mjs`). It reads full-page light-mode screenshots at
1280 px and 375 px and the changed source, and returns one score (1–3) with evidence per criterion.
`summarizeCraftScores()` validates the reply. The judge can only read files in its own folder.

**Blinding:** the arms are copied to folders `A` and `B` in random order, and the prompt names
only the labels; the mapping is recorded in the report. The source still shows its imports, so a
careful judge can tell the arms apart; the labels only remove order and naming effects.

## Read the report

`docs/design-system/audits/vibe-<date>.md` has a totals table, then per brief the measures, the
rubric scores with the judge's evidence, and the cost, time and turns of each run. The briefs and
the builder prompt are at the end. Raw results (every measure, the judge's full reply and the
denied tool calls) are in `docs/design-system/audits/vibe/vibe-<date>.json`, and JPEG thumbnails of
the first screen of each page in `docs/design-system/audits/vibe/<date>/`.

The rubric's token-use criterion asks for `--a63-*` tokens, so the plain arm scores low on it by
construction; compare the other six criteria for a like-for-like view. One run is one sample per arm. Treat a single report as a smoke test of the tools, and compare
several before drawing conclusions. A run on the same day overwrites that day's report.

## Add a brief

Add `briefs/<id>.md`: a `# Title` line, then the page in product language. Never mention the
design system; `parseBrief` rejects a brief that does. Keep the set at 3–5 briefs.
