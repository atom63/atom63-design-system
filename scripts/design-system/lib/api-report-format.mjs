/**
 * Text clean-up for API reports. TypeScript prints the members of a
 * string-literal union in an order that varies between runs and machines, so
 * a committed report would go stale for no reason.
 */

/** Sorts the members of every union made only of string literals; tuples keep their order. */
export const sortLiteralUnions = text =>
  text.replace(/"[^"\n]*"(?: \| "[^"\n]*")+/g, union =>
    union
      .split(' | ')
      .sort((a, b) => a.localeCompare(b))
      .join(' | ')
  )
