/** Title and optional description for one feedback state. */
export interface WidgetFeedbackCopy {
  title: string
  description?: string
}

export type WidgetFeedbackState = 'loading' | 'error' | 'empty'

/**
 * The shared async-state contract for widget views.
 *
 * Top-level props on purpose: `listening` and `profile` used to carry these
 * inside their `data` object while every other widget took them as props, so a
 * host had to remember which shape a given widget wanted. One shape, one place.
 */
export interface WidgetStateProps {
  /** Truthy renders the error state. Accepts `unknown` so hosts can pass a query error straight through. */
  error?: unknown
  isLoading?: boolean
  /** Background refresh — content stays mounted, controls show activity. */
  isRefreshing?: boolean
  onRetry?: () => void
}

/** Per-widget wording for the shared feedback surface. */
export interface WidgetStateCopy {
  empty?: WidgetFeedbackCopy
  error?: WidgetFeedbackCopy
  loading?: WidgetFeedbackCopy
}

/**
 * Resolve which feedback state a view should render, if any.
 *
 * `error` wins over `isLoading`: a failed refresh must not sit behind a spinner
 * forever. `isEmpty` is only consulted once the data settles.
 */
export function resolveWidgetFeedbackState({
  error,
  isEmpty,
  isLoading,
}: {
  error?: unknown
  isEmpty?: boolean
  isLoading?: boolean
}): WidgetFeedbackState | null {
  if (error) {
    return 'error'
  }
  if (isLoading) {
    return 'loading'
  }
  if (isEmpty) {
    return 'empty'
  }
  return null
}

/** Error message text, when the host passed a real Error. */
export function getWidgetErrorDescription(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined
}

/**
 * Build a widget's feedback copy from its three state titles.
 *
 * Every widget needs the same thing: a title per state, plus the error's own
 * message on the error state. Six widgets hand-rolled that in two different
 * shapes — a map of thunks in some, an object plus a `feedbackState === 'error'`
 * ternary at the call site in others. This is the one shape.
 *
 * @example
 * const WEATHER_STATE_COPY = widgetStateCopy({
 *   empty: 'No weather data yet',
 *   error: 'Unable to load weather',
 *   loading: 'Loading weather',
 * })
 *
 * <WidgetStateFeedback copy={WEATHER_STATE_COPY(feedbackState, error)} … />
 */
export function widgetStateCopy(
  titles: Record<WidgetFeedbackState, string>
): (state: WidgetFeedbackState, error?: unknown) => WidgetFeedbackCopy {
  return (state, error) => ({
    description: state === 'error' ? getWidgetErrorDescription(error) : undefined,
    title: titles[state],
  })
}
