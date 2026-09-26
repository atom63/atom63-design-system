# @atom63/widgets

The Atom63 widget foundation: the unit model that sizes and scales widgets, the card and surface
they are drawn on, the loading, empty and error states, and the hosted shell.

```bash
pnpm add @atom63/widgets @atom63/ui-react
```

```css
@import '@atom63/styles';
@import '@atom63/ui-react/recipes.css';
@import '@atom63/widgets/styles.css';
```

The components ship their own stylesheet (`.a63-Widget*` classes on `--a63-*` tokens and the
`--a63-widget-*` contract) and need no Tailwind.

- `@atom63/widgets` — widget units and spans, presentation scale, type ramp, insets, `WidgetGrid`,
  `WidgetViewport`, `WidgetImage`, the link and destination helpers, and `WidgetSize`.
- `@atom63/widgets/primitives` — `WidgetSurface`, `WidgetCard` and its parts, `WidgetShell`,
  `WidgetBlock`, `WidgetAvatar`, and the surface class constants.
- `@atom63/widgets/state` — `WidgetStateFeedback`, `widgetStateCopy`,
  `resolveWidgetFeedbackState` and the shared state props.
- `@atom63/widgets/runtime` — `WidgetHostedShell`, the title and content transitions, the loading
  shell, the error fallback and the transition settings.

See the design system's [Widgets pattern page](https://system.atom63.io/patterns/pattern-widgets)
for the unit model, the contract tokens and the hosted shell.
