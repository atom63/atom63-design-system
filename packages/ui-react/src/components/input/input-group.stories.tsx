import { inputGroupContract } from '@atom63/ui-foundation'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import { AtSign, Mail, Search, Send } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Input Group',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

function CompactExample() {
  return (
    <InputGroup style={{ width: '100%' }}>
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search components" placeholder="Search components" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export const Default: Story = {
  render: () => (
    <div className="grid w-[min(38rem,calc(100vw-3rem))] gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search components" placeholder="Search components" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>⌘K</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <AtSign aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-label="Username" placeholder="youzhang" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Send invite" size="icon-sm" type="button">
            <Send aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Mail aria-hidden />
        </InputGroupAddon>
        <InputGroupInput aria-invalid aria-label="Invite email" placeholder="bad-email" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Invalid</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align="block-start">Comment</InputGroupAddon>
        <InputGroupTextarea aria-label="Comment" placeholder="Leave a note for review." />
      </InputGroup>
    </div>
  ),
}

export const Endpoints: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))',
      }}
    >
      <UIProvider designLanguage="web" input="pointer">
        <CompactExample />
      </UIProvider>
      <UIProvider designLanguage="ios" input="touch">
        <CompactExample />
      </UIProvider>
      <UIProvider density="compact" designLanguage="web" input="pointer">
        <CompactExample />
      </UIProvider>
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(inputGroupContract, null, 2)}
    </pre>
  ),
}
