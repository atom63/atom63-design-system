---
'@atom63/widgets': patch
---

`WidgetStateFeedback` takes a `labels` prop (`Partial<WidgetErrorLabels>`) for the error state's retry, details and copy strings, with the English defaults exported as `DEFAULT_WIDGET_ERROR_LABELS`. `WidgetHostErrorFallback` takes `retryLabel` and now says "Try again", the same verb as the error state.
