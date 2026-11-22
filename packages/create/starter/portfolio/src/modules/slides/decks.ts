/** A talk or a deck: slides with a title and a few points each. Sample content. */
export type Deck = {
  date: string
  description: string
  slides: { points: string[]; title: string }[]
  slug: string
  title: string
  venue: string
}

export const decks: Deck[] = [
  {
    slug: 'planning-backwards',
    title: 'Planning backwards',
    description: 'How a night trip planner learned to start from "home by".',
    date: '2025-10-14',
    venue: 'Regional transport design meetup',
    slides: [
      {
        title: 'Planning backwards',
        points: ['Designing a trip planner for the night network', 'Rowan Vale'],
      },
      {
        title: 'The question riders ask',
        points: [
          'Not "when is the next bus?"',
          'But "can I still get home, and when must I leave?"',
        ],
      },
      {
        title: 'What we learned on eight night shifts',
        points: [
          'Riders plan from the last bus, not the next one',
          'Walking time is the part people get wrong',
          'Drivers know which stops feel unsafe',
        ],
      },
      {
        title: 'What changed',
        points: ['Missed connections fell by a third', '48,000 night trips planned a month'],
      },
      { title: 'Thank you', points: ['hello@rowanvale.example'] },
    ],
  },
]

export function findDeck(slug: string): Deck | undefined {
  return decks.find(deck => deck.slug === slug)
}
