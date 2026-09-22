# @atom63/ui-react Media Evidence Packet

**Status:** partial evidence recorded; no stable promotion or export changes.

**Owner lane:** `design-system-media`

This packet records the current stable-readiness evidence for the monitor-high-risk Carousel,
useExtractColor, and extract-color families. It is evidence for review, not a stable API promise.
All three remain importable from the beta root and remain monitor-high-risk until the manual and
real-browser QA below is completed and reviewed.

## Shared dependency policy

- `embla-carousel-react`, `motion`, and `lucide-react` remain declared runtime dependencies of
  `@atom63/ui-react`; consumers must not rely on transitive installation. The package manifest
  uses compatible ranges and the repository lockfile currently resolves Embla 8.6.0. Any Embla
  major upgrade requires focused interaction tests, real-browser gesture QA, typecheck, and
  release notes because `CarouselApi`, options, and plugins expose Embla-owned types.
- Color extraction uses browser `Image`, canvas, and CORS behavior rather than a third-party
  runtime. Successful cross-origin extraction requires a CORS-readable response; setting
  `crossOrigin` does not bypass the browser's origin policy.
- The cache is in-memory and process-local. Its compatibility key is `<imageUrl>::<sampleRegion>`;
  extraction tuning options are intentionally not part of that existing key. Changing this
  behavior is an API/cache compatibility decision, not an incidental algorithm refactor.
- This slice does not remove, narrow, or relocate any root export.

## Evidence commands

```bash
pnpm --filter @atom63/ui-react exec vitest run \
  src/components/carousel/carousel.test.tsx \
  src/lib/extract-color.test.ts \
  src/hooks/use-extract-color.test.tsx
pnpm --filter @atom63/ui-react typecheck
pnpm --filter @atom63/ui-react lint
pnpm check:ui-react-monitor-evidence
```

## Carousel

### API contract

The family consists of `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`,
`CarouselNext`, `useCarousel`, and the existing `CarouselApi` and `CarouselProps` types.
`Carousel` maps horizontal/vertical orientation to Embla's x/y axis, optionally exposes the
Embla instance through `setApi`, handles Arrow Left/Right navigation, derives control disabled
state from Embla, and optionally provides a pointer-following previous/next click affordance.

### Recorded automated coverage

- Region/slide semantics, named button controls, and Embla-derived previous/next disabled state.
- Horizontal default, vertical axis/track metadata, Arrow Left/Right navigation, and `setApi`
  exposure.
- Cursor indicator opt-in and direction, click navigation, and suppression of the synthesized
  click after movement beyond the drag threshold.
- Tests use a deterministic Embla API stub. jsdom has no layout, scrolling, pointer capture, or
  gesture engine, so these tests verify wrapper wiring and state transitions rather than Embla's
  real snap calculations or swipe implementation.

### QA still required

- Real-browser previous/next and Arrow Left/Right behavior with one item, multiple items, loop on
  and off, variable widths, and vertical orientation.
- Mouse/touch/trackpad drag and swipe, drag-versus-click threshold, pointer leave/re-entry, and
  cursor-indicator positioning against real layout.
- Tab order, visible focus, focus retention after navigation, screen-reader region/slide/control
  announcements, and reduced-motion behavior.
- Mobile Safari/Chrome, RTL behavior, resize/reinitialization, and light/dark visual review.

**Stable decision:** remain monitor-high-risk. Wrapper API, controls, keyboard wiring, and cursor
drag suppression have automated evidence, but real gesture, focus, responsive layout, RTL, and
assistive-technology evidence is incomplete.

## useExtractColor

### API contract

`useExtractColor(imageUrl, options)` returns `{ color, loading, error }`. It reads the shared
URL/region cache for initial state, otherwise delegates to `loadAndExtractColor` with normalized
defaults. Cleanup prevents an obsolete request from updating React state; it does not abort the
underlying browser image request.

### Recorded automated coverage

- Uncached loading state, normalized loader options, and successful color settlement.
- Cached initial color without a duplicate load.
- Loader rejection surfaced as an `Error` with loading cleared.
- URL-change cancellation: a stale promise result is ignored and the current request wins.

### QA still required

- Same-origin and CORS-enabled cross-origin success in supported browsers, plus missing/blocked
  source behavior and useful consumer fallback UI.
- React Strict Mode/remount behavior, rapid URL churn, cache lifetime during long sessions, and
  behavior under browser memory pressure.
- Product-level visual review of extracted tints over representative dark, light, transparent,
  and highly saturated images.

**Stable decision:** remain monitor-high-risk. Loading, cache, error, and stale-result behavior is
recorded, but browser image/CORS and representative media evidence is incomplete.

## extract-color

### API contract

The family exposes color/result/option types, `colorCacheKey`, `getCachedColor`, direct extraction
from a decoded image, nullable cached extraction from a loaded image, promise-based image loading
and extraction, and the contrast-cap constant/helper. Sampling supports full, top-half, and
bottom-half regions. Direct extraction throws on unreadable canvas data; the loaded-image helper
returns `null`; the promise loader rejects.

### Recorded automated coverage

- Deterministic luminance cap across saturated primaries, greys, and dark input while retaining
  representative hue.
- Public cache-key format, region-separated cache reads, successful result caching, and concurrent
  pending-request deduplication.
- Top- and bottom-half canvas source coordinates and downsample dimensions with canvas mocks.
- Default/custom `crossOrigin`, image load rejection, pending cleanup/retry, and propagation of a
  tainted-canvas `SecurityError` from direct extraction.
- Canvas and Image are stubbed in unit tests; they validate arguments and error contracts, not
  browser decoding, pixel color-management, canvas implementation, or server CORS headers.

### QA still required

- Real-browser fixture images covering same-origin, CORS-enabled and CORS-denied origins, decode
  failure, transparent pixels, EXIF orientation, wide/tall assets, and top/bottom sampling.
- Cross-browser output comparison for color profiles, canvas pixel rounding, and deterministic
  dominant-color selection within an explicitly accepted tolerance.
- Performance/memory profiling for large sources, concurrent URLs, repeated cache hits, and
  long-lived pages; confirm whether cache invalidation or a size bound is required.

**Stable decision:** remain monitor-high-risk, with a preference to keep the low-level family
monitor/internal unless Atom63 intentionally commits to its cache key, pixel algorithm, browser
variance, failure modes, and public compatibility policy.
