import { selectContract, selectSizes, themes } from '@atom63/ui-foundation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  UIProvider,
} from '@atom63/ui-react'
import type { SelectPopupProps } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef, useState } from 'react'

const ITEMS = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'talk', label: 'Talk' },
]

function Demo({
  size,
  disabled,
  invalid,
  portalContainer,
}: {
  size?: (typeof selectSizes)[number]
  disabled?: boolean
  invalid?: boolean
  portalContainer?: SelectPopupProps['portalContainer']
}) {
  const [value, setValue] = useState('all')
  return (
    <div style={{ width: 220 }}>
      <Select items={ITEMS} onValueChange={next => setValue(next ?? '')} value={value}>
        <SelectTrigger
          aria-label={disabled ? 'Example select, disabled' : 'Example select'}
          disabled={disabled}
          invalid={invalid}
          size={size}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectPopup portalContainer={portalContainer}>
          {ITEMS.map(i => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

const meta = {
  title: 'UI React/Select',
  component: Select,
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => <Demo />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
      {selectSizes.map(size => (
        <Demo key={size} size={size} />
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <Demo disabled />,
}

/** `invalid` (or `aria-invalid`, which FormControl sets) draws the danger edge at
 *  every size. */
export const Invalid: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
      {selectSizes.map(size => (
        <Demo invalid key={size} size={size} />
      ))}
    </div>
  ),
}

const GROUPED = [
  { value: 'article', label: 'Article', group: 'Reading' },
  { value: 'post', label: 'Post', group: 'Reading' },
  { value: 'video', label: 'Video', group: 'Watching' },
  { value: 'talk', label: 'Talk', group: 'Watching' },
]

/**
 * Grouped items with labels + a separator, rendered via the `SelectContent`
 * alias (identical to `SelectPopup`). Exercises `SelectGroup`,
 * `SelectGroupLabel`, and `SelectSeparator`. Opens on load so the visual and
 * axe runs capture the popup and its selected item.
 */
export const Grouped: Story = {
  render: () => {
    function GroupedDemo() {
      const [value, setValue] = useState('article')
      return (
        <div style={{ width: 220 }}>
          <Select
            defaultOpen
            items={GROUPED}
            onValueChange={next => setValue(next ?? '')}
            value={value}
          >
            <SelectTrigger aria-label="Example select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectGroupLabel>Reading</SelectGroupLabel>
                {GROUPED.filter(i => i.group === 'Reading').map(i => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectGroupLabel>Watching</SelectGroupLabel>
                {GROUPED.filter(i => i.group === 'Watching').map(i => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )
    }
    return <GroupedDemo />
  },
}

const LONG = Array.from({ length: 24 }, (_, i) => ({
  value: `opt-${i + 1}`,
  label: `Option ${i + 1}`,
}))

/**
 * A long list that overflows the popup so the up/down scroll arrows
 * (`ScrollUpArrow` / `ScrollDownArrow`) become visible on hover near the edges.
 * Opens on load so the visual run captures the overflowing popup.
 */
export const Scrollable: Story = {
  render: () => {
    function ScrollableDemo() {
      const [value, setValue] = useState(LONG[0].value)
      return (
        <div style={{ width: 220 }}>
          <Select
            defaultOpen
            items={LONG}
            onValueChange={next => setValue(next ?? '')}
            value={value}
          >
            <SelectTrigger aria-label="Example select">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {LONG.map(i => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      )
    }
    return <ScrollableDemo />
  },
}

/**
 * Trigger states: a placeholder (no value yet) at rest, a trigger the visual
 * project hovers with the real pointer, and one it tabs to, so the hover edge
 * and the focus-visible ring are captured (parameters.visualState, see
 * apps/storybook/README.md "Visual states").
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
      {(['placeholder', 'hover', 'focus'] as const).map(target => (
        <div key={target} style={{ width: 220 }}>
          <Select items={ITEMS}>
            <SelectTrigger
              aria-label={
                target === 'placeholder'
                  ? 'Content type'
                  : `Content type, ${target === 'hover' ? 'hovered' : 'focused'}`
              }
              data-state-target={target}
            >
              <SelectValue placeholder="Choose a type" />
            </SelectTrigger>
            <SelectPopup>
              {ITEMS.map(i => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      ))}
    </div>
  ),
  parameters: {
    visualState: {
      hover: '[data-state-target="hover"]',
      focusVisible: '[data-state-target="focus"]',
    },
  },
}

/** An open list with a disabled option, which dims and cannot be chosen. */
export const DisabledItem: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <Select defaultOpen defaultValue="article" items={ITEMS}>
        <SelectTrigger aria-label="Example select">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {ITEMS.map(i => (
            <SelectItem disabled={i.value === 'video'} key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  ),
}

const LONG_OPTIONS = [
  { value: 'short', label: 'Weekly' },
  {
    value: 'long',
    label: 'Every other Monday, after the release review and before the planning meeting',
  },
  { value: 'translated', label: 'Jeden zweiten Montag nach der Veröffentlichungsprüfung' },
]

const LONG_OPTIONS_RTL = [
  { value: 'short', label: 'أسبوعيًا' },
  {
    value: 'long',
    label: 'كل يوم اثنين آخر، بعد مراجعة الإصدار وقبل اجتماع التخطيط الأسبوعي مع فريق المنتج',
  },
  { value: 'translated', label: 'مرة في الشهر، في أول يوم عمل بعد نهاية الربع' },
]

/* An open-on-load popup renders in the first commit, before a ref is set, so the
   container is held in state and the Select mounts once it exists. The popup then
   portals inside the provider (and the dir) the story sets. */
function usePortalHost() {
  return useState<HTMLDivElement | null>(null)
}

function LongOptionsDemo({ dir, items }: { dir?: 'rtl'; items: typeof LONG_OPTIONS }) {
  const [host, setHost] = usePortalHost()
  return (
    <div dir={dir} ref={setHost} style={{ width: 240 }}>
      {host ? (
        <Select defaultOpen defaultValue="short" items={items}>
          <SelectTrigger aria-label={dir ? 'التكرار' : 'Repeat'}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup portalContainer={host}>
            {items.map(i => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      ) : null}
    </div>
  )
}

/** Long and translated options wrap so they read in full. */
export const LongOptions: Story = {
  render: () => <LongOptionsDemo items={LONG_OPTIONS} />,
}

/** Right to left: the check column sits at the inline start (the right). */
export const LongOptionsRightToLeft: Story = {
  render: () => <LongOptionsDemo dir="rtl" items={LONG_OPTIONS_RTL} />,
}

function OpenLongList() {
  const [host, setHost] = usePortalHost()
  return (
    <div ref={setHost} style={{ width: '100%', maxWidth: 320 }}>
      {host ? (
        <Select defaultOpen defaultValue={LONG[0].value} items={LONG}>
          <SelectTrigger aria-label="Example select">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup portalContainer={host}>
            {LONG.map(i => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      ) : null}
    </div>
  )
}

/** The open long list at phone width (captured at 390px): collision, scroll
 *  arrows and the popup against the screen edges. */
export const Phone: Story = {
  render: () => (
    <UIProvider designLanguage="web" input="touch">
      <OpenLongList />
    </UIProvider>
  ),
}

/** A coarse web pointer: options grow to the 44px row floor; the 32px trigger
 *  takes a 44px tap through its hit strip (check:control-alignment measures it). */
export const WebTouch: Story = {
  render: () => (
    <UIProvider designLanguage="web" input="touch">
      <div style={{ background: 'var(--a63-surface-panel)', padding: 12 }}>
        <OpenLongList />
      </div>
    </UIProvider>
  ),
}

type ProviderProps = Omit<ComponentProps<typeof UIProvider>, 'children'>

function ReviewCell({ label, providerProps }: { label: string; providerProps: ProviderProps }) {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  return (
    <UIProvider {...providerProps}>
      <div
        ref={portalContainerRef}
        style={{
          alignItems: 'center',
          background: 'var(--a63-surface-panel)',
          color: 'var(--a63-text-primary)',
          display: 'flex',
          gap: 12,
          minHeight: 72,
          padding: 12,
        }}
      >
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
          {label}
        </span>
        <Demo portalContainer={portalContainerRef} />
      </div>
    </UIProvider>
  )
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            providerProps={{ mode, theme }}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell label="Web" providerProps={{ designLanguage: 'web', input: 'pointer' }} />
      <ReviewCell label="iOS touch" providerProps={{ designLanguage: 'ios', input: 'touch' }} />
      <ReviewCell
        label="Compact extension"
        providerProps={{ density: 'compact', designLanguage: 'web', input: 'pointer' }}
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(selectContract, null, 2)}
    </pre>
  ),
}
