import { MDXContentProvider, mdxStyles } from '@atom63/mdx'
import { MermaidDiagram } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const flowchart = `graph TD
  A[User visits page] --> B{Authenticated?}
  B -->|Yes| C[Show dashboard]
  B -->|No| D[Redirect to login]
  D --> E[Enter credentials]
  E --> F{Valid?}
  F -->|Yes| C
  F -->|No| G[Show error]
  G --> E`

const sequence = `sequenceDiagram
  participant U as User
  participant A as App
  participant S as Server
  participant DB as Database

  U->>A: Click submit
  A->>S: POST /api/data
  S->>DB: INSERT record
  DB-->>S: OK
  S-->>A: 201 Created
  A-->>U: Show success`

const classDiagram = `classDiagram
  class Token {
    +String name
    +String value
    +String category
    +resolve() String
  }
  class Alias {
    +Token reference
    +override() void
  }
  class Semantic {
    +String role
    +Alias source
    +bind() void
  }
  Token <|-- Alias
  Alias <|-- Semantic`

const stateDiagram = `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading : fetch()
  Loading --> Success : 200 OK
  Loading --> Error : 4xx / 5xx
  Error --> Loading : retry()
  Success --> [*]`

const meta = {
  title: 'MDX/Blocks/MermaidDiagram',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <MDXContentProvider>
        <div className={mdxStyles.root} style={{ maxWidth: '48rem' }}>
          <Story />
        </div>
      </MDXContentProvider>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Flowchart: Story = {
  render: () => <MermaidDiagram chart={flowchart} title="Auth flow" />,
}
export const Sequence: Story = {
  render: () => <MermaidDiagram chart={sequence} title="API request lifecycle" />,
}
export const ClassDiagram: Story = {
  name: 'Class Diagram',
  render: () => <MermaidDiagram chart={classDiagram} title="Token hierarchy" />,
}
export const StateDiagram: Story = {
  name: 'State Diagram',
  render: () => <MermaidDiagram chart={stateDiagram} title="Fetch state machine" />,
}
export const Animated: Story = {
  render: () => <MermaidDiagram animated chart={flowchart} title="Auth flow (draw-on-reveal)" />,
  parameters: {
    docs: {
      description: {
        story:
          'With `animated`, the diagram’s paths draw in with a one-shot stroke reveal when the ' +
          'block first enters the viewport. The effect runs once per rendered SVG and is skipped ' +
          'entirely under reduced-motion.',
      },
    },
  },
}
export const Overview: Story = {
  render: () => (
    <>
      <MermaidDiagram chart={flowchart} title="Flowchart" />
      <MermaidDiagram chart={sequence} title="Sequence diagram" />
      <MermaidDiagram chart={classDiagram} title="Class diagram" />
      <MermaidDiagram chart={stateDiagram} title="State diagram" />
    </>
  ),
}
