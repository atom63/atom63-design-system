# Cipher architecture

Cipher gives a Figma file a token table, which is the site template's variables, text styles and
effect styles. It offers two ways in:

- **Create** builds a token system from a few choices.
- **Import** reads a project's token CSS.

The plugin is a thin interface over `@atom63/figma`, the same engine the agent's `use_figma`
scripts run, so the plugin and an agent write the same table.

## Two threads

| Thread | Files | Work |
| --- | --- | --- |
| Main (Figma sandbox) | `src/code.ts`, `src/main/handle.ts`, `src/main/figma-api.ts` | Shows the UI, keeps the theme setting, and runs the engine against the file. |
| UI (iframe) | `src/ui.tsx`, `src/app/*` | The Home, Create and Import views. Reads token CSS into a model. |

The two threads exchange only the messages in `src/messages.ts`:

| UI sends | Main replies |
| --- | --- |
| `scan` | `table`: the token table the file holds (`readTokenTable`) |
| `plan` with a model | `planned`: what a sync would change (`checkModel`) |
| `apply` with a model | `applied`: what changed, the check after it, and the new table (`syncModel`) |
| `load-settings`, `save-settings` | `settings` |

Any failure comes back as `error` with its message.

## Where the CSS is read

Both Create and Import read CSS in the UI with `buildProjectModel` and `deriveStyles`
(`src/app/read-css.ts`), because the browser computes colors Node cannot, such as relative
colors. The main thread receives a finished model.

- **Create:** `buildTemplateFiles(choices)` rewrites the template's token CSS that
  `@atom63/figma` bundles. It generates an OKLCH brand ramp and moves the default of each axis.
  Export CSS offers those same files, so the exported CSS is what the file holds.
- **Import:** orders the picked files the way `index.css` imports them (`orderCssFiles`).

## Home

Home asks for the token table. It finds the table by code syntax (`var(--token)`), so it also sees
a table an agent wrote:

- **An empty file:** Home offers Create and Import.
- **A file with a table:** Home lists the collections and says that code is the source. After
  the CSS changes, the user asks their agent to sync, or imports again.

## Atom63

The plugin has no Atom63 mode. Atom63 itself is synced by the agent path:

```bash
atom63-figma sync --model packages/styles/generated/atom63.figma-sync.json --out <dir>
```

See `packages/figma/README.md`.
