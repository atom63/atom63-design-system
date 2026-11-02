# Contacts workspace

The contacts workspace of a small client-relationship product called Relay.

- A persistent product sidebar with Contacts selected and links for Search, Activity, Analytics and
  Settings.
- The main area has a Contacts heading, the total count, an Add contact action, search, saved filter
  chips, a Filter action and a Columns action.
- Show 12 realistic contacts in a compact selectable table. Columns are Name, Company, Role, Last
  activity, Owner and Status. Names include an avatar; status uses text as well as color.
- Selecting a contact opens a details panel on the inline end without losing the table. It shows the
  contact's identity, company, email, phone, owner, tags, recent activity and Edit and Email actions.
- An import completion message appears over the bottom of the workspace and can be dismissed.
- Support `?state=default`, `?state=selected`, `?state=empty`, `?state=importing` and
  `?state=complete`. With no state parameter, render the complete state from the reference target.
- The empty state keeps the active filters visible, says no contacts match and offers Clear filters.
  Importing shows progress without replacing the table. Complete shows the dismissable import
  message.
- At narrow widths, preserve search, filters, names, companies and status. Move secondary fields
  into disclosure and show contact details as a separate overlay instead of squeezing three columns.
- Every state must work with keyboard navigation and visible focus, and the project must expose no
  horizontal page overflow at 390 pixels wide.
