import { itemContract, themes } from '@atom63/ui-foundation'
import { Bookmark } from 'lucide-react'
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Item',
  component: Item,
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div style={{ width: 'min(360px, 100%)' }}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Bookmark aria-hidden />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Starred project</ItemTitle>
          <ItemDescription>Last edited 2 hours ago by you.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" type="button" variant="secondary">
            Open
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      {(['default', 'outline', 'muted'] as const).map(variant => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>The {variant} chrome.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
}

/* A grouped list with separators; sizes tighten the row density. */
export const Group: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <ItemGroup>
        <Item size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>First</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>Second</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
}

/* A clickable row via the render prop (renders an <a>, gets a muted hover). */
export const AsLink: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Item
        render={
          <a href="#item-link">
            <ItemContent>
              <ItemTitle>Clickable row</ItemTitle>
              <ItemDescription>Renders as an anchor.</ItemDescription>
            </ItemContent>
          </a>
        }
        variant="outline"
      />
    </div>
  ),
}

/* Every size tightens the row density (default · sm · xs). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      {(['default', 'sm', 'xs'] as const).map(size => (
        <Item key={size} size={size} variant="outline">
          <ItemMedia variant="icon">
            <Bookmark aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{size}</ItemTitle>
            <ItemDescription>The {size} row density.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
}

/* Renders a representative Item across all 4 DS themes × light/dark. */
export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem',
                background: 'var(--a63-surface-panel)',
                color: 'var(--a63-text-primary)',
                borderRadius: 'var(--a63-surface-radius, var(--radius-lg))',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.7, width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ width: 320 }}>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Bookmark aria-hidden />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Starred project</ItemTitle>
                    <ItemDescription>Last edited 2 hours ago.</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="sm" type="button" variant="secondary">
                      Open
                    </Button>
                  </ItemActions>
                </Item>
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
        <EndpointItem label="Web" />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <EndpointItem label="iOS touch" />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <EndpointItem label="Compact extension" />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(itemContract, null, 2)}
    </pre>
  ),
}

function EndpointItem({ label }: { label: string }) {
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
      <span style={{ fontSize: 12, opacity: 0.7, width: 112 }}>{label}</span>
      <div style={{ width: 320 }}>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Bookmark aria-hidden />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Starred project</ItemTitle>
            <ItemDescription>Last edited 2 hours ago.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" type="button" variant="secondary">
              Open
            </Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  )
}
