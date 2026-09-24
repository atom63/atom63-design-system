import type { Meta, StoryObj } from '@storybook/react-vite'

interface SemanticToken {
  name: string
  variable: string
  role: string
}

const SEMANTIC_COLORS: SemanticToken[] = [
  { name: 'background', variable: '--background', role: 'Page canvas' },
  { name: 'foreground', variable: '--foreground', role: 'Primary text' },
  { name: 'primary', variable: '--primary', role: 'Actions, focus rings, links' },
  { name: 'primary-foreground', variable: '--primary-foreground', role: 'Text on primary fills' },
  { name: 'secondary', variable: '--secondary', role: 'Subtle fills, secondary actions' },
  {
    name: 'secondary-foreground',
    variable: '--secondary-foreground',
    role: 'Text on secondary fills',
  },
  { name: 'muted', variable: '--muted', role: 'Disabled backgrounds, subtle separators' },
  { name: 'muted-foreground', variable: '--muted-foreground', role: 'Placeholder text, captions' },
  { name: 'accent', variable: '--accent', role: 'Hover states, active backgrounds' },
  { name: 'accent-foreground', variable: '--accent-foreground', role: 'Text on accent fills' },
  { name: 'card', variable: '--card', role: 'Card backgrounds' },
  { name: 'card-foreground', variable: '--card-foreground', role: 'Card text' },
  { name: 'popover', variable: '--popover', role: 'Floating surfaces (menus, tooltips)' },
  { name: 'popover-foreground', variable: '--popover-foreground', role: 'Popover text' },
  { name: 'border', variable: '--border', role: 'Dividers, input outlines' },
  { name: 'input', variable: '--input', role: 'Input field borders' },
  { name: 'ring', variable: '--ring', role: 'Focus ring outlines' },
  { name: 'destructive', variable: '--destructive', role: 'Danger actions, error states' },
  { name: 'success', variable: '--success', role: 'Success feedback' },
  { name: 'warning', variable: '--warning', role: 'Warning feedback' },
  { name: 'info', variable: '--info', role: 'Informational highlights' },
]

const SIDEBAR_TOKENS: SemanticToken[] = [
  { name: 'sidebar', variable: '--sidebar', role: 'Sidebar background' },
  { name: 'sidebar-foreground', variable: '--sidebar-foreground', role: 'Sidebar text' },
  { name: 'sidebar-primary', variable: '--sidebar-primary', role: 'Sidebar active item' },
  {
    name: 'sidebar-primary-foreground',
    variable: '--sidebar-primary-foreground',
    role: 'Text on active item',
  },
  { name: 'sidebar-accent', variable: '--sidebar-accent', role: 'Sidebar hover' },
  {
    name: 'sidebar-accent-foreground',
    variable: '--sidebar-accent-foreground',
    role: 'Text on hover',
  },
  { name: 'sidebar-border', variable: '--sidebar-border', role: 'Sidebar dividers' },
  { name: 'sidebar-ring', variable: '--sidebar-ring', role: 'Sidebar focus ring' },
]

function TokenRow({ token }: { token: SemanticToken }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className="border-border size-8 shrink-0 rounded-md border"
        style={{ backgroundColor: `var(${token.variable})` }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground font-mono text-xs font-medium">{token.name}</span>
        <span className="text-muted-foreground text-[10px]">{token.role}</span>
      </div>
      <code className="text-muted-foreground shrink-0 font-mono text-[10px]">{token.variable}</code>
    </div>
  )
}

function SemanticColorGrid() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Semantic color tokens</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          The public API for color in components. Every component references these tokens, never raw
          primitives. A theme file overrides surfaces and primary — semantics cascade the change
          everywhere automatically.
        </p>
      </div>
      <div className="divide-border flex flex-col divide-y">
        {SEMANTIC_COLORS.map(t => (
          <TokenRow key={t.name} token={t} />
        ))}
      </div>
    </div>
  )
}

function SidebarTokens() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground mb-1 text-sm font-semibold">Sidebar tokens</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Scoped semantic tokens for sidebar surfaces. Default to the main semantic equivalents but
          can be overridden per-theme for two-tone layouts.
        </p>
      </div>
      <div className="divide-border flex flex-col divide-y">
        {SIDEBAR_TOKENS.map(t => (
          <TokenRow key={t.name} token={t} />
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Tokens/Semantics',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Colors: Story = { render: () => <SemanticColorGrid /> }
export const Sidebar: Story = { render: () => <SidebarTokens /> }
