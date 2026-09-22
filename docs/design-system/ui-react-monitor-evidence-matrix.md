# @atom63/ui-react Monitor-high-risk Evidence Matrix

**Status:** generated stable-readiness artifact; no export changes.

**Source of truth:** `docs/design-system/audits/ui-react-export-inventory.json`, `docs/design-system/ui-react-support-policy.json`

## Summary

- Monitor families: **16**.
- Monitor symbols/types: **76**.
- High-risk families: **7** (`components/autocomplete`, `components/calendar`, `components/carousel`, `components/input-otp`, `components/portal-container`, `hooks/use-extract-color`, `lib/extract-color`).

## Evidence checklist by family

| Family                            | Risk   | Owner lane                     | Symbols | Required evidence                                                                                                              | QA matrix                                                                                         | Stable decision                                                                                                     |
| --------------------------------- | ------ | ------------------------------ | ------: | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `components/animated-check`       | medium | `design-system-interactions`   |       2 | `reduced-motion behavior`<br>`animation timing/snapshot test`<br>`packed render smoke`                                         | `default`<br>`reduced motion`<br>`theme contrast`                                                 | Promote only if motion is tokenized and reduced-motion behavior is documented.                                      |
| `components/autocomplete`         | high   | `design-system-forms`          |      18 | `keyboard navigation`<br>`filter behavior`<br>`empty/loading states`<br>`Base UI type policy`<br>`mobile viewport QA`          | `mouse`<br>`keyboard`<br>`screen reader labels`<br>`mobile popover`<br>`no-results state`         | Promote only after focused interaction tests and browser evidence cover the combobox contract.                      |
| `components/calendar`             | high   | `design-system-forms`          |       2 | `date-fns/react-day-picker dependency policy`<br>`keyboard navigation`<br>`locale/date boundary tests`<br>`mobile viewport QA` | `single month`<br>`keyboard`<br>`disabled dates`<br>`mobile`<br>`light/dark`                      | Promote only with dependency pin policy and date interaction evidence.                                              |
| `components/card`                 | medium | `design-system-surfaces`       |       4 | `pointer behavior`<br>`reduced-motion fallback`<br>`touch/no-pointer fallback`                                                 | `desktop pointer`<br>`touch viewport`<br>`reduced motion`                                         | Keep core Card stable; promote cursor helpers only if documented as an intentional card interaction API.            |
| `components/carousel`             | high   | `design-system-media`          |       8 | `Embla dependency policy`<br>`keyboard controls`<br>`loop/disabled state tests`<br>`mobile swipe QA`                           | `previous/next`<br>`keyboard`<br>`mobile swipe`<br>`short item count`<br>`RTL/focus if supported` | Promote only after gesture, focus, and dependency behavior are locked.                                              |
| `components/copy-button`          | medium | `design-system-feedback`       |       4 | `clipboard success/failure tests`<br>`aria-live feedback`<br>`permission failure behavior`                                     | `success`<br>`failure`<br>`keyboard`<br>`screen reader label`                                     | Promote if clipboard failure and feedback semantics are documented.                                                 |
| `components/destination-link`     | medium | `design-system-navigation`     |       4 | `routing/link semantics`<br>`icon override policy`<br>`accessible name behavior`                                               | `internal`<br>`external`<br>`new tab`<br>`custom icon`<br>`keyboard`                              | Promote if destination semantics and icon customization are documented.                                             |
| `components/input-otp`            | high   | `design-system-forms`          |       4 | `input-otp dependency policy`<br>`paste behavior`<br>`mobile numeric keyboard`<br>`error/disabled states`                      | `paste full code`<br>`backspace`<br>`mobile`<br>`disabled`<br>`invalid state`                     | Promote only with dependency policy and mobile/paste evidence.                                                      |
| `components/load-more-trigger`    | medium | `design-system-data-display`   |       4 | `loading/disabled contract`<br>`intersection/manual trigger behavior`<br>`empty/end state`                                     | `idle`<br>`loading`<br>`end reached`<br>`keyboard`                                                | Promote if loading state model and pagination semantics are documented.                                             |
| `components/marquee`              | medium | `design-system-motion`         |       2 | `reduced-motion fallback`<br>`overflow behavior`<br>`performance sanity`                                                       | `default`<br>`reduced motion`<br>`long content`<br>`mobile`                                       | Promote only if reduced-motion and performance constraints are explicit.                                            |
| `components/panel-setting-button` | medium | `design-system-settings`       |       2 | `button semantics`<br>`icon override policy`<br>`compact hit target QA`                                                        | `default`<br>`disabled`<br>`keyboard`<br>`mobile hit target`                                      | Promote if it is generalized beyond one product setting surface.                                                    |
| `components/portal-container`     | high   | `design-system-infrastructure` |       4 | `SSR/client behavior`<br>`nested provider behavior`<br>`overlay integration tests`                                             | `dialog`<br>`popover`<br>`nested provider`<br>`missing container`                                 | Promote only if portal ownership and SSR constraints are documented.                                                |
| `components/progressive-blur`     | medium | `design-system-surfaces`       |       3 | `CSS support/fallback`<br>`performance sanity`<br>`theme contrast`                                                             | `top`<br>`bottom`<br>`light/dark`<br>`mobile`                                                     | Promote if CSS fallback and supported positions are documented.                                                     |
| `components/text-ticker`          | medium | `design-system-motion`         |       2 | `reduced-motion fallback`<br>`content change behavior`<br>`layout stability`                                                   | `short`<br>`long`<br>`changed text`<br>`reduced motion`                                           | Promote only with reduced-motion and layout stability evidence.                                                     |
| `hooks/use-extract-color`         | high   | `design-system-media`          |       3 | `CORS/error behavior`<br>`cache behavior`<br>`loading states`<br>`contrast cap policy`                                         | `same-origin`<br>`cross-origin failure`<br>`cached`<br>`dark/light surface`                       | Promote only if browser image-loading failures and cache semantics are documented.                                  |
| `lib/extract-color`               | high   | `design-system-media`          |      10 | `algorithm determinism`<br>`contrast caps`<br>`cache key compatibility`<br>`browser canvas/CORS behavior`                      | `fixture images`<br>`transparent image`<br>`dark image`<br>`CORS failure`                         | Prefer keeping low-level utilities monitor/internal unless a stable color-extraction API is intentionally designed. |

