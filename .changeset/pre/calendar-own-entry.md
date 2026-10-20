---
'@atom63/ui-react': minor
---

**Breaking:** `Calendar` and `CalendarProps` moved from the root entry to their own entry, `@atom63/ui-react/calendar`. The root entry no longer loads `react-day-picker`, so importing anything from `@atom63/ui-react` in Node (tests and SSR) no longer pays for it: about 0.8 s of the 1.1 s root import. Browser bundles are unchanged.

Migration: `import { Calendar } from '@atom63/ui-react/calendar'`
