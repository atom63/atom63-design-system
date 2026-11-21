---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
'@atom63/cli': patch
---

Contracts now use one name per concept. The middle size is `md` on Alert Dialog, Autocomplete, Avatar, Button Group, Dialog, Item, Table and Tabs (it was `default`), so `size="md"` type-checks on every sized component. Alert Dialog's danger variant is `error` (it was `destructive`), as on Alert and the toast. State lists use `rest`, `focus-visible`, `hover` and `current` (Badge `resting`, Breadcrumb, Item, Toggle and Toggle Group `focus`, Feedback State, Resizable, Scroll Area and Scrollable List `idle`, Form and Frame `default`, Input OTP, Navigation Menu and Sidebar Nav Tree `active`, Scroll Area `hovering`, and Accordion and Button `focusVisible`).

Props keep working: each component still accepts the old size or variant and draws it as the new one (`size="default"` renders `data-size="md"`, `variant="destructive"` renders `data-variant="error"`). The state lists are not props, but their union types (such as `ButtonState`) drop the old names. A recipe override that targets `[data-size='default']` or the Alert Dialog popup's `[data-variant='destructive']` must move to the new value. `@atom63/ui-foundation` exports each old name in a `<component><List>Aliases` map and a `@deprecated` `<Type>Alias` type (for example `tabsSizeAliases` and `TabsSizeAlias`); the React props accept `TabsSize | TabsSizeAlias`. The aliases go in the next breaking release. Button's and Badge's `intent.stateAliases` entries moved to these maps.

Every cross-renderer component with web axes now has an `intent` block that maps each axis to its SwiftUI enum, or says that iOS has no such axis. The CLI and the docs list the deprecated aliases with the contract.

`reactRendererConformance` is now read from the cross-renderer contracts instead of a copied table, which takes about 2.7 kB gzip off `@atom63/ui-react`. Its type is `readonly ReactRendererConformanceEvidence[]`, and `ReactVerifiedContractId` is `CrossRendererContractId`. The values are unchanged.
