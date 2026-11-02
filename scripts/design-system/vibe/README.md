# Vibe tests

`pnpm vibe` asks whether agents build better UI with the Atom63 tools than without them (E4 in
`docs/design-system/quality-plan.md`). It runs on demand on a developer machine; there is no
scheduled workflow. Each run writes a report that you commit.

## Run it

```bash
pnpm --filter "@atom63/mdx..." --filter "@atom63/ui-react..." build   # the ds arm packs dist
pnpm vibe --dry-run                  # set up every project and print the Codex commands
pnpm vibe --brief sign-in            # one brief, three arms and the judge
pnpm vibe --brief crm-contacts --track reference --dry-run
pnpm vibe --yes                      # every brief (uses real Codex quota)
```

| Flag | Effect |
| --- | --- |
| `--brief <id>` | Run one brief (a file name in `briefs/` without `.md`). |
| `--arms plain,ds-core,ds-guided` | Pick the arms. `ds` remains as a legacy alias for the guided arm. |
| `--track <name>` | `generalization` (the default) or `reference`. Reference cases must have a matching folder in `references/`. |
| `--artifacts <dir>` | Preserve generated source, screenshots and logs outside the temporary directory, excluding dependencies, build output and tarballs. The directory must not exist. |
| `--model <id>` | Model for the builders and the judge. Default: the Codex CLI default. |
| `--dry-run` | Pack, generate and install the projects, print the planned commands, call no agent. |
| `--keep` | Keep the temporary directory (projects, full-size screenshots, judge folder). |
| `--yes` | Required to run more than one brief. |

It needs a logged-in `codex` CLI, Playwright's Chromium (`pnpm exec playwright install chromium`)
and the network for third-party dependencies. Each builder and judge runs in a fresh ephemeral
session with a 45-minute process timeout. The report records input, cached-input and output tokens;
the runner does not call Claude or estimate a dollar cost.

## What a run does

For each brief, three fresh `codex exec` agents get the same product prompt: build the brief as a new
page at `/<brief id>`, add no dependencies, and leave `pnpm typecheck` and `pnpm build` passing.

- **`plain`:** Vite, React, TypeScript, Tailwind v4 and lucide-react at the versions the starter
  uses. No design system, no `AGENTS.md`, no MCP server, no router.
- **`ds-core`:** the Atom63 starter and freshly packed design-system packages. Its MCP allowlist
  exposes component contracts, examples, tokens and rules, but not build kits or templates. Its
  `AGENTS.md` says to compose the public components directly.
- **`ds-guided`:** the same Atom63 commit with the full MCP server, generated agent rules, build
  kits, page templates, blocks and examples.

The `reference` track copies `references/<brief id>/` into every generated project at
`.vibe/reference/`. The prompt requires the builder to inspect the target, layout map and state list,
then implement real UI rather than embed the target. The `generalization` track supplies no visual
reference. Reference runs parse the state table and capture every listed state at every viewport;
the CRM pack therefore produces 20 screenshots per arm. The benchmark route must replace the
starter site's navigation and appearance controls so they do not contaminate the comparison.

All arms use `--ignore-user-config --ephemeral` with Codex plugins, apps, browser/computer use and
multi-agent features disabled. Builders receive a workspace-write sandbox. The plain arm receives
no MCP server; `ds-core` receives only Atom63 component, example, token, rules and manifest tools;
`ds-guided` receives the complete read-only Atom63 MCP server. Every arm otherwise uses the same
Codex runtime and model selection.

Then, on the source files each agent added or changed:

- **Craft violations:** the `check:craft` rules (`raw-color`, `physical-properties`,
  `focus-visible`, `focus-ring-outline`, `mode-branch`, and `unknown-token` against the token
  manifest's names and the names the project declares).
- **Warnings:** a `<Button>` from `@atom63/*` with no `variant` (and no spread props), which
  draws the `default` neutral solid. Reported on its own row, not counted as a craft violation.
- **Type errors:** `tsc --noEmit`; and whether `vite build` succeeds.
- **axe violations:** the build is served with `vite preview`, the page opened in Chromium at each
  capture viewport, and axe-core run on every render.
- **System-component share:** JSX elements imported from `@atom63/*`, divided by those plus
  third-party components and interactive HTML elements (`button`, `input`, `a`, `select` and so
  on). Icons and components defined in the project are left out of both sides; their bodies are
  counted where they are defined. The plain arm scores 0% by construction; its raw counts are
  still reported.
- **Literal values:** Tailwind palette or arbitrary color utilities (`bg-blue-500`,
  `bg-[#fafafa]`), and hex, `rgb()`, `hsl()` or `oklch()` colors elsewhere.

Finally a visual-only `codex exec` judge in a read-only sandbox reads the rendered reference target and anonymous full-page
screenshots at 1440, 1024, 768 and 390 px for every captured state. It cannot read source, imports,
tokens, component names or arm names. It returns a 100-point visual score: reference fidelity 35,
hierarchy and composition 20, density/spacing/alignment 15, typography/color/surfaces 15,
responsive adaptation 10 and product specificity 5.
The parser validates every criterion, point range and evidence string. The judge can only read
images in its own folder.

**Blinding:** the arms are copied to folders `A`, `B` and `C` in random order, and the prompt names
only the labels; the mapping is recorded in the report. No generated source is copied into the
judge folder, so implementation technology cannot reveal an arm.

The builders and judge currently use the same Codex model family. Image-only blinding reduces arm
leakage but does not remove shared-family or self-preference bias. Treat the judge as comparative
evidence, repeat samples, and do not use one score as a release gate.

## Read the report

`docs/design-system/audits/vibe-<date>.md` has a totals table, then per brief the implementation
gates, DS leverage, visual scores with the judge's evidence, and token use, time and turns. The briefs
and the builder prompt are at the end. Raw results (every measure, the judge's full reply and Codex
JSONL usage events) are in `docs/design-system/audits/vibe/vibe-<date>.json`, and JPEG thumbnails of
the first screen of each page in `docs/design-system/audits/vibe/<date>/`.

Build, typecheck, axe and screenshot completeness are qualification gates. Token use, craft findings,
system-component share and literal values are reported separately as design-system leverage and do
not change the visual score. One run is one sample per arm. Treat a single report as a smoke test and
compare repeated samples before drawing conclusions. A run on the same day overwrites that day's
report.

## Add a brief

Add `briefs/<id>.md`: a `# Title` line, then the page in product language. Never mention the
design system; `parseBrief` rejects a brief that does. Keep the set at 3–5 briefs.
