---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Add `--a63-border-input`, the border for form controls a person has to find. It reaches WCAG 1.4.11's 3:1 against the page, the panel and the field fill on every theme, brand, mode and surface (surface step 10 in light mode, step 9 in dark mode, and phosphor values in the terminal theme). Input, Textarea, Select, InputOTP, Autocomplete, Checkbox, Radio, Switch and the Slider thumb now draw their borders with it; decorative edges keep `--a63-border-control`. The shadcn `input` role and the reverse shadcn bridge map to the new token.
