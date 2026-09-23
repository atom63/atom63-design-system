---
"@atom63/ui-react": patch
---

`FeedbackState` icons are typed again. `icon` on the state and on each action accepts a built-in name (`alertTriangle`, `clock`, `fileSearch`, `inbox`, `refreshCw`, `searchX`, `spinner`, `wifiOff`) or any React element. Since the design system stopped depending on `@atom63/icons`, the name was typed as `string`, so names outside the new lucide map, such as `refreshCw` on retry actions, rendered no icon without a type error. Unknown names are now a type error and still render no icon at runtime. Adds the `FeedbackStateIcon` and `FeedbackStateIconName` types.
