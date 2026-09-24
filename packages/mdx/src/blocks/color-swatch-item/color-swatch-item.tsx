export type ColorSwatchItemProps = {
  name: string
  variable: string
}

/** Single semantic color swatch for token documentation in MDX. */
export function ColorSwatchItem({ name, variable }: ColorSwatchItemProps) {
  return (
    <div className="flex w-full max-w-80 items-center gap-2">
      <div className="mdx-color-swatch-frame checker-bg size-16 shrink-0 overflow-hidden">
        <div className="size-full" style={{ backgroundColor: `var(${variable})` }} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="mdx-color-swatch-name text-sm font-semibold">{name}</div>
        <div className="mdx-color-swatch-var text-sm">{variable}</div>
      </div>
    </div>
  )
}
