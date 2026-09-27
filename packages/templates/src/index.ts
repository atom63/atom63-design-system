/*
 * Templates are starting points to copy into a product (`atom63 template copy`,
 * later), not components to import. The workspace example app imports them from
 * here to prove they compose.
 */
export {
  ActivityList,
  type ActivityItem,
  type ActivityListProps,
} from './blocks/activity-list/activity-list'
export { AppShell, type AppShellNavItem, type AppShellProps } from './blocks/app-shell/app-shell'
export { AuthCard, type AuthCardProps } from './blocks/auth-card/auth-card'
export {
  DataTableSection,
  type DataTableColumn,
  type DataTableEmpty,
  type DataTableSectionProps,
} from './blocks/data-table-section/data-table-section'
export {
  DetailPanel,
  type DetailField,
  type DetailPanelProps,
} from './blocks/detail-panel/detail-panel'
export { EmptyState, type EmptyStateProps } from './blocks/empty-state/empty-state'
export {
  FilterBar,
  type FilterBarOption,
  type FilterBarProps,
} from './blocks/filter-bar/filter-bar'
export { PageHeader, type PageHeaderProps } from './blocks/page-header/page-header'
export {
  SettingsSection,
  SettingsSwitchRow,
  type SettingsSectionProps,
  type SettingsSwitchRowProps,
} from './blocks/settings-section/settings-section'
export { StatRow, type Stat, type StatRowProps } from './blocks/stat-row/stat-row'
export { DashboardPage } from './pages/dashboard-page/dashboard-page'
export { ListPage, type ListPageProps } from './pages/list-page/list-page'
export { OnboardingPage } from './pages/onboarding-page/onboarding-page'
export { SettingsPage } from './pages/settings-page/settings-page'
export { SignInPage, type SignInPageProps } from './pages/sign-in-page/sign-in-page'
export { templateCatalog, type TemplateEntry } from './catalog'
