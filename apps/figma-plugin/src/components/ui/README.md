# UI components

The plugin UI runs on the Atom63 design system. `src/atom63.css` loads its tokens and component
recipes; `utils/theme.ts` sets the mode (following Figma's theme), the b2 brand and the compact
density on `<html>`; `ui.tsx` wraps the app in `UIProvider`.

This folder is what the pages import from `components/ui`:

| Kind                                                                  | Components                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atom63 components, re-exported                                        | `Button`, `Frame`, `ScrollArea`, `Separator`, `Textarea`                                                                                                                                                                                                      |
| Atom63 components behind a thin adapter that keeps the plugin's props | `Alert` (title and per-variant icon), `Badge` (leading dot or icon), `Checkbox` (`onChange(checked)`), `Dialog` and `ConfirmDialog` (`isOpen`, `onClose`), `EmptyState`, `Input` (with a label), `LoadingState`, `Toast` (`useToast` over the Atom63 Toaster) |
| Plugin-specific                                                       | `ColorSwatch`, `CopyButton` (the plugin's clipboard fallback for Figma's iframe), `ErrorBoundary`, `RenameDialog`, `SectionHeader`, `Tooltip`                                                                                                                 |

Pages may also import Atom63 components directly from `@atom63/ui-react` when no adapter is
needed, as the Sync and Manage pages do for `Tabs` and `SegmentedControl`. Look components up
with `pnpm atom63 component <name>` from the repository root.

Style plugin-specific pieces with CSS modules that read tokens (`var(--primary)`,
`var(--border)`, `var(--a63-*)`), never literal colors. The plugin's global resets live in
`@layer base` in `ui.scss` so they stay below the Atom63 recipes.