## Symbol inventory

### components/animated-check

- Owner lane: `design-system-interactions`
- Risk: **medium**
- User value: Animated state feedback for small success/completion moments.
- Symbols:
  - `AnimatedCheck`
  - `AnimatedCheckProps`

### components/autocomplete

- Owner lane: `design-system-forms`
- Risk: **high**
- User value: Combobox/search suggestion patterns for product forms and command surfaces.
- Symbols:
  - `Autocomplete`
  - `AutocompleteClear`
  - `AutocompleteCollection`
  - `AutocompleteEmpty`
  - `AutocompleteGroup`
  - `AutocompleteGroupLabel`
  - `AutocompleteInput`
  - `AutocompleteInputProps`
  - `AutocompleteItem`
  - `AutocompleteList`
  - `AutocompletePopup`
  - `AutocompletePopupProps`
  - `AutocompleteRow`
  - `AutocompleteSeparator`
  - `AutocompleteStatus`
  - `AutocompleteTrigger`
  - `AutocompleteValue`
  - `useAutocompleteFilter`

### components/calendar

- Owner lane: `design-system-forms`
- Risk: **high**
- User value: Date picking and calendar display patterns.
- Symbols:
  - `Calendar`
  - `CalendarProps`

### components/card

- Owner lane: `design-system-surfaces`
- Risk: **medium**
- User value: Cursor-follow/card affordance helpers used by rich cards.
- Symbols:
  - `CardCursorBinding`
  - `CardCursorLabel`
  - `useCardCursor`
  - `UseCardCursorOptions`

