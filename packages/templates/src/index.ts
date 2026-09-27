/*
 * Templates are starting points to copy into a product (`atom63 template copy`,
 * later), not components to import. The workspace example app imports them from
 * here to prove they compose.
 */
export {
  DataTableSection,
  type DataTableColumn,
  type DataTableEmpty,
  type DataTableSectionProps,
} from './blocks/data-table-section/data-table-section'
export {
  FilterBar,
  type FilterBarOption,
  type FilterBarProps,
} from './blocks/filter-bar/filter-bar'
export { PageHeader, type PageHeaderProps } from './blocks/page-header/page-header'
export { ListPage, type ListPageProps } from './pages/list-page/list-page'
