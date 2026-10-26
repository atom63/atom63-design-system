import {
  brands,
  buttonContract,
  buttonShapes,
  buttonSizes,
  buttonVariants,
  densities,
  designLanguages,
  inputs,
} from '@atom63/ui-foundation'
import { Button, UIProvider } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, Inbox } from 'lucide-react'
import type { CSSProperties } from 'react'
import { EnvironmentShell, PreviewCard, ThemeMatrix } from '../story-probes'

const meta = {
  title: 'UI React/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: buttonVariants,
    },
    size: {
      control: 'select',
      options: buttonSizes,
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Continue',
    disabled: false,
    loading: false,
    size: 'md',
    variant: 'default',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export const Playground: Story = {
  render: args => (
    <EnvironmentShell>
      <Button {...args} />
    </EnvironmentShell>
  ),
}

export const Variants: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {buttonVariants.map(variant => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
    </EnvironmentShell>
  ),
}

/* The parity sweep added two media-facing variants — `overlay` (frosted, sits
   on light imagery) and `glass` (dark-glass, sits on busy or bright imagery).
   Both are meant to float over media, so they only read correctly against a
   backdrop; render them over an image scrim rather than a flat panel. */
export const OverMedia: Story = {
  render: () => (
    <EnvironmentShell>
      <div
        style={{
          alignItems: 'center',
          backgroundImage:
            'linear-gradient(135deg, oklch(72% 0.16 250), oklch(64% 0.2 320) 55%, oklch(58% 0.18 30))',
          borderRadius: '0.875rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          minHeight: '7rem',
          padding: '1.5rem',
        }}
      >
        <Button variant="overlay">Overlay</Button>
        <Button variant="glass">Glass</Button>
        <Button aria-label="Add" size="icon" variant="glass">
          <PlusIcon />
        </Button>
      </div>
    </EnvironmentShell>
  ),
}

/* shape="round": circles for icon sizes, pills for labelled sizes, as for a
   player's play button or a pill-shaped call to action. */
/* Controls over a photo: the overlay variant reads on any image, and
   shape="round" makes the circular play and close buttons media UIs use. */
export const RoundOverMedia: Story = {
  render: () => (
    <div
      style={{
        alignItems: 'center',
        backgroundImage:
          'linear-gradient(135deg, oklch(72% 0.16 250), oklch(64% 0.2 320) 55%, oklch(58% 0.18 30))',
        borderRadius: '0.875rem',
        display: 'flex',
        gap: '0.75rem',
        minHeight: '7rem',
        padding: '1.5rem',
      }}
    >
      <Button aria-label="Close" shape="round" size="icon-sm" variant="overlay">
        <PlusIcon />
      </Button>
      <Button aria-label="Play" shape="round" size="icon-lg" variant="overlay">
        <PlusIcon />
      </Button>
      <Button shape="round" variant="overlay">
        Follow
      </Button>
    </div>
  ),
}

/* indicator: an unread dot (true) or a count, added to the accessible name. */
export const Indicator: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Button aria-label="Notifications" indicator size="icon" variant="ghost">
          <Bell aria-hidden />
        </Button>
        <Button
          aria-label="Notifications"
          indicator={3}
          shape="round"
          size="icon"
          variant="outline"
        >
          <Bell aria-hidden />
        </Button>
        <Button aria-label="Notifications" indicator={120} size="icon">
          <Bell aria-hidden />
        </Button>
        <Button indicator={4} variant="outline">
          <Inbox aria-hidden />
          Inbox
        </Button>
      </div>
    </EnvironmentShell>
  ),
}

export const Shapes: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {buttonShapes.map(shape => (
          <Button key={shape} shape={shape} variant="outline">
            {shape}
          </Button>
        ))}
        <Button aria-label="Play" shape="round" size="icon" variant="primary">
          <PlusIcon />
        </Button>
        <Button aria-label="Add" shape="round" size="icon-sm">
          <PlusIcon />
        </Button>
        <Button shape="round" size="lg" variant="primary">
          Get started
        </Button>
      </div>
    </EnvironmentShell>
  ),
}

/* shape="round" stays a circle at any size: an 88px play button, larger than
   the 56px where the soft --radius-full corner stops looking round. */
