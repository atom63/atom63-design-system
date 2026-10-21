import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import contractIndex from '../../../../packages/ui-foundation/generated/component-contracts.json'

/**
 * The review sheet for the component intent layer (F1b-5 in
 * docs/design-system/f1-plan.md). Every component whose contract source has an
 * `intent` with platform props gets one section, read from the generated
 * contracts, so a new mapping shows up here without editing this file:
 *
 * 1. Mapping: one row per intent value (tone × emphasis, size × content), with
 *    the value each platform passes for it. An empty cell is a value that
 *    platform does not draw.
 * 2. Extensions: values only one platform draws, with deprecated aliases.
 * 3. Sizes, when the intent has them: each size's label typography role and visual height per platform,
 *    and the minimum hit target the invariant test holds them to.
 */

type Target = Record<string, string>
interface Extension {
  description?: string
  deprecatedFor?: string
}
interface PropSpec {
  map?: Record<string, Target>
  extensions?: Record<string, Extension>
}
interface PlatformSpec {
  minHitTarget?: number | { pointer: number; touch: number }
  props?: Record<string, PropSpec>
  extensionProps?: Record<string, string>
}
interface Intent {
  axes?: Record<string, string[]>
  sizes?: Record<
    string,
    { labelTypographyRole?: string; platforms?: Record<string, { visualHeight?: string }> }
  >
  platforms?: Record<string, PlatformSpec>
}

const components = Object.entries(
  (contractIndex as unknown as { components: Record<string, { intent?: Intent }> }).components
).flatMap(([name, { intent }]) =>
  intent?.platforms && Object.values(intent.platforms).some(spec => spec.props)
    ? [{ name, intent }]
    : []
)

/** One table per set of axes a prop maps onto, its rows in axis order. */
function mappingGroups(intent: Intent) {
  const platforms = Object.keys(intent.platforms ?? {})
  const order: Record<string, string[]> = {
    ...intent.axes,
    size: Object.keys(intent.sizes ?? {}),
  }
  const groups = new Map<string, { axes: string[]; rows: Map<string, Record<string, string[]>> }>()
  for (const platform of platforms) {
    for (const [prop, spec] of Object.entries(intent.platforms?.[platform]?.props ?? {})) {
      for (const [value, target] of Object.entries(spec.map ?? {})) {
        const axes = Object.keys(order).filter(axis => axis in target)
        const key = axes.join(' × ')
        if (!groups.has(key)) groups.set(key, { axes, rows: new Map() })
        const rows = groups.get(key)!.rows
        const row = axes.map(axis => target[axis]).join(' × ')
        if (!rows.has(row)) rows.set(row, {})
        ;(rows.get(row)![platform] ??= []).push(`${prop}="${value}"`)
      }
    }
  }
  const rank = (axes: string[], row: string) =>
    row.split(' × ').map((value, index) => (order[axes[index]!] ?? []).indexOf(value))
  return [...groups.entries()].map(([key, { axes, rows }]) => ({
    key,
    platforms,
    rows: [...rows.entries()].sort(([a], [b]) => {
      const [left, right] = [rank(axes, a), rank(axes, b)]
      const index = left.findIndex((value, at) => value !== right[at])
      return index < 0 ? 0 : left[index]! - right[index]!
    }),
  }))
}

const hitTarget = (target: PlatformSpec['minHitTarget']) =>
  target === undefined
    ? '–'
    : typeof target === 'number'
      ? `${target}pt`
      : `${target.pointer}px pointer, ${target.touch}px touch`

function Section({ name, intent }: (typeof components)[number]) {
  const platforms = Object.entries(intent.platforms ?? {})
  const extensions = platforms.flatMap(([platform, spec]) => [
    ...Object.entries(spec.props ?? {}).flatMap(([prop, propSpec]) =>
      Object.entries(propSpec.extensions ?? {}).map(([value, extension]) => ({
        platform,
        name: `${prop}="${value}"`,
        description: extension.deprecatedFor
          ? `Deprecated for ${prop}="${extension.deprecatedFor}". ${extension.description ?? ''}`
          : (extension.description ?? ''),
      }))
    ),
    ...Object.entries(spec.extensionProps ?? {}).map(([prop, description]) => ({
      platform,
      name: prop,
      description,
    })),
  ])
  const sizes = Object.entries(intent.sizes ?? {})
  return (
    <section className="flex flex-col gap-[var(--a63-space-4)]">
      <h2 className="text-foreground text-lg font-semibold">{name}</h2>
      {mappingGroups(intent).map(group => (
        <Table aria-label={`${name}: ${group.key} by platform`} key={group.key}>
          <TableHeader>
            <TableRow>
              <TableHead>{group.key}</TableHead>
              {group.platforms.map(platform => (
                <TableHead key={platform}>{platform}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.rows.map(([row, cells]) => (
              <TableRow key={row}>
                <TableCell className="font-mono">{row}</TableCell>
                {group.platforms.map(platform => (
                  <TableCell className="font-mono" key={platform}>
                    {cells[platform]?.join(', ') ?? '–'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
      {extensions.length > 0 && (
        <Table aria-label={`${name}: platform extensions`}>
          <TableHeader>
            <TableRow>
              <TableHead>Extension</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>What it is</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extensions.map(extension => (
              <TableRow key={`${extension.platform} ${extension.name}`}>
                <TableCell className="font-mono">{extension.name}</TableCell>
                <TableCell>{extension.platform}</TableCell>
                <TableCell className="whitespace-normal">{extension.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {sizes.length > 0 && (
        <Table aria-label={`${name}: sizes by platform`}>
          <TableHeader>
            <TableRow>
              <TableHead>size</TableHead>
              <TableHead>Label role</TableHead>
              {platforms.map(([platform]) => (
                <TableHead key={platform}>{platform} visual height</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizes.map(([size, spec]) => (
              <TableRow key={size}>
                <TableCell className="font-mono">{size}</TableCell>
                <TableCell className="font-mono">{spec.labelTypographyRole ?? '–'}</TableCell>
                {platforms.map(([platform]) => (
                  <TableCell className="font-mono" key={platform}>
                    {spec.platforms?.[platform]?.visualHeight ?? '–'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableCell>Minimum hit target</TableCell>
              <TableCell />
              {platforms.map(([platform, spec]) => (
                <TableCell key={platform}>{hitTarget(spec.minHitTarget)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      )}
    </section>
  )
}

const meta = {
  title: 'Contracts/Intent',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Platforms: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--a63-space-6)]">
      {components.map(component => (
        <Section key={component.name} {...component} />
      ))}
    </div>
  ),
}
