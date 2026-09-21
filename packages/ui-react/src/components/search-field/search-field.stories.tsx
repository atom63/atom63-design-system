import { SearchField } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
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

export const Disabled: Story = {
  args: {
    'aria-label': 'Search projects',
    disabled: true,
    value: 'Mobile design system',
  },
}
