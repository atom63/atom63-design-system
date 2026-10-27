import { Button, SearchField } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'

function SearchFieldDemo() {
  const [query, setQuery] = useState('')
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
      }}
      style={{ maxWidth: 360 }}
    >
      <SearchField
        aria-label="Search projects"
        onValueChange={setQuery}
        placeholder="Search projects"
        value={query}
      />
    </form>
  )
}

const meta = {
  title: 'UI React/SearchField',
  component: SearchField,
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => <SearchFieldDemo />,
}

/* endAddon: a control after the field, such as a browse button. */
export const EndAddon: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <SearchField
        aria-label="Search the library"
        endAddon={
          <Button aria-label="Browse" size="icon-xs" variant="ghost">
            <LayoutGrid aria-hidden />
          </Button>
        }
        placeholder="What do you want to play?"
      />
    </div>
  ),
}

/* filled: a muted fill and no resting border, for a search or filter field on a
   page; the border shows on hover and focus. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <SearchField aria-label="Search issues" placeholder="Search issues" variant="filled" />
    </div>
  ),
}

/* plain: no border or fill and a separator below, for a search field at the top
   of a menu or popover. */
export const Plain: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--a63-surface-overlay)',
        border: '1px solid var(--a63-border-subtle)',
        borderRadius: 'var(--a63-overlay-radius, var(--radius-lg))',
        boxShadow: 'var(--a63-overlay-shadow)',
        maxWidth: 280,
        overflow: 'hidden',
      }}
    >
      <SearchField aria-label="Filter labels" placeholder="Filter…" variant="plain" />
      <ul
        style={{
          color: 'var(--a63-text-primary)',
          listStyle: 'none',
          margin: 0,
          padding: 'var(--a63-space-2) var(--a63-space-3)',
        }}
      >
        <li>Bug</li>
        <li>Feature</li>
        <li>Design</li>
      </ul>
    </div>
  ),
}

export const FilledDark: Story = { ...Filled, globals: { mode: 'dark' } }

export const Disabled: Story = {
  args: {
    'aria-label': 'Search projects',
    disabled: true,
    value: 'Mobile design system',
  },
}

/* Playground in dark mode, so visual regression covers dark for this component,
   which has no Themes matrix. The global applies to <html>, so portals are dark too. */
export const Dark: Story = { ...Playground, globals: { mode: 'dark' } }
