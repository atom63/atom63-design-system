# Atom63 look for Stageshow

[Stageshow](https://github.com/benjitaylor/skills/tree/main/stageshow) is a skill for faux product UI:
stills and short animations for heroes, feature cards and docs. This example gives it an Atom63
look and one demo built with it.

- `src/look.css` sets every Stageshow `--ss-*` role from an Atom63 token. Put `look-atom63` on a
  `Stage` and it follows the page's theme, brand, mode and density, with no literal colors. A
  subtree with its own `data-a63-brand` reads the tokens again, so a brand picked inside the stage
  restyles only that subtree. Stageshow's shadows and placeholder inks stay its own.
- `src/brand-switch.tsx` retells Stageshow's `panel-annotation` gold: an Appearance panel picks a
  brand, and the checkout behind it takes it.
- `stageshow/` is Stageshow's `kit`, `LICENSE` and `NOTICE.md`, copied unchanged from upstream commit
  `8020574` (MIT; see `NOTICE.md` for the app icons). The skill itself lives in `~/.skills`.

```bash
pnpm --filter atom63-stageshow-example dev
pnpm --filter atom63-stageshow-example build
```

`?theme=aqua&mode=dark` sets the page's theme and mode. Stageshow pauses while the tab is hidden and
shows the final frame under reduced motion, which is how the stills are filmed.
