# @atom63/figma

Sync design tokens between code and Figma variables. Code is the source of truth: an agent writes
the tokens into a Figma file through the Figma MCP server, and brings edits made in Figma back into
the token CSS.

## Install

```bash
pnpm add -D @atom63/figma
```

## Sync code to Figma

1. Write the scripts:

   ```bash
   pnpm atom63-figma sync --tokens src/styles/tokens --out .figma-sync
   ```

2. Run each `.figma-sync/sync-N.js` in order with the Figma MCP server's `use_figma` tool on the
   target file. Each returns `verification`; every one must report `create: 0` and `update: 0`.
3. The printed summary lists under `skipped` the tokens that are not Figma variables (shadows,
   font stacks, colors in forms the engine does not read (it reads hex, rgb(), keywords and
   oklch(), relative ones included), and tokens that point at those), each with the reason.

Run the `check-N.js` scripts at any time to confirm the file still matches the code; they only
read. Each script carries one part of the token set, so it does not report orphaned variables;
`diff` does.

When a token moves to another collection, the sync creates it there and retires the old variable
as `(moved)/…`. A script cannot search the file's designs, so `applied.bindingsUnchecked` counts
those moves: tell the user that designs bound to the retired variables need rebinding.

The last script also writes styles, derived from the tokens:

- **Text styles** `Text/<step>`, one per size token with a matching line-height token
  (`--text-base-size` and `--text-base-leading`), with font size and line height bound to those
  variables, so they follow the type-scale modes.
- **Effect styles** `Shadow/<step>`, one per shadow token (`--shadow-md`).

Styles are matched by name; a style made in Figma under another name is never touched. That
script's result has `styles.verification`, which must plan no `create` or `update`.
`styles.applied.fontFallbacks` lists text styles whose family is not bound to the code: the family
could not load in Figma (tell the user which fonts to install), or the font variable holds a CSS
font stack, which Figma reads as one family name, so the style takes the stack's first family as
a literal. The
summary lists the styles it could not derive under `styles.skipped`. Pass `--no-styles` to write
variables only.

## Components

The Button component set is drawn from code (the contract and the recipe CSS) and bound to the
variables the token sync writes, so sync the tokens first.

The component model lives in this repository, not in the published package, so this runs from
the monorepo.

1. Run the token sync above, and confirm its `verification`.
2. Build the package and write the component scripts, from the repository root:

   ```bash
   pnpm --filter @atom63/figma build
   pnpm --filter @atom63/figma exec node dist/cli.js components \
     --model generated/atom63.figma-components.json --out .figma-sync
   ```

   `exec` runs in `packages/figma`, so both paths are relative to it and the scripts land in
   `packages/figma/.figma-sync`.

3. Run each `.figma-sync/components-N.js` in order with `use_figma` on the same file. The first
   makes the `Components` page and the `Button` set; later ones add their variants to it. Each
   returns `verification`, which must plan no `create` or `update`. A non-empty
   `missingVariables` means the file lacks variables the variants bind, and nothing was written:
   sync the tokens again, then rerun the script. A script that stops partway leaves its new
   variants on the `Components` page; rerunning it takes them into the set instead of drawing
   them again.

Run the `components-check-N.js` scripts at any time; they only read, and `planned.unchanged`
equals the script's `variants` when the file matches the code. Variants and layers are found by
name, so a rerun updates them in place and never touches layers the model does not list.

The printed summary counts the variants, the tokens they bind, and the `literals` (values the
recipe computes, such as heights, written as numbers), and lists what was `skipped` with the
reason. `applied.fontFallbacks` lists labels whose font family is not bound to the code.

After a recipe or token change, regenerate the model with
`pnpm --filter @atom63/figma generate:components` and run the scripts again.

Known limits: only Button, in sizes xs to xl. Icon and tile sizes, box shadows and the `.dark`
outline override are not drawn, and a font family token holding a CSS font stack is left unbound
(the label takes the stack's first family) and reported in `fontFallbacks`.

## Bring Figma edits into code

1. `pnpm atom63-figma read --page 1 --out .figma-sync/read-1.js`
2. Run it with `use_figma`, and save what it returns as `.figma-sync/figma-1.json`. The result says
   how many `pages` there are (`use_figma` cuts a result at 20 KB, so a read comes in pages of
   about 14 KB); write, run and save pages 2 to N the same way.
3. `pnpm atom63-figma diff --tokens src/styles/tokens --figma .figma-sync/figma-1.json --figma .figma-sync/figma-2.json …`
   lists values edited in Figma, variables made in Figma (no code syntax), tokens missing from
   the file, and variables whose token the code no longer has. It refuses a read with a page
   missing.
4. Apply the listed changes to the CSS. Keep a `var()` where the new value is another token, and
   where the code computes a value with `calc()`, change the input instead of the result.
5. Sync again, and confirm the check scripts report no changes.

Variables are matched by their web code syntax, `var(--token)`, which Dev Mode shows. A variable
without it was made in Figma: syncs leave it alone, and `diff` lists it as a proposed token.

## For plugins

The Figma plugin uses the same engine in process:

- `buildTemplateFiles(choices)` writes the site template's token CSS (bundled in `template/tokens`)
  with a brand ramp, the default neutral, radius, type scale and font. `TEMPLATE_DEFAULTS` returns
  the template unchanged.
- `brandRamp(hex)` generates the eleven steps of a brand ramp in OKLCH, kept inside sRGB.
- `syncModel(figma, model)` and `checkModel(figma, model)` sync or check a token set against a
  `StylesApi`. They return the same results as the scripts.
- `readTokenTable(figma)` counts the collections and variables that carry a code syntax, and the
  `Text/` and `Shadow/` styles.

The template copy in `template/tokens` comes from `atom63-site-template`. After the template's
tokens change, run `pnpm --filter @atom63/figma template:pull <path to the template checkout>`,
review the diff and run the tests.

## Atom63

In the Atom63 repository, sync the generated token set instead of CSS. Its collections are named
without a prefix (`Mode`, `Brand`, …); a file synced before that, with `Atom63 Mode` and so on, is
not migrated, so sync into a new file.

```bash
node packages/figma/dist/cli.js sync --model packages/styles/generated/atom63.figma-sync.json --out .figma-sync
```
