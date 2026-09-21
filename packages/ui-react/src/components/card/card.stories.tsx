import { cardContract, cardVariants, themes } from '@atom63/ui-foundation'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardCursorLabel,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMedia,
  CardMediaOverlay,
  CardMediaOverlayBottom,
  CardMediaOverlayIconButton,
  CardMediaOverlayScrim,
  CardMediaOverlayTopRight,
  CardTags,
  CardTitle,
  Kbd,
  UIProvider,
  useCardCursor,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/* A stand-in for real media (the DS is foundation-agnostic — no app Image/Video). */
function MediaFill() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, var(--a63-action-primary), var(--a63-surface-muted))',
      }}
    />
  )
}

function FullCard() {
  return (
    <Card style={{ width: 300 }}>
      <CardMedia aspectRatio="16/9">
        <MediaFill />
      </CardMedia>
      <CardContent>
        <CardTitle lineClamp={2}>Timeline entry</CardTitle>
        <CardDescription lineClamp={3}>
          A static surface panel with the full base-card anatomy — media, content, tags, footer.
        </CardDescription>
        <CardTags>
          <Badge size="sm" variant="secondary">
            Design
          </Badge>
          <Badge size="sm" variant="outline">
            Systems
          </Badge>
        </CardTags>
      </CardContent>
      <CardFooter>
        <span style={{ color: 'var(--a63-text-secondary)', fontSize: 13 }}>2026</span>
        <CardAction>
          <Kbd>↗</Kbd>
        </CardAction>
      </CardFooter>
    </Card>
  )
}

export const Playground: Story = {
  render: () => <FullCard />,
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
      {cardVariants.map(variant => (
        <Card key={variant} style={{ width: 240 }} variant={variant}>
          <CardHeader>
            <CardLabel>{variant}</CardLabel>
          </CardHeader>
          <CardContent>
            <CardTitle>Variant: {variant}</CardTitle>
            <CardDescription>Hover interactive/overlay to see the lift.</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}

export const MediaOverlay: Story = {
  render: () => (
    <Card style={{ height: 260, width: 320 }} variant="overlay">
      <CardMediaOverlay>
        <MediaFill />
        <CardMediaOverlayScrim />
        <CardMediaOverlayTopRight>
          <CardMediaOverlayIconButton>
            <Kbd size="sm">↗</Kbd>
          </CardMediaOverlayIconButton>
        </CardMediaOverlayTopRight>
        <CardMediaOverlayBottom>
          <CardTitle style={{ color: 'white' }}>Full-bleed media card</CardTitle>
        </CardMediaOverlayBottom>
      </CardMediaOverlay>
    </Card>
  ),
}

/* Composition usages — how the slots assemble into the real patterns the site's
   base-card is used for: the full header+content+footer "composable slots" card
   (label + action in the header, meta + action in the footer, footer flush under
   content), an article/resource card, a ghost list row, and a compact stat card
   (padding presets + responsive { base, sm }). Header/footer are optional. */
export const Compositions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'start' }}>
      {/* Full composable slots (the blog's "Header, tags, and footer" example):
          header carries a leading label + a trailing action, content holds
          title/desc/tags, footer sits flush (pt-0) with meta + its own action. */}
      <Card style={{ width: 300 }} variant="interactive">
        <CardHeader padding="md">
          <CardLabel style={{ color: 'var(--a63-text-secondary)' }}>Case study</CardLabel>
          <CardAction>
            <Badge variant="outline">2024</Badge>
          </CardAction>
        </CardHeader>
        <CardMedia aspectRatio="16/9">
          <MediaFill />
        </CardMedia>
        <CardContent>
          <CardTitle>Composable slots</CardTitle>
          <CardDescription>
            Header and footer stay optional; compose what the layout needs.
          </CardDescription>
          <CardTags>
            <Badge variant="secondary">Design</Badge>
            <Badge variant="secondary">Frontend</Badge>
          </CardTags>
        </CardContent>
        <CardFooter>
          <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12 }}>8 min read</span>
          <CardAction>
            <Button size="sm" type="button" variant="ghost">
              Details
            </Button>
          </CardAction>
        </CardFooter>
      </Card>

      {/* Article / resource card: media + content + tags + footer action */}
      <Card style={{ width: 260 }} variant="interactive">
        <CardMedia aspectRatio="16/9">
          <MediaFill />
        </CardMedia>
        <CardContent padding={{ base: 'sm', sm: 'md' }}>
          <CardTitle lineClamp={2}>Resource article</CardTitle>
          <CardDescription lineClamp={2}>
            Interactive card — hovers lift. Content padding grows with the card width.
          </CardDescription>
          <CardTags>
            <Badge size="sm" variant="blue">
              asset
            </Badge>
            <Badge size="sm" variant="violet">
              ai
            </Badge>
          </CardTags>
        </CardContent>
        <CardFooter>
          <CardLabel>2026</CardLabel>
          <CardAction>
            <Kbd size="sm">↗</Kbd>
          </CardAction>
        </CardFooter>
      </Card>

      {/* Ghost list row: no shell, horizontal, hover wash — a menu/list item */}
      <div style={{ display: 'grid', gap: 4, width: 260 }}>
        {['Timeline', 'Projects', 'Writing'].map(label => (
          <Card
            key={label}
            padding="sm"
            render={<button type="button" />}
            style={{ flexDirection: 'row', textAlign: 'left' }}
            variant="ghost"
          >
            <CardContent padding="sm" style={{ flex: 1 }}>
              <CardTitle style={{ fontSize: '0.95rem' }}>{label}</CardTitle>
            </CardContent>
            <CardAction style={{ paddingRight: '0.75rem' }}>
              <Kbd size="sm">↗</Kbd>
            </CardAction>
          </Card>
        ))}
      </div>

      {/* Compact stat card: header label + big value, tight padding */}
      <Card padding="md" style={{ width: 160 }}>
        <CardHeader padding="md">
          <CardLabel>Entries</CardLabel>
          <Badge size="sm" variant="success">
            live
          </Badge>
        </CardHeader>
        <CardContent padding={{ base: 'none', sm: 'md' }} style={{ paddingTop: 0 }}>
          <CardTitle style={{ fontSize: '2rem' }}>128</CardTitle>
        </CardContent>
      </Card>
    </div>
  ),
}

