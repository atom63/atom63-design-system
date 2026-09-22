# `@atom63/ui-react` Root API Support Audit

**Status:** Audit only / no export changes

**Scope:** Planning evidence for the first-wave public beta boundary. This document does not change package exports, source code, package metadata, release configuration, or publishing approval.

**Inspected:** `packages/ui-react/src/index.ts` and the `exports` map in `packages/ui-react/package.json` on 2026-09-20.

**Machine-readable policy:** [`ui-react-support-policy.json`](./ui-react-support-policy.json) defines the beta support tiers, per-module defaults, symbol overrides, public subpath policy, and stable blockers.

**Machine-readable inventory:** [`audits/ui-react-export-inventory.json`](./audits/ui-react-export-inventory.json). Run `pnpm check:ui-react-exports` to detect drift, or `pnpm check:ui-react-exports --write` to regenerate it after an intentional export or policy change.

**Preview migration:** [`ui-react-preview-migration.md`](./ui-react-preview-migration.md) documents the beta root-to-preview import path for symbols that are public during beta but not stable-root-eligible by default.

## Conclusion

Adopt a broad-root beta policy for the first public beta: keep the current root export available to avoid pre-release churn, but make the support promise tiered. The policy file is the source of truth for machine checks; this document explains the rationale. The inventory can resolve and typecheck the broad surface; compatibility guarantees should concentrate on beta-supported core and documented composition families.

The current root is probably too broad for a tight stable support promise. It combines mature component families with product-specific compositions, upstream primitive pass-throughs, imperative handles, style helpers, hooks, motion constants, color-extraction utilities, and conformance evidence. Publishing the current root under the RFC's beta policy makes those names importable, but not all equally stable.

The support tiers below are the operative beta policy until YZ approves an export change. They do not describe a change already made, and they do not remove or relocate any export.

## Current export model

- The package root, `.`, resolves to `src/index.ts` for the `development` and `typescript` conditions, `dist/index.d.ts` for types, and `dist/index.js` for imports.
- JavaScript/TypeScript subpaths are `./layout`, `./media`, `./media/lightbox`, `./preview`, and `./theme`.
- CSS entry points include `./styles.css`, `./reset.css`, `./recipes.css`, and individual `./recipes/*.css` entries, including `./recipes/media-lightbox.css`.
- The root is broad: it exports component families and their types alongside hooks, providers, primitive aliases, imperative handles, utility functions, constants, and class-name helpers.
- Media/lightbox and appearance APIs are not re-exported by the root today; they are still public package APIs because the export map exposes their subpaths.

## Recommended support tiers

Names are grouped by family to keep this audit reviewable. A family includes the root-exported parts and documented public types associated with it; it is not shorthand for unexported implementation files.

| Proposed tier | Root API families | Support rationale and conditions |
| --- | --- | --- |
| **Beta-supported primitives and core components** | `Accordion*`, `Alert*`, `AlertDialog*` (excluding low-level entries called out below), `Avatar*`, `Badge`, `Breadcrumb*`, `Button`, `ButtonGroup*`, `Card*` (excluding cursor/style helpers), `Checkbox`, `Collapsible*`, `Dialog*`, `Drawer*`, `Field*`, `Form*`, `Input*`, `Kbd*`, `Label`, `Pagination*`, `Popover*`, `Progress*`, `Radio*`, `Resizable*`, `ScrollArea`/`ScrollBar`, `ScrollableList`, `SearchField`, `SegmentedControl`, `Select*`, `Separator`, `Sheet*`, `Skeleton`, `Slider*`, `Spinner`, `Switch`, `Table*`, `Tabs*`, `Textarea`, `Toaster`/`toast`, `Toggle`, `ToggleGroup*`, `Tooltip*`; `UIProvider` and its environment types | These are the main adopter-facing controls, disclosure, feedback, navigation, layout, and form building blocks. The beta promise should cover documented props, composition behavior, accessibility semantics, and exported types. Low-level `Primitive`, `CreateHandle`, context, and styling-helper exports remain separately classified even when they share a component family. |
| **Beta-supported composition/product primitives, conditional on documentation and tests** | `Command*`, `ConnectedPanel*`, `ContextMenu*`, `DropdownMenu*`, `Empty*`, `FeedbackState`, `Frame*`, `HoverCard*`, `Item*`, `Menubar*`, `NavigationMenu*`, `PreviewCard*`, `Sidebar*`, `SidebarNav*` | These offer clear public value but carry larger composition and interaction contracts than a single control. Keep them in the beta-supported set only when Storybook/autodocs describe the public composition and focused tests or a packed-consumer smoke exercise the representative path. Missing evidence should move that family to monitor rather than silently expanding the promise. |
| **Monitor / high risk before promising compatibility** | `AnimatedCheck`; `Autocomplete*` and `useAutocompleteFilter`; `Calendar`; `Carousel*` and `useCarousel`; `CopyButton*`; `DestinationIndicator`/`DestinationLink`; `InputOTP*`; `LoadMoreTrigger`; `Marquee`; `PanelSettingButton`; `ProgressiveBlur`; `TextTicker`; `PortalContainerProvider`/`usePortalContainer`; `useCardCursor`, `CardCursorLabel`, and cursor binding types; `useExtractColor` and the color-extraction/cache utilities | These APIs have one or more of: specialized product behavior, complex state or gesture semantics, third-party behavioral coupling, browser/media concerns, styling-policy leakage, or a hook contract that is harder to evolve compatibly. They can remain available during planning, but each needs explicit evidence and an owner before it receives the same beta compatibility promise as core controls. |
| **Preview/experimental candidates** | `AlertDialogPrimitive`, `AutocompletePrimitive`, `AvatarPrimitive`, `DialogPrimitive`, `InputPrimitive`, `ProgressPrimitive`, `SeparatorPrimitive`, `SheetPrimitive`, `TooltipPrimitive`; `AlertDialogCreateHandle`, `CommandCreateHandle`, `DialogCreateHandle`, `TooltipCreateHandle`; `ButtonGroupProvider`, `useButtonGroupContext`; `cardLinkClassName`, `navigationMenuTriggerStyle`, `scrollableListControlClassNames`, `selectTriggerDefaultClassName`; `ATOM63_*` motion constants; `getReactRendererConformance`, `reactRendererConformance`, and their evidence types | Primitive pass-throughs expose upstream semantics directly. Imperative handles, internal-looking providers/hooks, implementation class names, constants, and audit evidence are especially expensive to freeze. They remain importable from the broad beta root, but are also available from `@atom63/ui-react/preview` and are not stable-root-eligible by default. Stable/latest needs an explicit promote / keep-preview-only / private decision for each symbol. |

