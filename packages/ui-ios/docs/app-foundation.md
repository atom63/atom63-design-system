# App foundation and design intent

Networking and persistence are application infrastructure. They do not belong in
Atom63UI, but every infrastructure outcome must map to a design-system intent
before reaching a view.

```txt
URLSession / SwiftData
        ↓
ProjectRepository result
        ↓
AtomResourceIntent + AtomSyncIntent
        ↓
AtomContentStateView / AtomSyncStatusView / content
```

## Shared intent

`@atom63/ui-foundation` owns the cross-platform feedback kinds, including
`loading`, `empty`, `error`, `stale`, and `offline`.

Atom63UI renders the same intent through:

- `AtomResourceIntent`: `loading`, `content`, `empty`, `error`
- `AtomSyncIntent`: `idle`, `refreshing`, `synchronized`, `stale`, `offline`,
  `failed`
- `AtomContentStateView` for blocking empty and error states
- `AtomSyncStatusView` for non-blocking refresh, cached, offline, and failed-sync
  feedback

Product copy and retry actions remain app-owned. Atom63UI owns semantic tone,
layout, accessibility grouping, and token usage.

## Reference implementation

`examples/ios-demo/Atom63Demo/ProjectData.swift` contains:

- `GitHubProjectRemoteDataSource` using `URLSession`
- typed `ProjectDataError`
- `SwiftDataProjectCache`
- remote-first `ProjectRepository` with cached fallback and a persistent local
  mutation outbox

The repository never imports SwiftUI views. `DemoAppModel` maps repository
results into Atom63 intents, and the Projects screen renders those intents.

Local add/delete mutations update the materialized SwiftData cache immediately
and compact into one pending mutation per project. A remote refresh replaces the
remote snapshot, then reapplies pending upserts and deletes so local work is not
lost. Because the GitHub endpoint is read-only, pending mutations remain in the
outbox and map to `stale`; the app never claims they are synchronized.

The outbox is app infrastructure. Views only receive the resulting projects and
`AtomSyncIntent`, preserving the infrastructure → design intent → UI boundary.

## Tests

```bash
pnpm --filter @atom63/ui-ios test:swift # Atom63UI tokens and intent contracts
pnpm --filter @atom63/ui-ios test:app   # URLSession, typed failures, cached fallback, SwiftData
pnpm --filter @atom63/ui-ios test:ui    # unit tests plus end-to-end reference flows
```
