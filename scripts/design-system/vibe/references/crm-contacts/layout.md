# Relay contacts layout

The target is a composite derived from CRM and contact-workspace patterns in Quo, Unify, Square and
Calendly. It does not reproduce any one product.

## Desktop target

- Canvas: 1440 × 960.
- Product sidebar: about 216 px, full height, dark enough to read as a separate navigation region.
- Main workspace: fills the middle region. Keep a 28 to 32 px content inset.
- Details panel: about 340 px on the inline end, full height, separated from the table by one border.
- Header and toolbar: compact. The table should begin near the first quarter of the canvas rather
  than below a large hero region.
- Table rows: dense enough to show at least ten contacts at 960 px height.
- Import message: a floating status surface above the bottom edge. It must not change table geometry.

## Alignment and hierarchy

- The heading, search field, saved filters and table share one start edge.
- Search takes the remaining toolbar width. Filter, Columns and Add contact keep compact widths.
- Checkbox, avatar, name and company form one scan path. Last activity and status remain easy to
  compare down the column.
- The selected row uses one quiet background change. The Add contact action is the only primary
  action in the main region.
- The details panel gives the contact name first, then contact methods, tags and recent activity.

## Responsive priorities

- At 1024 px, the details panel may overlay the table.
- At 768 px, collapse the product sidebar and keep the toolbar on two lines.
- At 390 px, render contacts as compact rows or cards. Keep name, company and status visible without
  opening details. Search and saved filters remain above the list.
- Never shrink the desktop table until its text becomes unreadable. Move information into details or
  disclosure instead.

## Research references

- Quo: https://mobbin.com/screens/bfd73254-7838-4609-a508-18f823d248b9
- Unify: https://mobbin.com/screens/67175309-e399-4414-9467-ad79bc4c7037
- Square: https://mobbin.com/screens/aa3675a7-aeda-4249-8c7d-e43062c9135e
- Calendly: https://mobbin.com/screens/a6435bf5-8a84-4263-9ba5-fa6377fc360a
