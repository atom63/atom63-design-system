/**
 * The resume, as data: the resume page renders it, the timeline takes the
 * roles from it, and the assistant answers from it. Sample content about a
 * fictional person and fictional companies.
 */
export type Role = {
  company: string
  end: string | null
  highlights: string[]
  start: string
  title: string
}

export const resume = {
  summary:
    'Product designer with nine years in transport, health and finance software. I lead design from research to shipped code, and I build and maintain design systems that web and iOS teams share.',
  experience: [
    {
      company: 'Orchard Ledger',
      title: 'Design systems lead',
      start: '2024-09',
      end: null,
      highlights: [
        'Unified the web and iOS apps on one token and component contract.',
        'Cut component variants from 212 to 64 and UI review time by 40%.',
      ],
    },
    {
      company: 'Kelpline Transit',
      title: 'Lead product designer (contract)',
      start: '2025-09',
      end: '2026-03',
      highlights: ['Designed the night trip planner; missed connections fell by a third.'],
    },
    {
      company: 'Marigold Health',
      title: 'Senior product designer',
      start: '2021-02',
      end: '2024-08',
      highlights: [
        'Rebuilt front-desk scheduling for eleven clinics; booking time halved.',
        'Set up the research panel of 60 clinic staff.',
      ],
    },
    {
      company: 'Fernway Studio',
      title: 'Product designer',
      start: '2017-06',
      end: '2021-01',
      highlights: ['Designed and shipped web and mobile products for 14 clients.'],
    },
  ] satisfies Role[],
  education: [
    {
      school: 'Northbridge School of Design',
      degree: 'BA Interaction Design',
      start: '2013',
      end: '2017',
    },
  ],
  skills: [
    'Product strategy',
    'Interaction design',
    'Design systems',
    'User research',
    'Prototyping',
    'React and TypeScript',
    'SwiftUI basics',
    'Accessibility',
  ],
}

/** "2024-09" → "Sep 2024"; null → "Now". */
export function formatMonth(value: string | null): string {
  if (!value) return 'Now'
  return new Date(`${value}-01T00:00:00`).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
  })
}
