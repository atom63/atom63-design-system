/**
 * Shared hover/border treatment for card-like navigation surfaces (doc cards,
 * prev/next page links). Kept in one place so the two don't drift — they had
 * already diverged, with the cards changing only their border on hover while
 * prev/next also lifted the background.
 *
 * Layout, radius, and focus rings stay with each surface; this is only the
 * resting border plus its hover response.
 */
export const docNavSurface =
  'border-border hover:border-foreground/25 hover:bg-accent/40 transition-colors'