/* Cursor label — base-card's signature link-affordance, DS-style: the `useCardCursor`
   hook tracks the pointer (motion-free, no re-render) and `CardCursorLabel` is the
   pill. Move the pointer over the card. (An app can pass `onMove` to wire a spring.) */
function LinkCard() {
  const cursor = useCardCursor()
  return (
    <Card
      data-cursor-active={cursor.active || undefined}
      onPointerEnter={cursor.onPointerEnter}
      onPointerLeave={cursor.onPointerLeave}
      onPointerMove={cursor.onPointerMove}
      ref={cursor.ref}
      style={{ width: 300 }}
      variant="interactive"
    >
      <CardMedia aspectRatio="16/9">
        <MediaFill />
      </CardMedia>
      <CardContent>
        <CardTitle>External link affordance</CardTitle>
        <CardDescription>Move the pointer over the card to see the label.</CardDescription>
      </CardContent>
      {cursor.active && <CardCursorLabel>Open link ↗</CardCursorLabel>}
    </Card>
  )
}

export const CursorLabel: Story = {
  render: () => <LinkCard />,
}

/* Surface theming: modern soft-flush · aqua lift · retro Win98 bevel · terminal
   phosphor edge — carried by the --a63-surface-shadow lever the Card reads. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-page)',
                borderRadius: '0.75rem',
                display: 'flex',
                gap: 16,
                padding: '1rem',
              }}
            >
              <span
                style={{
                  color: 'var(--a63-text-secondary)',
                  fontSize: 12,
                  opacity: 0.7,
                  width: 96,
                }}
              >
                {theme} / {mode}
              </span>
              <FullCard />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same card reviewed against target host contexts. */
export const Endpoints: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        {
          label: 'Web',
          props: { density: 'comfortable', designLanguage: 'web', input: 'pointer' } as const,
        },
        {
          label: 'iOS touch',
          props: { density: 'comfortable', designLanguage: 'ios', input: 'touch' } as const,
        },
        {
          label: 'Compact extension',
          props: {
            density: 'compact',
            designLanguage: 'web',
            input: 'pointer',
            surface: 'n2',
          } as const,
        },
      ].map(endpoint => (
        <UIProvider key={endpoint.label} {...endpoint.props}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--a63-surface-page)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              gap: 16,
              padding: '1rem',
            }}
          >
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
              {endpoint.label}
            </span>
            <FullCard />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(cardContract, null, 2)}
    </pre>
  ),
}