### components/carousel

- Owner lane: `design-system-media`
- Risk: **high**
- User value: Carousel composition and controls for galleries/content rails.
- Symbols:
  - `Carousel`
  - `CarouselApi`
  - `CarouselContent`
  - `CarouselItem`
  - `CarouselNext`
  - `CarouselPrevious`
  - `CarouselProps`
  - `useCarousel`

### components/copy-button

- Owner lane: `design-system-feedback`
- Risk: **medium**
- User value: Clipboard action with feedback states.
- Symbols:
  - `CopyButton`
  - `CopyButtonFeedback`
  - `CopyButtonFeedbackProps`
  - `CopyButtonProps`

### components/destination-link

- Owner lane: `design-system-navigation`
- Risk: **medium**
- User value: External/internal destination indicator and link treatment.
- Symbols:
  - `DestinationIndicator`
  - `DestinationKind`
  - `DestinationLink`
  - `DestinationLinkProps`

### components/input-otp

- Owner lane: `design-system-forms`
- Risk: **high**
- User value: One-time-password segmented input.
- Symbols:
  - `InputOTP`
  - `InputOTPGroup`
  - `InputOTPSeparator`
  - `InputOTPSlot`

### components/load-more-trigger

- Owner lane: `design-system-data-display`
- Risk: **medium**
- User value: Incremental pagination/load-more affordance.
- Symbols:
  - `LoadMoreTrigger`
  - `LoadMoreTriggerProps`
  - `LoadMoreTriggerState`
  - `LoadMoreTriggerVariant`

### components/marquee

- Owner lane: `design-system-motion`
- Risk: **medium**
- User value: Ambient moving content strip.
- Symbols:
  - `Marquee`
  - `MarqueeProps`

### components/panel-setting-button

- Owner lane: `design-system-settings`
- Risk: **medium**
- User value: Panel-setting affordance used by configuration surfaces.
- Symbols:
  - `PanelSettingButton`
  - `PanelSettingButtonProps`

### components/portal-container

- Owner lane: `design-system-infrastructure`
- Risk: **high**
- User value: Shared portal target management for overlays.
- Symbols:
  - `PortalContainer`
  - `PortalContainerProvider`
  - `PortalContainerProviderProps`
  - `usePortalContainer`

### components/progressive-blur

- Owner lane: `design-system-surfaces`
- Risk: **medium**
- User value: Edge blur affordance for scroll/media surfaces.
- Symbols:
  - `ProgressiveBlur`
  - `ProgressiveBlurPosition`
  - `ProgressiveBlurProps`

### components/text-ticker

- Owner lane: `design-system-motion`
- Risk: **medium**
- User value: Ticker-style text motion for dynamic labels.
- Symbols:
  - `TextTicker`
  - `TextTickerProps`

### hooks/use-extract-color

- Owner lane: `design-system-media`
- Risk: **high**
- User value: React hook for deriving dominant/tint colors from images.
- Symbols:
  - `useExtractColor`
  - `UseExtractColorOptions`
  - `UseExtractColorReturn`

### lib/extract-color

- Owner lane: `design-system-media`
- Risk: **high**
- User value: Lower-level color extraction utilities backing media theming.
- Symbols:
  - `capColorForContrast`
  - `colorCacheKey`
  - `ColorSampleRegion`
  - `extractColorFromImage`
  - `extractColorFromLoadedImage`
  - `ExtractColorOptions`
  - `ExtractedColor`
  - `getCachedColor`
  - `loadAndExtractColor`
  - `TINT_MAX_LUMINANCE`

## Stable/latest rule

A monitor family cannot become stable-root-supported until its owner lane records the required evidence, QA matrix, and a final stable decision. If evidence is missing, keep it importable during beta but treat it as monitor or move it behind a preview/subpath boundary before stable/latest.

## How to update

```bash
pnpm check:ui-react-monitor-evidence --write
```

CI should run the same check without `--write` and fail if the generated JSON or Markdown drifts.
