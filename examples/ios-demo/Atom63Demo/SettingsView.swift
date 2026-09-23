import Atom63UI
import SwiftUI

struct SettingsView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  @State private var displayName = "You Zhang"
  @State private var email = "you@atom63.dev"
  @State private var notificationsEnabled = true
  @State private var productUpdatesEnabled = false
  @State private var isSaving = false
  @State private var didSave = false
  private let onSignOut: () -> Void

  init(onSignOut: @escaping () -> Void = {}) {
    self.onSignOut = onSignOut
  }

  var body: some View {
    NavigationStack {
      Form {
        Section("Profile") {
          AtomTextField(
            "Display name",
            text: $displayName,
            prompt: "Your name"
          )
          .textContentType(.name)

          AtomTextField(
            "Email",
            text: $email,
            prompt: "you@example.com",
            errorMessage: email.contains("@") ? nil : "Enter a valid email address"
          )
          .textContentType(.emailAddress)
          .textInputAutocapitalization(.never)
          .keyboardType(.emailAddress)
        }

        Section("Notifications") {
          AtomToggle(
            "Activity notifications",
            isOn: $notificationsEnabled,
            description: "Receive useful updates about your account."
          )

          AtomToggle(
            "Product updates",
            isOn: $productUpdatesEnabled,
            description: "Occasional release notes and design-system news."
          )
        }

        Section("Coverage") {
          NavigationLink("Forms and inputs") {
            FormCoverageView()
          }
        }

        Section {
          SaveSection(
            isSaving: isSaving,
            didSave: didSave,
            save: save
          )
          .keyboardShortcut("s", modifiers: .command)
        }

        Section {
          Button("Sign out", role: .destructive, action: onSignOut)
        }
      }
      .formStyle(.grouped)
      .atomFormPresentation(.grouped)
      .scrollDismissesKeyboard(.interactively)
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .scrollContentBackground(.hidden)
      .background(theme.colors.surfacePage.resolve(for: colorScheme))
      .navigationTitle("Profile settings")
      .navigationBarTitleDisplayMode(dynamicTypeSize.isAccessibilitySize ? .inline : .large)
    }
  }

  private func save() {
    guard !isSaving else { return }
    isSaving = true
    didSave = false

    Task {
      try? await Task.sleep(for: .milliseconds(700))
      isSaving = false
      didSave = true
    }
  }
}

private struct SaveSection: View {
  let isSaving: Bool
  let didSave: Bool
  let save: () -> Void

  var body: some View {
    VStack(spacing: AtomTokens.Space.x3) {
      AtomButton(
        "Save changes",
        variant: .primary,
        size: .large,
        fullWidth: true,
        isLoading: isSaving,
        action: save
      )

      if didSave {
        Label("Changes saved", systemImage: "checkmark.circle.fill")
          .font(.footnote)
          .foregroundStyle(.secondary)
          .transition(.opacity)
          .accessibilityAddTraits(.isStaticText)
      }
    }
    .animation(.easeOut(duration: AtomTokens.Motion.standard), value: didSave)
  }
}
