---
'@atom63/cli': patch
---

`atom63 copy` and `atom63 template` now include the modules a template imports from outside its own folder, so `atom63 copy dashboard-page` also writes `pages/list-page/list-page-data.ts` and the copied page compiles.
