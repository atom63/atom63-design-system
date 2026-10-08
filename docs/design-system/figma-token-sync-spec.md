# Figma token sync: design

Status: agreed on 2026-09-28; plans 1 to 3 are implemented (the `@atom63/figma` package and CLI,
text and effect styles, and the plugin's Create and Import). It replaces the plugin
direction in [figma-plugin-update-plan.md](./figma-plugin-update-plan.md): the v14 plugin on
`main` is not published, and the plugin is rebuilt from the needs below.
[figma-components-plan-1](./figma-components-plan-1.md) adds the Button component set.

## Goal

Figma and code hold the same tools for design: the same tokens and the same system (text and
effect styles), so a person drawing in Figma uses exactly what the code uses. Code is the only
source of truth. An agent keeps Figma in step with code through MCP; the plugin covers what an
agent cannot do or what a designer does by hand.

It serves two token sets the same way: a project started from the site template (shadcn names,
personalization axes as `data-*` attributes) and Atom63 itself. Atom63 is one more token source,
not a separate mode.

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| D1 | Where do tokens come from? | Both entries: build a system from scratch in the plugin, or import a project's token CSS. |
| D2 | Who is the source of truth once code exists? | Code. Figma edits go back to code through an agent; code changes are synced to Figma. No two-way merge. |
| D3 | How do code changes reach Figma? | An agent runs the sync through the Figma MCP server. The plugin's CSS import is the fallback without MCP. |
| D4 | How are variables named in Figma? | By meaning, with no `Atom63` or `--a63-` prefix. The CSS name lives in code syntax. |
| D5 | How is a variable matched to its token? | By its web code syntax (`var(--token)`), not plugin data. |
| D6 | What does the first version write? | Variables, text styles and effect styles. Components come in a later phase. Plan [figma-components-plan-1](./figma-components-plan-1.md) adds the Button component set, bound to these variables. |
| D7 | Where do Figma edits get listed? | On the agent side, by comparing the Figma file with the code. The plugin has no change list. |
| D8 | What happens to today's plugin pages? | Manage, Rebind, Styles and patch export are dropped. The plugin has Create and Import. |

## User journeys

### 1. Start from scratch (a designer, no code yet)

1. Open a new Figma file and run the plugin.
2. Pick a brand color, a neutral, a radius, a type scale and a font. A preview card updates live.
3. Create: the plugin writes the token table and the styles, with the same structure as the site
   template.
4. Export CSS: the plugin gives the files of the template's `src/styles/tokens`. A developer or an
   agent drops them into a project started from the template. From here, code is the source.

### 2. Existing project (a developer with an agent)

1. Ask the agent to sync tokens to Figma, naming the Figma file.
2. The agent runs `atom63-figma sync`, runs the scripts it writes through the Figma MCP
   server, and runs the returned check, which must report zero creates and zero updates.
3. After any token change in code, the agent syncs again.
4. Without MCP, the developer uses the plugin's Import instead.

### 3. A designer adjusts values in Figma

1. The designer edits variables in Figma's variables panel.
2. The developer asks the agent to bring the Figma edits into code.
3. The agent reads the Figma variables, compares them with the code tokens, and edits the CSS.
   Where the code computes a value with `calc()`, it changes the input instead of writing the
   result.
4. The agent syncs again and confirms that Figma and code match.

## Figma shape

### Collections and names

- Collections are named after the concept: Palette, Brand, Surface, Mode, Radius, Type scale,
  Density, and Atom63's Theme and Design language where they apply. A concept that both token
  sets have uses the same name in both.
- Variable names group by what a designer looks for: `surface/page`, `text/secondary`,
  `radius/md`. They carry no prefix.
- Palette steps are hidden from pickers (`scopes: []`) but stay aliasable.
- Scopes limit each variable to the pickers it fits, as in the current generator rules.

### Identity

- Every variable's web code syntax is its CSS name, for example `var(--primary)` or
  `var(--a63-surface-page)`. The sync engine matches variables to tokens by it.
- Matching by code syntax works for variables written by an agent through MCP, which cannot write
  plugin data, and it survives a designer renaming or regrouping a variable.
- A variable without code syntax was made in Figma. Sync leaves it alone, and the agent's
  comparison lists it as a proposed new token.

### Values

- A token that points at another token is an alias.
- A color at an opacity (`color-mix(in srgb, var(--x) N%, transparent)`) is a composed color: an
  alias with an opacity.
- A `calc()` of tokens is computed per mode and written as a number.
- Numbers compare with a tolerance relative to their size, because Figma stores 32-bit floats.

### System

- **Text styles:** `Text/<step>` (for example `Text/base`, `Text/2xl`), one per size token with
  a matching line-height token, with font size and line height bound to those variables, so they
  follow the Type scale mode. The family binds to a font variable only when every mode's value
  is one family that loads in Figma (a CSS font stack never is); otherwise it is set from the
  first mode as a literal, and the sync says so.
  Weights and letter spacing come later.
- **Effect styles:** `Shadow/<step>`, one per shadow level, from the shadow tokens that variables
  cannot hold.
- Styles are matched by name, since Figma styles have no code syntax; each description names its
  tokens (`var(--text-base-size) / var(--text-base-leading)`) for Dev Mode readers. A sync never
  changes or deletes a style that is not in the token set.
- The Button component set is generated from its contract and recipe
  ([figma-components-plan-1](./figma-components-plan-1.md)). Other components, icon and tile
  sizes, box shadows and Code Connect come later.

## Architecture

### Token set

One JSON format that every part reads or writes:

- collections, each with its modes;
- tokens, each with its CSS name, Figma name, type, scopes and a value per mode (a literal, an
  alias, or a composed color);
- text styles and effect styles, with the tokens they bind;
- tokens that could not be represented, each with a reason.

The CSS parser and the plugin's builder produce it; the sync engine consumes it.

### Package: `@atom63/figma`

Published from the Atom63 repository. It contains:

- **CSS parser:** reads token CSS (`:root`, `.light`, `.dark`, `data-*` attributes, `@theme`)
  into a token set. It is today's `css-model.ts`, moved and extended for styles.
- **Sync engine:** plans and applies a token set against the Figma variables and styles API,
  matching by code syntax. It runs in the plugin and inside the scripts sent through MCP.
- **Script builder:** turns a token set into `use_figma` scripts that each stay under 50,000
  characters, splitting the token set so every alias target exists before it is referenced, plus
  a read-only check script.
- **Comparison:** takes the Figma variables read by a script and the code token set, and returns
  the differences with the CSS file and selector for each, for the agent to apply.
- **CLI:** `atom63-figma sync`, `read` and `diff`, shipped in this package because `@atom63/cli`
  is not published. MCP tools that wrap the same commands can come later.

The site template takes `@atom63/figma` as a dev dependency only; nothing at run time depends on
Atom63. Atom63 uses the same package with its own token CSS as input.

### Code to Figma

1. The agent runs `atom63-figma sync` with the project's token directory.
2. The CLI parses the token CSS and writes the sync scripts in order, and the check scripts.
3. The agent runs each script with the Figma MCP server's `use_figma` on the named file.
4. The check scripts plan the token set against the file and must report zero creates and zero
   updates.

### Figma to code

1. The agent runs `atom63-figma read`, which writes a read script.
2. The agent runs it with `use_figma`; it returns the file's variables with their code syntax and
   values.
3. The agent saves that result and runs `atom63-figma diff`, which compares it with the code and
   prints the differences: changed values, proposed new tokens, and tokens missing in Figma.
4. The agent edits the CSS, then runs Code to Figma.

No snapshot of the last sync is stored in the file: code is the source, so the Figma edits are
the differences between Figma and code.

### Plugin

The plugin is a thin interface over the same engine and parser.

- **Empty file:** two actions, Create a token system and Import from CSS.
- **File with a token table:** a summary of the collections and variables, found by code syntax
  so it also covers a table an agent wrote; a line that tells the user to ask their agent to sync
  after code changes; and Import again.
- **Create:** the builder described in journey 1. It generates the template's token set with the
  chosen values as the default mode of each axis and every axis mode kept. Brand ramps are
  generated in OKLCH from the chosen color. Export CSS gives the template's token files.
- **Import:** pick or paste token CSS, preview the plan, apply it.

The plugin UI runs on the Atom63 design system, as it does now.

## Edge cases

- **Plan limits:** axes with up to 6 modes need a Figma Professional plan or higher. On a plan
  with fewer modes, the sync writes what fits and lists the modes it could not add, with the
  reason.
- **Type conflicts:** a variable whose code syntax matches a token of another type is not
  overwritten; it is listed for a person to resolve.
- **Figma-made variables:** never changed or deleted by a sync.
- **Tokens removed from code:** their variables are reported as orphaned and kept, so designs
  bound to them do not break.
- **Values Figma cannot hold:** shadows become effect styles, font stacks become text style
  families; anything else is listed as not synced, with the reason.

## Testing

- **Engine and parser:** unit tests with the fake Figma API, adding code-syntax matching, text
  styles, effect styles and the builder's output.
- **Script builder:** every script for the full Atom63 token set stays under 50,000 characters,
  and running the scripts in order against the fake API gives the same result as one sync.
- **Agent path:** a manual end-to-end run through the Figma MCP server on a fixed test file: sync,
  sync again with zero changes, edit in Figma, diff, and sync back. Not in CI.
- **Plugin:** Create and Import walked in the Figma desktop app with computer use, with
  screenshots.

## Out of scope

- Figma components other than Button, icon and tile sizes, box shadows, and Code Connect (later
  phases).
- Two-way merge and conflict resolution between Figma and code.
- Pulling tokens from a URL or a repository inside the plugin.
- Figma's extended collections (Enterprise only).
- Motion tokens as Figma variables.
