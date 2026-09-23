# Forms and inputs

Use native SwiftUI controls for platform behavior and Atom63UI patterns where
shared field styling or validation semantics are required.

## Shared field styling

`AtomTextField` and `AtomTextEditor` provide labels, focus/error borders,
supporting text, Dynamic Type, and accessible error announcements.

Use `AtomFormField` when the screen owns focus progression:

```swift
enum Field: Hashable {
  case name
  case email
}

@FocusState private var focusedField: Field?

AtomFormField(
  "Name",
  errorMessage: nameError,
  isFocused: focusedField == .name
) {
  TextField("Name", text: $name)
    .submitLabel(.next)
    .focused($focusedField, equals: .name)
    .onSubmit {
      focusedField = .email
    }
}
```

The nested control must provide its own accessibility label. The visible
`AtomFormField` label is hidden from accessibility to avoid duplicate
announcements.

## Native controls

Use `Picker`, `DatePicker`, `Slider`, `Stepper`, and system submit labels
directly. Do not wrap them only to apply an Atom63 name. Place shared form-level
feedback in `AtomFormMessage` and use `.error` or `.success` tone as appropriate.

The Forms and Inputs screen in `examples/ios-demo` exercises:

- validation summary and field-level errors
- keyboard Next/Done focus progression
- multiline input with a character limit
- menu and segmented pickers
- date, slider, and stepper controls
- adaptive toggle layout
- loading and success feedback

Run `pnpm --filter @atom63/ui-ios test:ui` to exercise navigation and invalid
form submission on an iPhone Simulator.
