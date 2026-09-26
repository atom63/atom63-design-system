import {
  createContext,
  useContext,
  useMemo,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from 'react'
import { resolveDestination, type WidgetDestination } from './destination'

export type WidgetLinkProps = {
  href: string
  children?: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'>

interface WidgetLinkContextValue {
  Link?: ComponentType<WidgetLinkProps>
  origins: readonly string[]
}

const EMPTY: WidgetLinkContextValue = { origins: [] }

const WidgetLinkContext = createContext<WidgetLinkContextValue>(EMPTY)

/**
 * Supplies the component that in-app destinations render as, and the origins
 * this app answers for.
 *
 * Widgets link to app routes, but the package cannot import a router: it is
 * mounted in two apps with different navigation, and on atom63.io an in-app
 * portfolio href does not even change route — it opens the detail overlay on
 * the current page. So the host names the component and the widget asks for it.
 *
 * This is context rather than a prop because there is no prop channel to use.
 * Widgets reach the screen through a lazy registry whose entries are
 * `ComponentType<{ size }>`, composed by the agent's slot renderer — threading
 * a slot to them would mean changing that contract in both apps and in the
 * agent package. Navigation is an app-wide singleton, which is what context is
 * for.
 *
 * ## Why `origins` is not just `window.location.origin`
 *
 * Portfolio cards author one absolute `https://atom63.io/...` href for every
 * host, so "is this mine?" is decided by comparing origins. The running origin
 * alone answers that correctly in production and WRONGLY everywhere a change
 * is actually tested: on `localhost:5173` and on a `*.vercel.app` preview,
 * atom63.io's own cards compare as cross-origin and render as external links
 * that leave for production. A host that knows it IS atom63.io says so here,
 * and dev, preview and production agree.
 *
 * Only a host that can route should declare them: the origins decide which
 * links are treated as in-app, so claiming one you cannot route turns a
 * working external link into a dead in-app one.
 *
 * Opt-in by design: with no provider, in-app destinations fall back to a
 * native anchor and full-page navigate. That is a working link, just not a
 * routed one, so a host that forgets this degrades rather than breaks.
 *
 * External destinations never use it — they always open a plain new-tab anchor.
 *
 * @example
 * <WidgetLinkProvider Link={DetailHrefLink} origins={[PORTFOLIO_ORIGIN]}>
 *   <AgentChat />
 * </WidgetLinkProvider>
 */
export function WidgetLinkProvider({
  children,
  Link,
  origins,
}: {
  children: ReactNode
  Link: ComponentType<WidgetLinkProps>
  /** Origins this app serves, besides the one it is running on. */
  origins?: readonly string[]
}) {
  const value = useMemo<WidgetLinkContextValue>(
    () => ({ Link, origins: origins ?? [] }),
    [Link, origins]
  )

  return <WidgetLinkContext.Provider value={value}>{children}</WidgetLinkContext.Provider>
}

/** The host's in-app link component, or undefined when none was provided. */
export function useWidgetLink(): ComponentType<WidgetLinkProps> | undefined {
  return useContext(WidgetLinkContext).Link
}

/**
 * Resolve a destination against the running origin AND any the host declared.
 *
 * Prefer this over calling `resolveDestination` directly from a view: the bare
 * function cannot see the host's origins, so it reports atom63.io's own cards
 * as external on localhost and on preview deployments.
 */
export function useWidgetDestination(href: string | undefined): WidgetDestination | null {
  const { origins } = useContext(WidgetLinkContext)
  return useMemo(() => resolveDestination(href, origins), [href, origins])
}
