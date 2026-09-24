import type {
  ButtonSize,
  InputSize,
  SegmentedControlSize,
  SelectSize,
  TabsSize,
  ToggleSize,
} from '@atom63/ui-foundation'
import type { SegmentedControlItem } from '@atom63/ui-react'
import {
  Button,
  Input,
  SegmentedControl,
  Select,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTab,
  Toggle,
} from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Control geometry audit across the two axes that can fight each other.
 *
 * Height comes from the ramp the DENSITY axis owns (`--a63-control-height-*` is
 * `--a63-space-unit × N`). Font size comes from the TYPE SCALE axis
 * (`--typography-*` × `--typography-scale`). They are orthogonal by design
 * (docs/design-system/personalization-axes.md), so nothing stops them moving in
 * opposite directions, and before the content floor landed they already had: at
 * `large` × `compact` the internal padding was 0.15px per side on `xl` and
 * exactly 0 on `icon-sm`.
 *
 * Nothing in CI catches that — `@storybook/addon-vitest` is not configured, so
 * there are no story tests, and the nightly browser checks cover the website's
 * lightbox and homepage, not these recipes. This sheet is the manual review
 * surface, in the same spirit as `OS63 Widgets/Visual Audit`.
 *
 * ## What to look for
 *
 * 1. Within a cell, every control in the row is the SAME height and sits on the
 *    same top edge. A text button beside an icon button beside a Select is the
 *    case that broke historically, and the content floor is keyed to the size
 *    STEP specifically so this holds.
 * 2. `normal` × `comfortable` is the shipping default. It must look exactly like
 *    it always has — the floor is authored to be inert there.
 * 3. Down the `compact` column and across to `large`, controls should get
 *    tighter but never let their label touch or cross the border.
 */

/**
 * The size ramps are NOT spelled the same across these components, so the row
 * maps one step onto each component's own union rather than interpolating a
 * name. Button's medium icon step is `icon` (there is no `icon-md`) and Tabs
 * calls its medium step `default` (there is no `md`) — both are type errors
 * waiting to happen if this is built by string concatenation.
 */
const STEPS = [
  { button: 'sm', icon: 'icon-sm', shared: 'sm', tabs: 'sm' },
  { button: 'md', icon: 'icon', shared: 'md', tabs: 'default' },
  { button: 'lg', icon: 'icon-lg', shared: 'lg', tabs: 'lg' },
] as const satisfies readonly {
  button: ButtonSize
  icon: ButtonSize
  shared: SelectSize & InputSize & ToggleSize & SegmentedControlSize
  tabs: TabsSize
}[]

/** `SegmentedControl` is controlled and takes `items`, not children. */
const SEGMENTS: SegmentedControlItem[] = [
  { label: 'One', value: 'a' },
  { label: 'Two', value: 'b' },
]

function ControlRow({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div className="flex flex-wrap items-center gap-[var(--a63-space-2)]">
      <Button size={step.button} type="button" variant="outline">
        Label
      </Button>
      <Button aria-label="Icon" size={step.icon} type="button" variant="outline">
        <svg aria-hidden height="14" viewBox="0 0 16 16" width="14">
          <title>Icon</title>
          <circle cx="8" cy="8" fill="currentColor" r="5" />
        </svg>
      </Button>
      <Select>
        <SelectTrigger aria-label="Example select" size={step.shared}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
      <Input aria-label="Example field" defaultValue="Field" size={step.shared} />
      <Toggle size={step.shared}>Toggle</Toggle>
      {/* Static sheet — the value never changes, so the handler is a no-op. */}
      <SegmentedControl items={SEGMENTS} onValueChange={() => {}} size={step.shared} value="a" />
      <Tabs defaultValue="a">
        <TabsList size={step.tabs}>
          <TabsTab value="a">Tab</TabsTab>
          <TabsTab value="b">Tab</TabsTab>
        </TabsList>
      </Tabs>
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Control Axis Audit',
  parameters: {
    layout: 'fullscreen',
  },
  // Gallery sheet for human craft review — agents should read the component
  // autodocs, not this, which is why it stays off the manifest.
  tags: ['!manifest'],
}

export default meta

type Story = StoryObj

/**
 * Every control that consumes the shared height ramp, at every combination of
 * type scale and density, so a control that stops fitting its own text is
 * visible in one screen.
 */
export const ControlRows: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-muted-foreground font-mono text-[11px]">
        Drive <code>Density</code> and <code>Type scale</code> from the toolbar. Both are stamped on
        the document root, which is the only scope where they fully resolve.
      </div>
      {STEPS.map(step => (
        <div className="border-border rounded-lg border p-3" key={step.button}>
          <div className="text-muted-foreground mb-2 font-mono text-[11px]">
            step: {step.button}
          </div>
          <ControlRow step={step} />
        </div>
      ))}
    </div>
  ),
}
