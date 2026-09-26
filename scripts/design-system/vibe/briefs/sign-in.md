# Sign in

A sign-in page for a project management tool called Tally.

- A centered card with the product name, a short welcome line, an email field, a password field
  and a "Sign in" button.
- A "Forgot password?" link next to the password field and a "Create an account" link below the
  card.
- A "Keep me signed in" checkbox.
- Submitting with an empty or malformed email shows an error on that field. Any password other
  than `correct-horse` shows "Email or password is incorrect" above the button.
- While the request is in flight (fake it with a one-second delay), the button shows that it is
  working and cannot be pressed twice.
