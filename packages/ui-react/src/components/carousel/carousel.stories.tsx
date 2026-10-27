import { carouselContract, themes } from '@atom63/ui-foundation'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  UIProvider,
} from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { repeatedLandmarks } from '../story-probes'

const meta = {
  title: 'UI React/Carousel',
  component: Carousel,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    cursorIndicator: { control: 'boolean' },
  },
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const slides = ['One', 'Two', 'Three', 'Four', 'Five']

function Slide({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--a63-surface-control)',
        borderRadius: '0.75rem',
        color: 'var(--a63-text-primary)',
        display: 'flex',
        fontSize: 32,
        fontWeight: 600,
        height: 220,
        justifyContent: 'center',
      }}
    >
      {label}
    </div>
  )
}

export const Playground: Story = {
  render: args => (
    <div style={{ maxWidth: 520 }}>
      <Carousel {...args} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/* Dots under the slides: one round dot per snap point, the current one darker. */
export const WithDots: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Carousel>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

/* shape="dot" (default) keeps every dot round and marks the current one by colour;
 * shape="pill" stretches the current one into a pill. */
export const DotShapes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 520 }}>
      {(['dot', 'pill'] as const).map(shape => (
        <Carousel key={shape}>
          <CarouselContent>
            {slides.map(label => (
              <CarouselItem key={label}>
                <Slide label={`${label} · ${shape}`} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots shape={shape} />
        </Carousel>
      ))}
    </div>
  ),
}

/* tone="neutral" (default) and tone="accent" under the slides; tone="on-media" draws white
 * dots over a photo or video, here laid over the media stage. */
export const DotTones: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 520 }}>
      {(['neutral', 'accent'] as const).map(tone => (
        <Carousel key={tone}>
          <CarouselContent>
            {slides.map(label => (
              <CarouselItem key={label}>
                <Slide label={`${label} · ${tone}`} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots tone={tone} />
        </Carousel>
      ))}
      <Carousel>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label}>
              <div
                style={{
                  alignItems: 'center',
                  background: 'var(--a63-media-stage)',
                  borderRadius: '0.75rem',
                  color: 'var(--a63-on-media-foreground)',
                  display: 'flex',
                  fontSize: 32,
                  fontWeight: 600,
                  height: 220,
                  justifyContent: 'center',
                }}
              >
                {label} · on-media
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots
          style={{ bottom: 'var(--a63-space-2)', insetInline: 0, position: 'absolute' }}
          tone="on-media"
        />
      </Carousel>
    </div>
  ),
}

/* Right-to-left: the first slide starts at the right, the previous button sits on the right and
 * the arrow keys follow the reading direction. */
export const RightToLeft: Story = {
  render: args => (
    <div dir="rtl" style={{ maxWidth: 520 }}>
      <Carousel {...args}>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/* Pointer-following cursor indicator — a round prev/next affordance tracks the
 * pointer inside the viewport and scrolls on click (no visible nav arrows). */
export const CursorIndicator: Story = {
  args: { cursorIndicator: true },
  render: args => (
    <div style={{ maxWidth: 520 }}>
      <Carousel {...args} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
}

/* Two slides per view — items narrow to half-basis (prod basis-1/2). */
export const MultiPerView: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent>
          {slides.map(label => (
            <CarouselItem key={label} style={{ flexBasis: '50%' }}>
              <Slide label={label} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

export const Themes: Story = {
  parameters: repeatedLandmarks,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div
              style={{
                alignItems: 'center',
                background: 'var(--a63-surface-panel)',
                borderRadius: '0.75rem',
                color: 'var(--a63-text-primary)',
                display: 'flex',
                gap: 12,
                padding: '0.75rem',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 96 }}>
                {theme} / {mode}
              </span>
              <div style={{ maxWidth: 320 }}>
                <Carousel opts={{ loop: true }}>
                  <CarouselContent>
                    {slides.map(label => (
                      <CarouselItem key={label}>
                        <Slide label={label} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* The same carousel reviewed against target host contexts. */
export const Endpoints: Story = {
  parameters: repeatedLandmarks,
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
              gap: 12,
              padding: '0.75rem',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--a63-text-secondary)', width: 112 }}>
              {endpoint.label}
            </span>
            <div style={{ maxWidth: 320 }}>
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  {slides.map(label => (
                    <CarouselItem key={label}>
                      <Slide label={label} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const ContractMetadata: Story = {
  render: () => (
    <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(carouselContract, null, 2)}
    </pre>
  ),
}