export const RoundLarge: Story = {
  render: () => (
    <EnvironmentShell>
      <Button
        aria-label="Play"
        shape="round"
        size="icon-xl"
        style={{ '--button-height': '88px' } as CSSProperties}
        variant="primary"
      >
        <PlusIcon />
      </Button>
    </EnvironmentShell>
  ),
  play: ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLElement>('[data-shape="round"]')
    const width = button?.getBoundingClientRect().width
    const radius = button && getComputedStyle(button).borderTopLeftRadius
    if (width !== 88 || radius !== '9999px') {
      throw new Error(`Expected an 88px button with a 9999px radius, got ${width}px / ${radius}`)
    }
  },
}

export const Sizes: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {buttonSizes.map(size => (
          <Button aria-label={size.startsWith('icon') ? 'Add' : undefined} key={size} size={size}>
            {size.startsWith('icon') ? <PlusIcon /> : size}
          </Button>
        ))}
      </div>
    </EnvironmentShell>
  ),
}

/* Tile size — full-width, icon-over-label; the launcher / app-grid shape ported
   from the legacy @atom63/ui button. Composes with any variant, and the caption
   wraps + stays centered. */
export const Tile: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Button size="tile" variant="outline">
          <PlusIcon />
          New
        </Button>
        <Button size="tile" variant="outline">
          <PlusIcon />
          Import
        </Button>
        <Button size="tile" variant="ghost">
          <PlusIcon />A longer tile caption that wraps
        </Button>
      </div>
    </EnvironmentShell>
  ),
}

export const States: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button>Default</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button data-pressed="">Pressed</Button>
        <Button variant="outline">
          <PlusIcon />
          With icon
        </Button>
      </div>
    </EnvironmentShell>
  ),
}

/* Loading treatment across every variant. */
export const Loading: Story = {
  render: () => (
    <EnvironmentShell>
      <div style={{ display: 'grid', gap: '0.875rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {buttonVariants
            .filter(variant => variant !== 'overlay' && variant !== 'glass')
            .map(variant => (
              <Button key={variant} loading variant={variant}>
                {variant}
              </Button>
            ))}
        </div>
        <div
          style={{
            backgroundImage:
              'linear-gradient(135deg, oklch(72% 0.16 250), oklch(64% 0.2 320) 55%, oklch(58% 0.18 30))',
            borderRadius: '0.875rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1.25rem',
          }}
        >
          <Button loading variant="overlay">
            Overlay
          </Button>
          <Button loading variant="glass">
            Glass
          </Button>
          <Button aria-label="Add" loading size="icon" variant="glass">
            <PlusIcon />
          </Button>
        </div>
      </div>
    </EnvironmentShell>
  ),
}

export const EnvironmentMatrix: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(19rem, 1fr))',
        padding: '1rem',
      }}
    >
      {designLanguages.map(designLanguage =>
        densities.map(density =>
          inputs.map(input => (
            <UIProvider
              density={density}
              designLanguage={designLanguage}
              input={input}
              key={`${designLanguage}-${density}-${input}`}
              mode="light"
            >
              <PreviewCard label={`${designLanguage} / ${density} / ${input}`}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <Button>Continue</Button>
                  <Button variant="ghost">Maybe</Button>
                  <Button variant="ghost">Cancel</Button>
                </div>
              </PreviewCard>
            </UIProvider>
          ))
        )
      )}
    </div>
  ),
}

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
              background: 'var(--a63-surface-panel)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--a63-text-primary)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--a63-text-secondary)', fontSize: 12, width: 112 }}>
              {endpoint.label}
            </span>
            <Button variant="primary">Primary</Button>
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button aria-label="Add" size="icon">
              <PlusIcon />
            </Button>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const BrandRamps: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
      }}
    >
      {brands.map(brand => (
        <UIProvider brand={brand} key={brand} mode="light">
          <PreviewCard label={`brand / ${brand}`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </PreviewCard>
        </UIProvider>
      ))}
    </div>
  ),
}

/* Theme probe — the four skins x light/dark via the shared ThemeMatrix. */
export const Themes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <ThemeMatrix>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button variant="primary">Primary</Button>
          <Button>Default</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div
          style={{
            backgroundImage: 'linear-gradient(135deg, oklch(70% 0.16 250), oklch(60% 0.2 320))',
            borderRadius: '0.625rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.75rem',
          }}
        >
          <Button variant="overlay">Overlay</Button>
          <Button variant="glass">Glass</Button>
        </div>
      </div>
    </ThemeMatrix>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(buttonContract, null, 2)}
    </pre>
  ),
}
