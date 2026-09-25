# @atom63/inform

The Atom63 inform pattern: one message model, one arbiter, four surfaces.

```bash
pnpm add @atom63/inform @atom63/ui-react
```

```css
@import '@atom63/styles';
@import '@atom63/ui-react/recipes.css';
@import '@atom63/inform/styles.css';
```

The surfaces ship their own stylesheet (`.a63-Inform*` classes on `--a63-*` tokens) and need no
Tailwind.

- `@atom63/inform` — message types, `defineInformRegistry`, the arbiter, and the dismissal stores. No React.
- `@atom63/inform/react` — `InformProvider`, `InformOutlet`, `useInform`, `useInformContext`.
- `@atom63/inform/surfaces` — `InformBanner`, `InformDialog`, `InformCornerFlyout`, `InformSpotlight`,
  `InformFlyoutStack` and the icon, media and dismiss slots. Controlled components, usable without
  the runtime.

See the design system's [Inform pattern page](https://system.atom63.io/patterns/pattern-inform) for
the message model, the arbiter and when to use each surface.
