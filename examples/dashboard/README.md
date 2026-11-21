# Atom63 dashboard example

Tidepool, a small subscription-analytics app built only from Atom63 components, page-template
blocks and tokens. It is the design system's analytics-dashboard use case: a reference for what a
data-dense product looks like on the system, kept green in CI.

- **Overview** (`/`): KPI stats, an MRR chart, MRR movement, plan mix, top accounts and activity.
- **Accounts** (`/accounts`): search and status filter, sortable columns, pagination, a detail
  sheet (`?account=<id>`) and a create and edit form with validation in a dialog.
- **Settings** (`/settings`): notifications, the billing connection and the colour mode.

The sample data lives in `src/data.ts`; there is no backend. The brand is the built-in violet
ramp (`data-a63-brand="b5"`) on the Modern theme, set on `<html>` in `index.html`.

## Data states

Every data page has a loading, an empty and an error state. Pick one in the top bar, or open a
page with `?state=loading`, `?state=empty` or `?state=error`.

## Charts

The system has chart colour tokens (`--a63-chart-1` to `--a63-chart-5`) but no chart component,
so `src/components/charts.tsx` draws small SVG charts with those tokens, keeps the labels in HTML
and gives each chart a visually hidden data table.

## Run and check

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter atom63-dashboard-example dev
pnpm --filter atom63-dashboard-example typecheck
pnpm --filter atom63-dashboard-example build
pnpm check:example:dashboard   # axe, one h1, no overflow at 390px, light and dark
pnpm check:craft               # no literal colours or physical directions (covers this app)
```
