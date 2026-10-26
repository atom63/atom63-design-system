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
import {
  ArrowRightLeft,
  Bell,
  ChevronLeft,
  Ellipsis,
  Inbox,
  Layers,
  LocateFixed,
  Plus,
  Send,
} from 'lucide-react'
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

/* Floating over a map: variant="raised" with shape="round" is the light
   floating button maps and light heroes use (back, locate, layers). The panel
   fill and a soft shadow lift it off a light picture; over dark media use
   overlay. The map is a placeholder with fixed light-map colors, as a real
   map tile would be. */
export const FloatingOverMap: Story = {
  render: () => (
    <div
      style={{
        backgroundColor: 'oklch(95% 0.02 95)',
        backgroundImage: [
          'radial-gradient(circle at 72% 68%, oklch(88% 0.07 150) 0 18%, transparent 18.5%)',
          'radial-gradient(ellipse at 12% 90%, oklch(86% 0.06 230) 0 22%, transparent 22.5%)',
          'linear-gradient(28deg, transparent 47%, oklch(99% 0 0) 47% 51%, transparent 51%)',
          'linear-gradient(118deg, transparent 58%, oklch(99% 0 0) 58% 60.5%, transparent 60.5%)',
          'linear-gradient(90deg, transparent 30%, oklch(92% 0.06 85) 30% 32.5%, transparent 32.5%)',
        ].join(', '),
        borderRadius: '0.875rem',
        height: '22rem',
        maxWidth: '24rem',
        position: 'relative',
      }}
    >
      <div style={{ insetInlineStart: '1rem', position: 'absolute', top: '1rem' }}>
        <Button aria-label="Back" shape="round" size="icon-lg" variant="raised">
          <ChevronLeft />
        </Button>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          insetInlineEnd: '1rem',
          position: 'absolute',
          top: '1rem',
        }}
      >
        <Button aria-label="Map layers" shape="round" size="icon-lg" variant="raised">
          <Layers />
        </Button>
        <Button aria-label="Show my location" shape="round" size="icon-lg" variant="raised">
          <LocateFixed />
        </Button>
      </div>
      <div
        style={{
          bottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          insetInlineStart: '1rem',
          position: 'absolute',
        }}
      >
        <Button shape="round" variant="raised">
          Search this area
        </Button>
        <Button disabled shape="round" variant="raised">
          Directions
        </Button>
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLElement>('[aria-label="Back"]')
    if (!button) throw new Error('Expected the Back button')
    const style = getComputedStyle(button)
    const { width, height } = button.getBoundingClientRect()
    if (Math.abs(width - height) > 0.5 || style.borderTopLeftRadius !== '9999px') {
      throw new Error(`Expected a circle, got ${width}x${height} / ${style.borderTopLeftRadius}`)
    }
    if (style.boxShadow === 'none' || !/\dpx/.test(style.boxShadow)) {
      throw new Error(`Expected a soft shadow, got ${style.boxShadow}`)
    }
    if (style.borderTopColor !== 'rgba(0, 0, 0, 0)') {
      throw new Error(`Expected no visible border, got ${style.borderTopColor}`)
    }
  },
}

const heroActions = [
  { icon: Plus, label: 'Add money' },
  { icon: ArrowRightLeft, label: 'Move' },
  { icon: Send, label: 'Send' },
  { icon: Ellipsis, label: 'More' },
]

/* A hero on --a63-gradient-brand-fade, which runs from the brand into the page.
   Overlay buttons and their on-media labels sit in the dark zone, the top
   --a63-gradient-brand-fade-dark-zone of the hero, where white keeps WCAG AA
   on every brand. Below it the hero fades into the page, so the content
   there uses the page tokens and the default button variants, on its own
   panel while the fade is still running. */
export const RoundOnBrandFade: Story = {
  render: () => (
    <div
      style={{
        backgroundImage: 'var(--a63-gradient-brand-fade)',
        borderRadius: '0.875rem',
        display: 'grid',
        gridTemplateRows: 'var(--a63-gradient-brand-fade-dark-zone) 1fr',
        height: '26rem',
        maxWidth: '24rem',
      }}
    >
      <div
        style={{
          alignContent: 'space-between',
          color: 'var(--a63-on-media-foreground)',
          display: 'grid',
          gap: 'var(--a63-space-4)',
          padding: 'var(--a63-space-5)',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--a63-type-footnote-font-size)' }}>Main account</div>
          <div
            style={{
              fontSize: 'var(--a63-type-large-title-font-size)',
              fontWeight: 'var(--a63-type-large-title-font-weight)',
            }}
          >
            £2,480.15
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {heroActions.map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{
                alignItems: 'center',
                display: 'grid',
                fontSize: 'var(--a63-type-footnote-font-size)',
                gap: 'var(--a63-space-1_5)',
                justifyItems: 'center',
              }}
            >
              <Button aria-label={label} shape="round" size="icon-lg" variant="overlay">
                <Icon aria-hidden />
              </Button>
              <span aria-hidden>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ alignContent: 'end', display: 'grid', padding: 'var(--a63-space-3)' }}>
        <div
          style={{
            background: 'var(--a63-surface-panel)',
            border: '1px solid var(--a63-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--a63-text-primary)',
            display: 'grid',
            gap: 'var(--a63-space-3)',
            padding: 'var(--a63-space-4)',
          }}
        >
          <p style={{ color: 'var(--a63-text-secondary)', margin: 0 }}>
            Below the dark zone the hero fades into the page. Content here uses the page tokens on
            its own panel, never overlay buttons or on-media text, which vanish as the hero fades.
          </p>
          <Button variant="outline">See all transactions</Button>
        </div>
      </div>
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
        <Button disabled variant="primary">
          Disabled primary
        </Button>
        <Button data-pressed="">Pressed</Button>
        <Button variant="outline">
          <PlusIcon />
          With icon
        </Button>
      </div>
    </EnvironmentShell>
  ),
  play: async ({ canvas, canvasElement }) => {
    // A disabled primary is a neutral fill with muted text, not a paler accent,
    // in every environment the shell renders.
    for (const button of canvas.getAllByRole('button', { name: 'Disabled primary' })) {
      // Paint a value next to the button, so it resolves in the button's environment.
      const paint = (property: 'backgroundColor' | 'color', value: string) => {
        const probe = canvasElement.ownerDocument.createElement('span')
        probe.style[property] = value
        button.after(probe)
        const painted = getComputedStyle(probe)[property]
        probe.remove()
        return painted
      }
      const style = getComputedStyle(button)
      // ui-react does not depend on storybook, so the checks throw plain errors.
      const background = paint('backgroundColor', 'var(--a63-action-disabled-background)')
      if (style.backgroundColor !== background) {
        throw new Error(`Disabled background ${style.backgroundColor}, expected ${background}`)
      }
      const color = paint('color', 'var(--a63-action-disabled-foreground)')
      if (style.color !== color) {
        throw new Error(`Disabled foreground ${style.color}, expected ${color}`)
      }
      if (style.backgroundColor === paint('backgroundColor', 'var(--a63-action-primary)')) {
        throw new Error('Disabled primary still uses the action-primary fill')
      }
    }
  },
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
