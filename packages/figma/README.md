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
   font stacks, relative colors Node cannot compute, and tokens that point at those), each with the
   reason.

Run the `check-N.js` scripts at any time to confirm the file still matches the code; they only
read. Each script carries one part of the token set, so it does not report orphaned variables;
`diff` does.

When a token moves to another collection, the sync creates it there and retires the old variable
as `(moved)/…`. A script cannot search the file's designs, so `applied.bindingsUnchecked` counts
those moves: tell the user that designs bound to the retired variables need rebinding.

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

## Atom63

In the Atom63 repository, sync the generated token set instead of CSS. Its collections are named
without a prefix (`Mode`, `Brand`, …); a file synced before that, with `Atom63 Mode` and so on, is
not migrated, so sync into a new file.

```bash
node packages/figma/dist/cli.js sync --model packages/styles/generated/atom63.figma-sync.json --out .figma-sync
```
