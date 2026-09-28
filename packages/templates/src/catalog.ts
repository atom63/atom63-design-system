/*
 * Every template's metadata, pages first. The docs gallery and (later) the
 * agent index read this list; check:templates fails when a template is
 * missing from it.
 */
import { template as dashboardPage } from './pages/dashboard-page/dashboard-page'
import { template as listPage } from './pages/list-page/list-page'
import { template as onboardingPage } from './pages/onboarding-page/onboarding-page'
import { template as settingsPage } from './pages/settings-page/settings-page'
import { template as signInPage } from './pages/sign-in-page/sign-in-page'
import { template as activityList } from './blocks/activity-list/activity-list'
import { template as appShell } from './blocks/app-shell/app-shell'
import { template as authCard } from './blocks/auth-card/auth-card'
import { template as dataTableSection } from './blocks/data-table-section/data-table-section'
import { template as detailPanel } from './blocks/detail-panel/detail-panel'
import { template as emptyState } from './blocks/empty-state/empty-state'
import { template as filterBar } from './blocks/filter-bar/filter-bar'
import { template as gettingStartedChecklist } from './blocks/getting-started-checklist/getting-started-checklist'
import { template as pageHeader } from './blocks/page-header/page-header'
import { template as settingsSection } from './blocks/settings-section/settings-section'
import { template as statRow } from './blocks/stat-row/stat-row'

export interface TemplateEntry {
  category: string
  description: string
  id: string
  kind: 'block' | 'page'
  readiness: 'draft' | 'ready'
  /** The Storybook story id of the template's Desktop story. */
  storyId: string
  tags: readonly string[]
  title: string
}

const storyId = (kind: 'block' | 'page', title: string) =>
  `templates-${kind === 'page' ? 'pages' : 'blocks'}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--desktop`

export const templateCatalog: readonly TemplateEntry[] = [
  dashboardPage,
  listPage,
  onboardingPage,
  settingsPage,
  signInPage,
  activityList,
  appShell,
  authCard,
  dataTableSection,
  detailPanel,
  emptyState,
  filterBar,
  gettingStartedChecklist,
  pageHeader,
  settingsSection,
  statRow,
].map(entry => ({ ...entry, storyId: storyId(entry.kind, entry.title) }))
