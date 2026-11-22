---
'@atom63/ui-react': minor
'@atom63/ui-foundation': minor
---

Add sortable table heads: `Table` takes a controlled `sort` and `onSortChange`, and a `TableHead` with a `sortKey` renders a sort button with a direction icon (replaceable through `sortIcon`) and carries `aria-sort` while its column is sorted. `PaginationLink`, `PaginationPrevious` and `PaginationNext` take `render` (such as a router link) and `disabled`, which drops the href and click handler, leaves the tab order and sets `aria-disabled`. Pagination's default name is now "Pagination". Autocomplete's clear button sits beside the trigger instead of on top of it. `FeedbackState` renders its title as a real `h1`–`h6`. `FormControl` lists the description id in `aria-describedby` only while a `FormDescription` renders. The table contract adds the `table-sort-button` slot and the `sort-ascending` and `sort-descending` states; the pagination contract adds the `disabled` state.
