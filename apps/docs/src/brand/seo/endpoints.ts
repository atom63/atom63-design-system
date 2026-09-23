import type { EndpointConfig, EndpointId } from './types'

const endpoints: Record<EndpointId, EndpointConfig> = {
  'atom63.io': {
    id: 'atom63.io',
    name: 'You Zhang, Design Engineer | ATOM63',
    url: 'https://atom63.io',
    description:
      'ATOM63 is the personal practice of You Zhang, a design engineer focused on visual systems, coded interfaces, brand expression, and motion-driven digital experiences.',
    ogTitle: 'ATOM63 — Design Engineering for Expressive Digital Systems',
    ogDescription:
      'The personal practice of You Zhang, focused on design engineering, visual systems, coded interfaces, and motion-driven digital experiences.',
  },

  'design-system': {
    id: 'design-system',
    name: 'Design System | ATOM63',
    url: 'https://system.atom63.io',
    description:
      'ATOM63 Design System — tokens, components, and patterns for building expressive digital interfaces.',
    keywords: ['design system', 'UI components', 'design tokens', 'component library'],
  },

  os63: {
    id: 'os63',
    name: 'OS63 | ATOM63',
    url: 'https://os.atom63.io',
    description:
      'OS63 — A web-based desktop environment by ATOM63, exploring spatial UI, window management, and expressive desktop interactions.',
    ogTitle: 'OS63 — Web Desktop by ATOM63',
    keywords: ['web desktop', 'desktop environment', 'spatial UI', 'window management'],
    themeColor: '#000000',
  },

  learn: {
    id: 'learn',
    name: 'Learn | ATOM63',
    url: 'https://learn.atom63.io',
    description:
      'Design engineering courses, visual systems tutorials, and creative workflow guides by ATOM63.',
    ogTitle: 'Learn | ATOM63 — Design Engineering Tutorials',
    keywords: [
      'design engineering courses',
      'learn design systems',
      'front-end prototyping',
      'creative workflows',
    ],
  },
}

export function getEndpoint(id: EndpointId): EndpointConfig {
  return endpoints[id]
}

export { endpoints }
