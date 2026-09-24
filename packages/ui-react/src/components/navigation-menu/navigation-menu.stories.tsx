import { navigationMenuContract, themes } from '@atom63/ui-foundation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ComponentProps, useRef } from 'react'
import { repeatedLandmarks } from '../story-probes'

const meta = {
  title: 'UI React/NavigationMenu',
  component: NavigationMenu,
  decorators: [
    Story => (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

type DemoProps = Pick<ComponentProps<typeof NavigationMenu>, 'align' | 'portalContainer'> & {
  width?: number
}

function Demo({ align, portalContainer, width = 240 }: DemoProps) {
  return (
    <NavigationMenu align={align} portalContainer={portalContainer}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ display: 'grid', gap: 4, width }}>
              <NavigationMenuLink href="#a">Analytics</NavigationMenuLink>
              <NavigationMenuLink href="#b">Automation</NavigationMenuLink>
              <NavigationMenuLink href="#c">Reporting</NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ display: 'grid', gap: 4, width }}>
              <NavigationMenuLink href="#d">About</NavigationMenuLink>
              <NavigationMenuLink href="#e">Careers</NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export const Playground: Story = {
  render: () => <Demo />,
}

// The Root forwards `align` to the shared Positioner, so the popup can anchor
// to the trigger's end edge (useful for right-aligned nav bars).
export const AlignEnd: Story = {
  render: () => <Demo align="end" />,
}

// The trigger bar is the always-visible surface; the shared content panel is
// portalled, so the matrix documents the trigger chrome across all 4 DS themes.
export const Themes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <ReviewCell
            key={`${theme}-${mode}`}
            label={`${theme} / ${mode}`}
            mode={mode}
            theme={theme}
          />
        ))
      )}
    </div>
  ),
}

export const Endpoints: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <ReviewCell designLanguage="web" input="pointer" label="Web" />
      <ReviewCell designLanguage="ios" input="touch" label="iOS touch" />
      <ReviewCell
        density="compact"
        designLanguage="web"
        input="pointer"
        label="Compact extension"
      />
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(navigationMenuContract, null, 2)}
    </pre>
  ),
}

type ReviewCellProps = Omit<ComponentProps<typeof UIProvider>, 'children'> & { label: string }

function ReviewCell({ label, ...providerProps }: ReviewCellProps) {
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
          padding: 12,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
          {label}
        </span>
        <Demo portalContainer={portalContainerRef} width={200} />
      </div>
    </UIProvider>
  )
}
