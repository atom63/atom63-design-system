# Notification settings

A settings page where a signed-in user of a team chat app decides which notifications they get.

- Three groups: "Messages" (direct messages, mentions, replies in threads you follow), "Channels"
  (new channels, channel invites) and "Account" (security alerts, product news).
- Each notification has a short description and a switch per delivery channel: email, push and
  in-app.
- Security alerts by email cannot be turned off; say why.
- A "Quiet hours" section with a switch and a start and end time.
- Changes are not saved until the user presses "Save changes". The button is disabled until
  something changes and shows progress while saving (fake it with a one-second delay), and a short
  confirmation appears when the save succeeds. A "Discard" action resets the form.
