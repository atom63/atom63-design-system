# The readiness bar

The scale and criteria every readiness review round scores against. Approved 2026-11-18; one change since: C5 allows `stable` only while a component has no open P0 or P1. Rounds and their registers: [audits/readiness-rounds.md](./audits/readiness-rounds.md).

## The scale

Every criterion is scored 0–4. A score names evidence, not an opinion.

| Score | Meaning | Finding it implies |
| --- | --- | --- |
| 4 | Exemplary, and a check keeps it that way | none |
| 3 | Ready: meets the bar, at most polish left | P3 |
| 2 | Works, with a known gap a consumer can hit | P2 |
| 1 | A gap that blocks "ready" for this subject | P1 |
| 0 | Missing, broken, inaccessible or wrong | P0 |

- **Ready** means at least 3 on every criterion that applies, or an exception the maintainer has accepted.
- A criterion that does not apply is `n/a` with a one-line reason.
- Taste criteria (visual quality, composition) are scored by the reviewer and stand only after the maintainer
  has seen the batch's contact sheet.

## Layer 1: tokens and themes

The axes: 4 themes (modern, aqua, retro, terminal), 2 modes, the brand ramps, density, radius and
font.

| Id | Criterion | Checked by | Judged |
| --- | --- | --- | --- |
| T1 | Every semantic token resolves on every axis combination | `theme-overrides`, `personalization-axes`, `density` tests | Combinations the tests skip |
| T2 | Contrast: declared pairs pass, and no token is used outside its role | `contrast` test; the new role check | Pairs nobody declared |
| T3 | One naming grammar, no duplicate aliases, no dead tokens | `check:token-economy` | Whether names read as one system |
| T4 | Scales (space, type, radius, motion) keep consistent ratios, and density scales them proportionally | — | Ratios and steps |
| T5 | CSS, Swift and Figma agree | Byte checks, `swift-parity`, `figma-parity` | — |
| T6 | Adding a theme or brand touches only the files it should, and the docs say how | `check:theme-authoring` | The docs |

## Layer 2: contracts

| Id | Criterion | Checked by | Judged |
| --- | --- | --- | --- |
| C1 | Complete: intent, axes, defaults, slots, states and maturity | Contract schema | Whether the listed states are all the real ones |
| C2 | Consistent: one concept, one name across all contracts (sizes, variants, tone, orientation) | The new consistency lint | Near-synonyms the lint misses |
| C3 | Cross-renderer: every web contract with an iOS counterpart maps its axes | Renderer conformance tests | Gaps in the mapping |
| C4 | Wired: contract, recipe, story, docs page, test and CLI index all exist | Generation checks, `check:agent-index` | — |
| C5 | Honest maturity: `stable` only while the component has no open P0 or P1 (changed 2026-11-19, internal record) | — (cross-checked against layer 3) | — |

## Layer 3: components, one scorecard each

| Id | Criterion | Checked by | Judged |
| --- | --- | --- | --- |
| K1 | API: props match the contract; composition (`render`/`asChild`) spreads props and forwards refs; controlled and uncontrolled both work; no boolean props standing in for variants | API report, `check:ui-react-exports` | API shape |
| K2 | Accessibility: the APG pattern, names and roles, the keyboard map, focus management, reduced motion, forced colors | axe on every story, `a11y` pattern tests | Keyboard and screen-reader walk-through |
| K3 | Visual quality on the craft rubric, in 4 themes × 2 modes, with the archetype visibly expressed per theme | Visual baselines | Taste (the maintainer confirms) |
| K4 | States: hover, focus-visible, active, disabled, loading, error, empty and selected, wherever they apply, each designed and captured | Stories and baselines | Missing states |
| K5 | Sizing and density: only contract sizes; compact density; 44 px targets on coarse pointers; text scaling | `check:control-alignment` | — |
| K6 | RTL and language: logical properties, mirrored directional icons, long and CJK strings, truncation | `check:craft` `physical-properties` | Long-string behaviour |
| K7 | Phone and touch: behaviour at phone width, coarse pointers, safe areas for overlays | Phone stories | — |
| K8 | Docs: a docs page, a playground, usage guidance, a correct `atom63 component` answer and a runnable example | CLI index tests | Whether a builder could use it from the docs alone |
| K9 | Tests: behaviour tests, baselines of the key states, SSR safety | `ssr` project, test runs | Untested behaviour |
| K10 | iOS parity, where a counterpart exists: same anatomy and axes, Dynamic Type, VoiceOver, dark mode, snapshots | iOS snapshots, conformance | Feel against the web version |

