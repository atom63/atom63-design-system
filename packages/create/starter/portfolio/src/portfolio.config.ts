import type { Brand, FontFamily, RadiusScale, Surface } from '@atom63/ui-foundation'

type PortfolioConfig = {
  appearance: { brand: Brand; font: FontFamily; radius: RadiusScale; surface: Surface }
  hero: { plate: string; plateAlt: string }
  modules: Record<'assistant' | 'dock' | 'slides' | 'widgetBoard', boolean>
  person: {
    email: string
    headline: string
    intro: string
    links: readonly { href: string; label: string }[]
    location: string
    name: string
    role: string
    timeZone: string
  }
  title: string
}

/**
 * The one file to edit first: who the portfolio is for, how it looks, and
 * which modules it runs. Everything here is sample content about a fictional
 * person; replace it with yours.
 */
export const portfolio = {
  /** The site title, shown in the browser tab and the footer. */
  title: '{{title}}',

  person: {
    name: 'Rowan Vale',
    role: 'Product designer and design engineer',
    location: 'Lisbon, working remotely',
    /** For the clocks in the widget board and the dock. */
    timeZone: 'Europe/Lisbon',
    /** One sentence for the home page heading. */
    headline: 'Rowan Vale designs calm tools for complicated work.',
    intro:
      'I lead product design for teams whose users are busy: dispatchers, nurses, accountants. I sketch in Figma, ship in React, and measure whether it helped.',
    email: 'hello@rowanvale.example',
    links: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    ],
  },

  /**
   * The creative layer. Each value is a design system axis, applied as a
   * `data-a63-*` attribute around the whole site, so every component follows.
   * Theme and mode are the visitor's choice (the appearance menu); these are
   * yours.
   */
  appearance: {
    /** Accent ramp: 'auto' or 'b1' to 'b6'. */
    brand: 'b3',
    /** Neutral family: 'n1' to 'n6'. */
    surface: 'n6',
    /** Corner scale: 'none', 'subtle', 'default' or 'round'. */
    radius: 'default',
    /** Type personality: 'sans', 'serif', 'mono' or 'pixel'. */
    font: 'sans',
  },

  /** The art at the top of the home page. Swap the file in public/plates. */
  hero: {
    plate: '/plates/hero.svg',
    plateAlt: '',
  },

  /**
   * Optional modules. Turn one on here and it adds its route, its link or
   * its section; nothing else needs to change. See README.md.
   */
  modules: {
    /** A site assistant built on @atom63/agent. Answers offline from your content. */
    assistant: true,
    /** Talks and decks at /slides. */
    slides: false,
    /** A board of small widgets on the home page. */
    widgetBoard: false,
    /** A bottom dock with navigation and mini apps (a clock and a notepad). */
    dock: false,
  },
} as const satisfies PortfolioConfig

export type PortfolioModule = keyof typeof portfolio.modules

/** True when a module is switched on. */
export const isOn = (module: PortfolioModule): boolean => portfolio.modules[module]
