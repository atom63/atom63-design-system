import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  getScrollRestorationKey: location => location.pathname,
  scrollRestoration: true,
  scrollToTopSelectors: ['[data-scroll-restoration-id="docs-body"]'],
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