### Public subpaths that need their own support decision

These are not root exports, but the package export map makes them public and therefore part of publish-readiness:

| Subpath | Current surface | Recommended treatment |
| --- | --- | --- |
| `./layout` | `Container`, `Page`, `Section`, `SectionHeader`, `ReaderLayout`, `PageSkeleton`, grid chrome primitives, style helpers, constants, hooks, and types | Support the high-level layout primitives only after their responsive and styling contracts are documented. Monitor grid chrome, exported class names/styles, constants, and `useGridChrome`; they are plausible preview candidates. |
| `./media` | `Image`, `Video`, `VideoDialog`, `VideoModal`, `VideoThumbnail`, `MediaLightbox`, video-manager context/provider/hooks, cache/source helpers, and types | High risk. Media lifecycle, animation caching, video management, and lightbox behavior need packed-consumer and browser evidence before a compatibility promise. `Image` may qualify independently because it is already the repository's preferred image boundary. |
| `./media/lightbox` | Headless `Lightbox` namespace; root, portal, content, slides, viewport, frame, zoom, chrome, thumbnail, and context hooks/types | Treat as preview unless the headless composition and state/context contracts are intentionally supported. Its many composable parts create a much larger compatibility surface than the monolithic media component. |
| `./preview` | Low-level primitive aliases, imperative handles, internal helpers, conformance evidence, and motion constants mirrored from the broad beta root | Public preview boundary. Importable for escape-hatch usage, but not covered by the stable compatibility promise unless a symbol is explicitly promoted later. |
| `./theme` | Appearance menus/panels/controls, personalization controller/provider factories, option constants, auto-primary helpers, state types, and `applyPersonalization` | Keep appearance UI documented under `./theme`. Treat controller factories, auto-color internals, option tables, and personalization implementation utilities as monitor or preview candidates rather than moving them into the root. |
| CSS entries | Aggregate styles/reset/recipes plus every exported recipe CSS file | Treat every listed CSS path, selector/variable contract it intentionally documents, and import behavior as package API. Removing, renaming, or consolidating a recipe entry is an API change even when no TypeScript name changes. |

## Beta public API rules

1. Components exported from the supported root must keep prop and composition compatibility through beta, except for documented breaking changes delivered through the approved versioning and migration policy.
2. Exported TypeScript types count as API. A component cannot be considered compatible if its public prop, union, callback, state, or return types break consumers.
3. Every CSS entry listed in `package.json#exports` is package API. The beta policy must cover import paths and intentional consumer-facing CSS contracts, not only JavaScript exports.
4. Base UI `Primitive` pass-throughs require special care because they expose upstream behavior, types, and semantics that Atom63 does not fully control. An upstream-compatible alias still becomes Atom63's support obligation when exported from the supported root.
5. Hooks, providers, constants, utility functions, class-name strings, and imperative handles are not less public than components when they are root exports.
6. `lucide-react` is the default dependency for small control icons. `@atom63/icons` is optional and outside the first-wave boundary; no root API decision should reintroduce it as a required dependency.

## Recommended implementation sequence

1. Keep the current broad root for first beta unless YZ explicitly chooses export churn before publish. The next implementation work should improve evidence and labeling, not move symbols immediately.
2. Keep the machine-readable inventory current from `src/index.ts`, the emitted declaration file, and `package.json#exports`. Record value exports, type exports, source module, public subpath, and proposed tier so future drift is reviewable.
3. Continue extending the packed external-consumer smoke with representative imports from the stable set and the high-risk set. At minimum, prove root import resolution, type resolution, required CSS, renderability, and tree-shaken production build behavior without workspace source aliases.
4. Use `@atom63/ui-react/preview` for preview candidates when adopters intentionally need escape hatches. Keep the broad beta root unchanged until stable/latest narrowing is explicitly approved.
5. Review Storybook/autodocs and focused test evidence for each conditional composition family. Downgrade families with missing evidence to monitor until the gap is closed.
6. Only after YZ approves a stable/latest boundary should maintainers narrow root exports or promote preview symbols into the stable root promise.

## Approval decision

Decision: first beta optimizes for zero export churn plus clear tiering. The current root remains broad and importable; the support promise is narrower than the import surface. Stable/latest promotion remains blocked until the tiering, migration policy, and external-consumer evidence are good enough for a tighter compatibility promise.
