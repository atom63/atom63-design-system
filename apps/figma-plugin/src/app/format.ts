/** Counts as the UI shows them: with thousands separators (1,009 variables). */
const numbers = new Intl.NumberFormat('en-US')

export const formatCount = (value: number) => numbers.format(value)

/** A count with its noun, singular for one: `1 variable`, `1,009 variables`. */
export const plural = (value: number, one: string, many = `${one}s`) =>
  `${formatCount(value)} ${value === 1 ? one : many}`
