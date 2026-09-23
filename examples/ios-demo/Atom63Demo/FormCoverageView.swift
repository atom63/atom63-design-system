import Atom63UI
import SwiftUI

private enum ProjectKind: String, CaseIterable, Identifiable {
  case app = "App"
  case designSystem = "Design system"
  case prototype = "Prototype"

  var id: Self { self }
}

private enum ProjectVisibility: String, CaseIterable, Identifiable {
  case privateProject = "Private"
  case shared = "Shared"

  var id: Self { self }
}

private enum FormFocus: Hashable {
  case name
  case email
}

struct FormCoverageView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  @State private var name = ""
  @State private var ownerEmail = ""
  @State private var brief = ""
  @State private var kind: ProjectKind = .app
  @State private var visibility: ProjectVisibility = .privateProject
  @State private var startDate = Date.now
  @State private var priority = 50.0
  @State private var teamSize = 3
  @State private var notificationsEnabled = true
  @State private var didAttemptSubmit = false
  @State private var didSave = false
  @State private var isSaving = false
  @FocusState private var focusedField: FormFocus?

  var body: some View {
    Form {
      Section {
        AtomFormMessage(
          "Native controls, shared semantics",
          message:
            "Pickers, dates, sliders, and steppers stay native. Atom63 owns field styling and validation feedback."
        )
      }

      Section("Project details") {
        AtomFormField(
          "Project name",
          errorMessage: visibleNameError,
          isFocused: focusedField == .name
        ) {
          TextField(
            "Project name",
            text: $name,
            prompt: Text("Mobile workspace")
              .foregroundColor(theme.colors.textSecondary.resolve(for: colorScheme))
          )
            .textContentType(.organizationName)
            .submitLabel(.next)
            .focused($focusedField, equals: .name)
            .accessibilityLabel("Project name")
            .onSubmit {
              focusedField = .email
            }
        }

        AtomFormField(
          "Owner email",
          errorMessage: visibleEmailError,
          isFocused: focusedField == .email
        ) {
          TextField(
            "Owner email",
            text: $ownerEmail,
            prompt: Text("you@example.com")
              .foregroundColor(theme.colors.textSecondary.resolve(for: colorScheme))
          )
            .textContentType(.emailAddress)
            .textInputAutocapitalization(.never)
            .keyboardType(.emailAddress)
            .submitLabel(.done)
            .focused($focusedField, equals: .email)
            .accessibilityLabel("Owner email")
            .onSubmit {
              focusedField = nil
            }
        }

        AtomTextEditor(
          "Project brief",
          text: $brief,
          prompt: "Describe the outcome, audience, and constraints.",
          supportingText: "\(brief.count) of 240 characters",
          errorMessage: visibleBriefError
        )
        .onChange(of: brief) { _, value in
          if value.count > 240 {
            brief = String(value.prefix(240))
          }
        }
      }

      Section("Configuration") {
        Picker("Project type", selection: $kind) {
          ForEach(ProjectKind.allCases) { kind in
            Text(kind.rawValue).tag(kind)
          }
        }

        Picker("Visibility", selection: $visibility) {
          ForEach(ProjectVisibility.allCases) { visibility in
            Text(visibility.rawValue).tag(visibility)
          }
        }
        .pickerStyle(.segmented)
        .accessibilityIdentifier("visibility-segmented-control")

        DatePicker(
          "Start date",
          selection: $startDate,
          displayedComponents: .date
        )

        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          LabeledContent("Priority", value: "\(Int(priority)) percent")

          Slider(value: $priority, in: 0...100, step: 10)
            .accessibilityLabel("Priority")
            .accessibilityValue("\(Int(priority)) percent")
            .accessibilityIdentifier("priority-slider")
        }

        Stepper("Team size: \(teamSize)", value: $teamSize, in: 1...20)

        AtomToggle(
          "Project notifications",
          isOn: $notificationsEnabled,
          description: "Notify collaborators when this project changes."
        )
      }

      if validationErrorCount > 0, didAttemptSubmit {
        Section {
          AtomFormMessage(
            "Review \(validationErrorCount) field\(validationErrorCount == 1 ? "" : "s")",
            message: "Correct the highlighted information before saving.",
            tone: .error
          )
        }
      } else if didSave {
        Section {
          AtomFormMessage(
            "Project saved",
            message: "The complete form passed validation.",
            tone: .success
          )
        }
      }

      Section {
        AtomButton(
          "Save project",
          variant: .primary,
          size: .large,
          fullWidth: true,
          isLoading: isSaving,
          action: submit
        )
        .keyboardShortcut("s", modifiers: .command)
      }
    }
    .formStyle(.grouped)
    .atomFormPresentation(.grouped)
    .scrollDismissesKeyboard(.interactively)
    .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
    .scrollContentBackground(.hidden)
    .background(theme.colors.surfacePage.resolve(for: colorScheme))
    .navigationTitle("Forms and inputs")
    .navigationBarTitleDisplayMode(dynamicTypeSize.isAccessibilitySize ? .inline : .large)
  }

  private var visibleNameError: String? {
    didAttemptSubmit && trimmedName.isEmpty ? "Enter a project name" : nil
  }

  private var visibleEmailError: String? {
    didAttemptSubmit && !hasValidEmail ? "Enter a valid email address" : nil
  }

  private var visibleBriefError: String? {
    didAttemptSubmit && trimmedBrief.count < 20
      ? "Write at least 20 characters" : nil
  }

  private var trimmedName: String {
    name.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private var trimmedBrief: String {
    brief.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private var hasValidEmail: Bool {
    let parts = ownerEmail.split(separator: "@", omittingEmptySubsequences: false)
    return parts.count == 2 && !parts[0].isEmpty && parts[1].contains(".")
  }

  private var validationErrorCount: Int {
    [
      trimmedName.isEmpty,
      !hasValidEmail,
      trimmedBrief.count < 20,
    ].reduce(0) { count, hasError in count + (hasError ? 1 : 0) }
  }

  private func submit() {
    guard !isSaving else { return }
    didAttemptSubmit = true
    didSave = false

    guard validationErrorCount == 0 else {
      focusedField = trimmedName.isEmpty ? .name : hasValidEmail ? nil : .email
      return
    }

    focusedField = nil
    isSaving = true

    Task {
      do {
        try await Task.sleep(for: .milliseconds(700))
      } catch is CancellationError {
        isSaving = false
        return
      } catch {
        isSaving = false
        assertionFailure("Unexpected form save failure: \(error)")
        return
      }

      isSaving = false
      didSave = true
    }
  }
}