**Batches**, by archetype (76 web components; each iOS counterpart is reviewed with its web
batch):

1. Actions (8): button, button-group, toggle, toggle-group, copy-button, destination-link,
   panel-setting-button, kbd
2. Choice and range (8): checkbox, radio, switch, segmented-control, slider, rating, progress,
   spinner
3. Text and form (10): input, textarea, input-otp, search-field, autocomplete, select, field, form,
   label, amount
4. Overlays (10): dialog, alert-dialog, drawer, sheet, popover, hover-card, preview-card, tooltip,
   toaster, portal-container
5. Menus and navigation (9): menu, dropdown-menu, context-menu, menubar, command,
   navigation-menu, breadcrumb, pagination, tabs
6. Surfaces and structure (10): card, item, frame, separator, accordion, collapsible, resizable,
   scroll-area, scrollable-list, connected-panel
7. App frame and data (8): app-view, sidebar, sidebar-nav-tree, table, calendar, carousel,
   marquee, text-ticker
8. Feedback and status (8): alert, badge, avatar, empty, feedback-state, skeleton,
   load-more-trigger, animated-check
9. Chat (5): chat-composer, chat-message, chat-steps, chat-typing-indicator, message
10. iOS only: AtomActionBar, AtomAppBar, AtomListRow, AtomListSection, AtomSectionHeader,
    AtomSelectionRow, AtomValueRow, AtomTabRow, AtomPageDots, AtomChip, AtomNotice,
    AtomSyncStatusView, AtomContentStateView, AtomWidget
11. Other packages' surfaces: `@atom63/mdx`, `@atom63/inform`, `@atom63/widgets`, `@atom63/brand`

## Layer 4: layout and composition

Subjects: the 7 page templates, the 13 blocks, AppView, and Page, Section and ReaderLayout.

| Id | Criterion | Checked by | Judged |
| --- | --- | --- | --- |
| Y1 | Holds at phone (390), tablet (768), laptop (1280) and wide (1440) | Viewport stories | Layout at each width |
| Y2 | Safe areas and form factor: each inset has one owner | `form-factor` test | — |
| Y3 | Real content: long text, empty, one item, many items | — | Stress cases |
| Y4 | Built only from system components and tokens, and passes the craft rubric | `check:craft` | Composition (the maintainer confirms) |
| Y5 | `atom63 build`, `template` and `copy` lead a builder to it and the copy works | `check:templates` | — |

## Layer 5: architecture and packages

| Id | Criterion | Checked by |
| --- | --- | --- |
| A1 | Dependencies point one way (styles → foundation → react → the rest), with no cycles | `check:package-correctness` |
| A2 | Entries tree-shake, and bundles stay within budget | `check:ui-react-size`, `check:ui-react-root-deps` |
| A3 | The API surface is reported, inventoried and tiered honestly | `check:api-report`, `check:package-surface`, `check:ui-react-stable-actions` |
| A4 | The dependency and peer-dependency policy holds | `check:dependency-version-policy` |
| A5 | Release: changesets, trusted publishing, dist-tags and a registry smoke test | `check:stable-release-preflight`, `check:ds-registry-smoke` |
| A6 | CI health: run time and known flakes (the lightbox focus test, the webkit sign-in test) | CI history |

## Layer 6: consumer and agent experience

| Id | Criterion | Checked by | Judged |
| --- | --- | --- | --- |
| U1 | The CLI and MCP answer correctly and consistently with the source | CLI tests | Answers to real build questions |
| U2 | Every AGENTS.md rule is enforced by a check, or says why not | `check:agents-md` | — |
| U3 | A fresh install works: the starter, the shadcn path, the registry | `check:starter`, the smoke tests | — |
| U4 | Every export is documented and findable | `check:agent-index` | — |
| U5 | Outcome: case-study means are no lower than Round 13, and every failure is traced to a layer | Case-study harness | — |

