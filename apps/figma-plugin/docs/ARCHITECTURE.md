# Cipher architecture

Cipher gives a Figma file a token table, which is the site template's variables, text styles and
effect styles, or the Atom63 design system itself. It offers three ways in:

- **Create** builds a token system from a few choices.
- **Import** reads a project's token CSS.
- **Atom63 design system** builds Atom63's tokens, styles and components into the file.

The plugin is a thin interface over `@atom63/figma`, the same engine the agent's `use_figma`
scripts run, so the plugin and an agent write the same table.

## Two threads

| Thread | Files | Work |
| --- | --- | --- |
| Main (Figma sandbox) | `src/code.ts`, `src/main/handle.ts`, `src/main/figma-api.ts` | Shows the UI, keeps the theme setting, and runs the engine against the file. |
| UI (iframe) | `src/ui.tsx`, `src/app/*` | The Home, Create, Import and Atom63 views. Reads token CSS into a model. |

The two threads exchange only the messages in `src/messages.ts`:

| UI sends | Main replies |
| --- | --- |
| `scan` | `table`: the token table the file holds (`readTokenTable`) |
| `plan` with a model | `planned`: what a sync would change (`checkModel`) |
| `apply` with a model | `applied`: what changed, the check after it, and the new table (`syncModel`) |
| `atom63-scan` | `atom63-table`: what the file holds of Atom63, any other token set, and whether a build would be refused (`readDesignSystemTable`) |
| `atom63-build` | `progress` while it works, then `atom63-built`: the build's outcome, or `status: 'blocked'` with the reason, and the new table (`buildDesignSystem`) |
| `atom63-check` | `atom63-checked`: the read-only check, pass, pending or fail (`checkDesignSystem`) |
| `load-settings` | `settings` |
| `save-settings` | nothing |

The main thread runs one `atom63-*` message at a time; another one meanwhile is an error.

Any failure comes back as `error` with its message and, in `for`, the type of the message that
failed. The Atom63 view takes only errors `for` an `atom63-*` message (or untagged ones) as its
own, so a failed `save-settings` does not stop a build. Create and Import read every `error`.

## Where the CSS is read

Both Create and Import read CSS in the UI with `buildProjectModel` and `deriveStyles`
(`src/app/read-css.ts`), because the browser computes colors Node cannot, such as relative
colors. The main thread receives a finished model.

- **Create:** `buildTemplateFiles(choices)` rewrites the template's token CSS that
  `@atom63/figma` bundles. It generates an OKLCH brand ramp and moves the default of each axis.
  Export CSS offers those same files, so the exported CSS is what the file holds.
- **Import:** orders the picked files the way `index.css` imports them (`orderCssFiles`).

## Home

Home asks for the token table (`scan`) and for what the file holds of Atom63 (`atom63-scan`). It
finds the table by code syntax (`var(--token)`), so it also sees a table an agent wrote:

Each way in is an entry card (the Atom63 `Item`): a title, one line of what it does, and its
action.

- **An empty file:** Home offers three entries: Create, Import, and the Atom63 design system.
- **A file with Atom63's table:** Home says the file holds the Atom63 design system and offers
  one entry, **Update Atom63 design system**.
- **A file with another table:** Home lists the collections and says that code is the source.
  After the CSS changes, the user asks their agent to sync, or imports again. The Atom63 entry
  stays with its action disabled and the reason beside it ("Needs a new file — this file holds
  another token set").

Create, Import and the Atom63 view keep their actions in a bar pinned to the bottom of the window,
so the primary action is in reach while the content above it scrolls.

Home passes its Atom63 table to the Atom63 view, which scans only when Home has none, so two
scans never overlap.

## Atom63

The **Atom63 design system** entry builds the Atom63 design system into the open file: the
variables, the text and effect styles, and every generated component (Button today) with its spec
card. `code.js` bundles the generated, CI-guarded models at build time
(`packages/styles/generated/atom63.figma-sync.json` and
`packages/figma/generated/atom63.figma-components.json`, `src/main/atom63-models.ts`); no copy
lives in the plugin.

- **What the file holds:** the view lists Atom63's variables and collections and, for each
  component, its variants and whether the spec card is there.
- **Build:** `atom63-build` writes everything in process and posts `progress` (variables, styles,
  then each component) that the view announces. A second build changes nothing.
- **Check:** the view then sends `atom63-check`, a separate main-thread task, so Figma has
  settled its component property references. The result is pass with a summary, fail with every
  named difference, or pending ("check again") while Figma is still reconciling a property.
  Check again is also offered after a check that failed to run.
- **Refusal:** a file that holds any token set that is not provably Atom63's, such as a
  template's table, is refused before anything is written: `status: 'blocked'` with the reason
  ("Start the Atom63 design system in a new file."). There is no way to build beside another
  token set. The ownership rule is in `packages/figma/README.md`.

The agent path stays as it is, for repositories that sync Atom63 through MCP:

```bash
atom63-figma sync --model packages/styles/generated/atom63.figma-sync.json --out <dir>
```

See `packages/figma/README.md`.
