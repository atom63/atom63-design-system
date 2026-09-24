import { scrollableListContract, themes } from '@atom63/ui-foundation'
import { Badge, ScrollableList, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/ScrollableList',
  component: ScrollableList,
} satisfies Meta<typeof ScrollableList>
export default meta
// Render-only stories: they build their own props, so no required args apply.
type Story = StoryObj

const TAGS = [
  'Design',
  'Systems',
  'AI',
  'Motion',
  'React',
  'Tokens',
  'iOS',
  'Windows',
  'Figma',
  'Craft',
]

const Row = () => (
  <div style={{ display: 'flex', gap: 8, padding: 4 }}>
    {TAGS.map(t => (
      <Badge key={t} variant="secondary">
        {t}
      </Badge>
    ))}
  </div>
)

/* Horizontal scroll with chevron nav (CSS fade — no motion dep). The chevrons use
   the DS Button; overflow scrolls the ScrollArea viewport. */
export const Playground: Story = {
  render: () => (
    <div style={{ width: 'min(420px, 100%)' }}>
      <ScrollableList>
        <Row />
      </ScrollableList>
    </div>
  ),
}

/* `mask={false}` turns off the edge fade — content clips hard at the frame. */
export const NoMask: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <ScrollableList mask={false}>
        <Row />
      </ScrollableList>
    </div>
  ),
}

/* `draggable` lets you grab the list and pull it horizontally (grab cursor;
   the click that ends a drag is swallowed so items don't fire). */
export const Draggable: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <ScrollableList draggable>
        <Row />
      </ScrollableList>
    </div>
  ),
}

/* `contentPad` + `controlInset`: full-bleed track with items/chevrons aligned
   to a narrower column (e.g. max-w-xl + px-6). Mount the list at scrollport
   width; pass CSS lengths that resolve against that width. */
export const ColumnAlignedBleed: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 960, marginInline: 'auto' }}>
      <p style={{ maxWidth: '36rem', marginInline: 'auto', paddingInline: '1.5rem' }}>
        Reading column copy. The scroller below spans this demo frame; tiles and chevrons line up
        with this inset.
      </p>
      <div style={{ marginTop: 16 }}>
        <ScrollableList
          contentPad="max(1.5rem, calc((100% - 36rem) / 2 + 1.5rem))"
          controlInset="max(0px, calc((100% - 36rem) / 2))"
          mask={false}
        >
          {TAGS.map(t => (
            <Badge
              key={t}
              style={{ flex: '0 0 auto', minWidth: 140, display: 'flex', justifyContent: 'center' }}
              variant="secondary"
            >
              {t}
            </Badge>
          ))}
        </ScrollableList>
      </div>
    </div>
  ),
}

/* The horizontal scroller (edge fade + chevron nav on the DS Button) rendered
   across all 4 DS themes in light and dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ flex: 1, minWidth: 0, maxWidth: 360 }}>
                <ScrollableList>
                  <Row />
                </ScrollableList>
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <UIProvider designLanguage="web" input="pointer">
        <EndpointList label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointList label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointList label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(scrollableListContract, null, 2)}
    </pre>
  ),
}

function EndpointList({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-panel)',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        gap: 12,
        padding: 12,
      }}
    >
      <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 360 }}>
        <ScrollableList draggable>
          <Row />
        </ScrollableList>
      </div>
    </div>
  )
}
