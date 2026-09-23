import Atom63UI
import SwiftUI

struct CatalogShowcase: View {
  let item: CatalogItem

  var body: some View {
    switch item {
    case .tokens:
      TokenShowcase()
    case .theme:
      ThemeShowcase()
    case .button:
      ButtonShowcase()
    case .iconButton:
      IconButtonShowcase()
    case .actionBar:
      ActionBarShowcase()
    case .menu:
      MenuShowcase()
    case .sheet:
      SheetShowcase()
    case .confirmationDialog:
      ConfirmationDialogShowcase()
    case .destinationLink:
      DestinationLinkShowcase()
    case .tabs:
      TabsShowcase()
    case .formField:
      FormFieldShowcase()
    case .textField:
      TextFieldShowcase()
    case .textEditor:
      TextEditorShowcase()
    case .toggle:
      ToggleShowcase()
    case .picker:
      PickerShowcase()
    case .search:
      SearchShowcase()
    case .segmentedControl:
      SegmentedControlShowcase()
    case .radioGroup:
      RadioGroupShowcase()
    case .slider:
      SliderShowcase()
    case .datePicker:
      DatePickerShowcase()
    case .formMessage:
      FormMessageShowcase()
    case .card:
      CardShowcase()
    case .listRow:
      ListRowShowcase()
    case .valueRow:
      ValueRowShowcase()
    case .selectionRow:
      SelectionRowShowcase()
    case .disclosureGroup:
      DisclosureGroupShowcase()
    case .sectionHeader:
      SectionHeaderShowcase()
    case .chip:
      ChipShowcase()
    case .badge:
      BadgeShowcase()
    case .avatar:
      AvatarShowcase()
    case .asyncImage:
      AsyncImageShowcase()
    case .contentState:
      ContentStateShowcase()
    case .notice:
      NoticeShowcase()
    case .progress:
      ProgressShowcase()
    case .skeleton:
      SkeletonShowcase()
    case .syncStatus:
      SyncStatusShowcase()
    case .pagination:
      PaginationShowcase()
    case .toast:
      ToastShowcase()
    }
  }
}

private struct ShowcaseSection<Content: View>: View {
  let title: String
  let subtitle: String?
  @ViewBuilder let content: Content

  init(
    _ title: String,
    subtitle: String? = nil,
    @ViewBuilder content: () -> Content
  ) {
    self.title = title
    self.subtitle = subtitle
    self.content = content()
  }

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      AtomSectionHeader(title, subtitle: subtitle)
      content
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

private struct ShowcaseStateLabel: View {
  let title: String

  init(_ title: String) {
    self.title = title
  }

  var body: some View {
    Text(title)
      .font(.caption.monospaced())
      .foregroundStyle(.secondary)
      .accessibilityLabel("State: \(title)")
  }
}

private struct TokenColorSample: Identifiable {
  let name: String
  let color: AtomDynamicColor

  var id: String { name }
}

private struct TokenShowcase: View {
  private let colors = [
    TokenColorSample(name: "surfacePage", color: AtomTokens.Color.surfacePage),
    TokenColorSample(name: "surfacePanel", color: AtomTokens.Color.surfacePanel),
    TokenColorSample(name: "surfaceMuted", color: AtomTokens.Color.surfaceMuted),
    TokenColorSample(name: "textPrimary", color: AtomTokens.Color.textPrimary),
    TokenColorSample(name: "textSecondary", color: AtomTokens.Color.textSecondary),
    TokenColorSample(name: "actionPrimary", color: AtomTokens.Color.actionPrimary),
    TokenColorSample(name: "actionDanger", color: AtomTokens.Color.actionDanger),
    TokenColorSample(name: "statusSuccess", color: AtomTokens.Color.statusSuccess),
    TokenColorSample(name: "statusWarning", color: AtomTokens.Color.statusWarning),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x6) {
      ShowcaseSection("Semantic colors") {
        LazyVGrid(
          columns: [GridItem(.adaptive(minimum: 132), spacing: AtomTokens.Space.x3)],
          spacing: AtomTokens.Space.x3
        ) {
          ForEach(colors) { sample in
            TokenColorSwatch(sample: sample)
          }
        }
      }

      ShowcaseSection("Spacing", subtitle: "4-point foundation scale") {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          TokenMeasure(name: "x1", value: AtomTokens.Space.x1)
          TokenMeasure(name: "x2", value: AtomTokens.Space.x2)
          TokenMeasure(name: "x3", value: AtomTokens.Space.x3)
          TokenMeasure(name: "x4", value: AtomTokens.Space.x4)
          TokenMeasure(name: "x5", value: AtomTokens.Space.x5)
          TokenMeasure(name: "x6", value: AtomTokens.Space.x6)
        }
      }

      ShowcaseSection("Radius") {
        HStack(alignment: .bottom, spacing: AtomTokens.Space.x3) {
          RadiusSample(name: "small", radius: AtomTokens.Radius.small)
          RadiusSample(name: "medium", radius: AtomTokens.Radius.medium)
          RadiusSample(name: "large", radius: AtomTokens.Radius.large)
          RadiusSample(name: "xl", radius: AtomTokens.Radius.extraLarge)
        }
      }

      ShowcaseSection("Typography") {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
          Text("Large title").font(.largeTitle)
          Text("Title 2").font(.title2)
          Text("Headline").font(.headline)
          Text("Body text scales with Dynamic Type.").font(.body)
          Text("Supporting footnote").font(.footnote).foregroundStyle(.secondary)
          Text("MONOSPACED LABEL").font(.caption.monospaced())
        }
      }
    }
  }
}

private struct TokenColorSwatch: View {
  @Environment(\.colorScheme) private var colorScheme
  let sample: TokenColorSample

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
        .fill(sample.color.resolve(for: colorScheme))
        .frame(height: 64)
        .overlay {
          RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
            .strokeBorder(.primary.opacity(0.12))
        }
      Text(sample.name)
        .font(.caption.monospaced())
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
  }
}

private struct TokenMeasure: View {
  let name: String
  let value: CGFloat

  var body: some View {
    HStack(spacing: AtomTokens.Space.x3) {
      Text(name)
        .font(.caption.monospaced())
        .frame(width: 28, alignment: .leading)
      Capsule()
        .fill(.tint)
        .frame(width: value * 4, height: 8)
      Text(value, format: .number)
        .font(.caption.monospacedDigit())
        .foregroundStyle(.secondary)
    }
  }
}

private struct RadiusSample: View {
  let name: String
  let radius: CGFloat

  var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      Rectangle()
        .fill(.tint.opacity(0.16))
        .frame(minWidth: 52, minHeight: 52)
        .clipShape(.rect(cornerRadius: radius))
      Text(name)
        .font(.caption2.monospaced())
    }
  }
}

private struct ThemeShowcase: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      ShowcaseSection("Surface hierarchy") {
        VStack(spacing: 0) {
          ThemeSurface(
            name: "Page",
            color: theme.colors.surfacePage.resolve(for: colorScheme)
          )
          ThemeSurface(
            name: "Panel",
            color: theme.colors.surfacePanel.resolve(for: colorScheme)
          )
          ThemeSurface(
            name: "Muted",
            color: theme.colors.surfaceMuted.resolve(for: colorScheme)
          )
          ThemeSurface(
            name: "Control",
            color: theme.colors.surfaceControl.resolve(for: colorScheme)
          )
        }
        .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
      }

      ShowcaseSection("Semantic actions") {
        HStack(spacing: AtomTokens.Space.x3) {
          ThemeColorDot(
            name: "Primary",
            color: theme.colors.actionPrimary.resolve(for: colorScheme)
          )
          ThemeColorDot(
            name: "Success",
            color: theme.colors.statusSuccess.resolve(for: colorScheme)
          )
          ThemeColorDot(
            name: "Warning",
            color: theme.colors.statusWarning.resolve(for: colorScheme)
          )
          ThemeColorDot(
            name: "Danger",
            color: theme.colors.actionDanger.resolve(for: colorScheme)
          )
        }
      }
    }
  }
}

private struct ThemeSurface: View {
  let name: String
  let color: Color

  var body: some View {
    Text(name)
      .font(.subheadline.weight(.medium))
      .padding(AtomTokens.Space.x4)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(color)
  }
}

private struct ThemeColorDot: View {
  let name: String
  let color: Color

  var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      Circle()
        .fill(color)
        .frame(width: 44, height: 44)
      Text(name)
        .font(.caption2)
    }
    .frame(maxWidth: .infinity)
  }
}

private enum ShowcaseButtonVariant: String, CaseIterable, Identifiable {
  case primary
  case neutral
  case secondary
  case destructive
  case outline
  case ghost

  var id: Self { self }

  var value: AtomButtonVariant {
    switch self {
    case .primary: .primary
    case .neutral: .neutral
    case .secondary: .secondary
    case .destructive: .destructive
    case .outline: .outline
    case .ghost: .ghost
    }
  }

  var title: String { rawValue.capitalized }
}

private struct ButtonShowcase: View {
  @State private var lastAction = "Choose an action"

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x5) {
      ShowcaseSection("Variants") {
        VStack(spacing: AtomTokens.Space.x3) {
          ForEach(ShowcaseButtonVariant.allCases) { variant in
            AtomButton(
              variant.title,
              variant: variant.value,
              fullWidth: true
            ) {
              lastAction = "\(variant.title) pressed"
            }
          }
        }
      }

      ShowcaseSection("Sizes and states") {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
          AtomButton("Compact", variant: .outline, size: .compact) {}
          AtomButton("Regular", variant: .primary) {}
          AtomButton("Large", variant: .neutral, size: .large) {}
          AtomButton("Loading", variant: .primary, isLoading: true) {}
          AtomButton("Disabled", variant: .outline) {}
            .disabled(true)
        }
      }

      Text(lastAction)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

private struct IconButtonShowcase: View {
  @State private var actionCount = 0

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      HStack(spacing: AtomTokens.Space.x3) {
        AtomIconButton("Add", systemImage: "plus", variant: .primary) {
          actionCount += 1
        }
        AtomIconButton("Favorite", systemImage: "star", variant: .outline) {
          actionCount += 1
        }
        AtomIconButton("More actions", systemImage: "ellipsis") {
          actionCount += 1
        }
        AtomIconButton(
          "Loading",
          systemImage: "arrow.clockwise",
          variant: .neutral,
          isLoading: true
        ) {}
      }
      Text("Actions: \(actionCount)")
        .font(.footnote.monospacedDigit())
        .foregroundStyle(.secondary)
    }
  }
}

private struct ActionBarShowcase: View {
  @State private var status = "No action yet"

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      AtomActionBar(
        primaryTitle: "Publish",
        primaryAction: { status = "Published" },
        secondaryTitle: "Save draft",
        secondaryAction: { status = "Draft saved" }
      )
      Text(status)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

private struct MenuShowcase: View {
  @State private var showsDetails = true
  @State private var lastAction = "No action selected"

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      Menu("Project actions", systemImage: "ellipsis.circle") {
        Button("Duplicate", systemImage: "plus.square.on.square") {
          lastAction = "Duplicate selected"
        }
        Toggle("Show details", isOn: $showsDetails)
        Button("Unavailable action") {}
          .disabled(true)
        Divider()
        Button("Delete", systemImage: "trash", role: .destructive) {
          lastAction = "Delete selected"
        }
      }

      Text(lastAction)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

private struct SheetShowcase: View {
  @State private var isPresented = false

  var body: some View {
    AtomButton("Open project sheet", variant: .primary) {
      isPresented = true
    }
    .sheet(isPresented: $isPresented) {
      NavigationStack {
        Form {
          Section("Details") {
            LabeledContent("Project", value: "Mobile design system")
            LabeledContent("Status", value: "Draft")
          }
        }
        .navigationTitle("Project details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") {
              isPresented = false
            }
          }
        }
      }
      .presentationDetents([.medium, .large])
    }
  }
}

private struct ConfirmationDialogShowcase: View {
  @State private var isPresented = false
  @State private var outcome = "No decision"

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      AtomButton("Delete project", variant: .destructive) {
        isPresented = true
      }
      Text(outcome)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .alert("Delete project?", isPresented: $isPresented) {
      Button("Delete", role: .destructive) {
        outcome = "Deletion confirmed"
      }
      Button("Cancel", role: .cancel) {
        outcome = "Deletion cancelled"
      }
    } message: {
      Text("This action cannot be undone.")
    }
  }
}

private struct DestinationLinkShowcase: View {
  private var websiteURL: URL {
    guard let url = URL(string: "https://atom63.io") else {
      preconditionFailure("The Atom63 website URL must remain valid")
    }
    return url
  }

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      NavigationLink {
        Text("Internal destination")
          .navigationTitle("Project")
      } label: {
        Label("Open internal project", systemImage: "arrow.right")
      }

      Link(destination: websiteURL) {
        Label("Open Atom63 website", systemImage: "arrow.up.right")
      }
      .accessibilityHint("Opens outside the app")
    }
  }
}

private enum TabsShowcaseSelection: String {
  case overview
  case activity
}

private struct TabsShowcase: View {
  @State private var selection: TabsShowcaseSelection = .overview

  var body: some View {
    TabView(selection: $selection) {
      ContentUnavailableView(
        "Overview",
        systemImage: "rectangle.grid.1x2",
        description: Text("Project summary and current status.")
      )
      .tag(TabsShowcaseSelection.overview)

      ContentUnavailableView(
        "Activity",
        systemImage: "clock.arrow.circlepath",
        description: Text("Recent project changes.")
      )
      .tag(TabsShowcaseSelection.activity)
    }
    .tabViewStyle(.page(indexDisplayMode: .always))
    .frame(minHeight: 220)
    .accessibilityIdentifier("catalog-tabs")
  }
}

private struct FormFieldShowcase: View {
  @State private var value = ""

  var body: some View {
    VStack(spacing: AtomTokens.Space.x4) {
      AtomFormField("Project code", supportingText: "Use six letters or digits.") {
        TextField("Project code", text: $value)
          .textInputAutocapitalization(.characters)
      }

      AtomFormField(
        "Project code",
        errorMessage: "Enter a six-character project code."
      ) {
        Text("A63")
          .foregroundStyle(.secondary)
      }

      GroupBox("Grouped Form context") {
        AtomFormField("Project code", supportingText: "Container owns the row surface.") {
          TextField("Project code", text: $value)
            .textInputAutocapitalization(.characters)
        }
        .atomFormPresentation(.grouped)
      }
    }
  }
}

private struct TextFieldShowcase: View {
  @State private var name = "Atom63"
  @State private var email = "invalid-address"
  @State private var password = "password"

  var body: some View {
    VStack(spacing: AtomTokens.Space.x4) {
      AtomTextField("Project name", text: $name, prompt: "Untitled project")
      AtomTextField(
        "Email",
        text: $email,
        prompt: "you@example.com",
        errorMessage: email.contains("@") ? nil : "Enter a valid email address"
      )
      AtomTextField(
        "Password",
        text: $password,
        prompt: "At least eight characters",
        isSecure: true
      )
    }
  }
}

private struct TextEditorShowcase: View {
  @State private var description = ""

  var body: some View {
    AtomTextEditor(
      "Project description",
      text: $description,
      prompt: "Describe the product outcome",
      supportingText: "\(description.count) characters",
      minHeight: 96
    )
  }
}

private struct ToggleShowcase: View {
  @State private var notificationsEnabled = true
  @State private var productUpdatesEnabled = false

  var body: some View {
    VStack(spacing: AtomTokens.Space.x4) {
      AtomToggle(
        "Activity notifications",
        isOn: $notificationsEnabled,
        description: "Receive important account activity."
      )
      AtomToggle(
        "Product updates",
        isOn: $productUpdatesEnabled,
        description: "Occasional design-system release notes."
      )
    }
  }
}

private enum PickerShowcaseValue: String, CaseIterable, Identifiable {
  case active = "Active"
  case draft = "Draft"
  case archived = "Archived"

  var id: Self { self }
}

private struct PickerShowcase: View {
  @State private var selection: PickerShowcaseValue = .draft

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      Picker("Project status", selection: $selection) {
        ForEach(PickerShowcaseValue.allCases) { value in
          Text(value.rawValue).tag(value)
        }
      }

      LabeledContent("Selected value", value: selection.rawValue)

      Picker("Disabled status", selection: $selection) {
        ForEach(PickerShowcaseValue.allCases) { value in
          Text(value.rawValue).tag(value)
        }
      }
      .disabled(true)
    }
  }
}

private struct SearchShowcase: View {
  @State private var query = ""

  private let results = ["Mobile design system", "Portfolio", "OS63"]

  var body: some View {
    NavigationStack {
      List(results.filter { query.isEmpty || $0.localizedStandardContains(query) }, id: \.self) {
        result in
        Text(result)
      }
      .searchable(text: $query, prompt: "Search projects")
      .navigationTitle("Projects")
    }
    .frame(minHeight: 280)
  }
}

private enum CompactSelection: String, CaseIterable, Identifiable {
  case list = "List"
  case grid = "Grid"
  case timeline = "Timeline"

  var id: Self { self }
}

private struct SegmentedControlShowcase: View {
  @State private var selection: CompactSelection = .list

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      Picker("Layout", selection: $selection) {
        ForEach(CompactSelection.allCases) { value in
          Text(value.rawValue).tag(value)
        }
      }
      .pickerStyle(.segmented)

      LabeledContent("Selected layout", value: selection.rawValue)
    }
  }
}

private struct RadioGroupShowcase: View {
  @State private var selection: CompactSelection = .grid

  var body: some View {
    Picker("Default project view", selection: $selection) {
      ForEach(CompactSelection.allCases) { value in
        Text(value.rawValue).tag(value)
          .disabled(value == .timeline)
      }
    }
    .pickerStyle(.inline)
  }
}

private struct SliderShowcase: View {
  @State private var priority = 50.0

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      LabeledContent("Priority", value: "\(Int(priority)) percent")
      Slider(value: $priority, in: 0...100, step: 10)
        .accessibilityLabel("Priority")
        .accessibilityValue("\(Int(priority)) percent")

      Slider(value: .constant(30), in: 0...100)
        .disabled(true)
        .accessibilityLabel("Disabled priority")
    }
  }
}

private struct DatePickerShowcase: View {
  private let allowedRange = Date(timeIntervalSince1970: 1_735_689_600)...
  @State private var startDate = Date(timeIntervalSince1970: 1_751_328_000)

  var body: some View {
    DatePicker(
      "Start date",
      selection: $startDate,
      in: allowedRange,
      displayedComponents: .date
    )
  }
}

private struct FormMessageShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x3) {
      AtomFormMessage(
        "Helpful context",
        message: "This information is visible to your collaborators."
      )
      AtomFormMessage(
        "Ready to publish",
        message: "All required fields are complete.",
        tone: .success
      )
      AtomFormMessage(
        "Review required",
        message: "Resolve the highlighted fields before continuing.",
        tone: .error
      )
    }
  }
}

private struct CardShowcase: View {
  @State private var outcome = "No card action yet"

  var body: some View {
    VStack(spacing: AtomTokens.Space.x3) {
      AtomCard {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          Text("Mobile design system")
            .font(.headline)
          Text("Native components driven by shared Atom63 intent.")
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }

      AtomCard(action: { outcome = "Profile opened" }) {
        HStack(spacing: AtomTokens.Space.x3) {
          AtomAvatar(name: "You Zhang")
          VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
            Text("You Zhang").font(.headline)
            Text("Design engineer").font(.footnote).foregroundStyle(.secondary)
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .accessibilityIdentifier("catalog-interactive-card")

      Text(outcome)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

private struct ListRowShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      AtomListRow(
        title: "Mobile design system",
        subtitle: "Shared semantics with native SwiftUI implementation.",
        systemImage: "iphone",
        badge: "Active",
        badgeTone: .success
      )
      Divider()
      AtomListRow(
        title: "Appearance",
        systemImage: "circle.lefthalf.filled",
        showsDisclosure: true
      )
      Divider()
      AtomListRow(
        title: "Accessibility",
        subtitle: "Dynamic Type, VoiceOver, and reduced motion.",
        systemImage: "accessibility"
      )
    }
  }
}

private struct ValueRowShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x3) {
      AtomValueRow("Runtime", value: "Native SwiftUI", systemImage: "swift")
      AtomValueRow("Minimum OS", value: "iOS 17", systemImage: "iphone")
      AtomValueRow("Dynamic Type", value: "Accessibility 5", systemImage: "textformat.size")
    }
  }
}

private struct SelectionRowShowcase: View {
  @State private var selection = "native"

  var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      AtomSelectionRow(
        "Native SwiftUI",
        subtitle: "Recommended for production apps",
        isSelected: selection == "native"
      ) {
        selection = "native"
      }
      AtomSelectionRow(
        "Web container",
        subtitle: "Reserved for embedded web experiences",
        isSelected: selection == "web"
      ) {
        selection = "web"
      }
    }
  }
}

private struct DisclosureGroupShowcase: View {
  @State private var isExpanded = false

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      DisclosureGroup("Implementation details", isExpanded: $isExpanded) {
        Text("Native SwiftUI renderer with shared product intent.")
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.top, AtomTokens.Space.x2)
      }

      DisclosureGroup("Unavailable details") {
        Text("This content cannot be revealed.")
      }
      .disabled(true)
    }
  }
}

private struct SectionHeaderShowcase: View {
  @State private var message = "No action yet"

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x5) {
      AtomSectionHeader("Projects")
      AtomSectionHeader(
        "Recent work",
        subtitle: "Updated across all connected devices"
      )
      AtomSectionHeader(
        "Collaborators",
        subtitle: "People with access to this project",
        actionTitle: "Manage"
      ) {
        message = "Manage selected"
      }
      Text(message)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

private struct ChipShowcase: View {
  @State private var selection = "All"
  private let options = ["All", "Active", "Draft", "Archived"]

  var body: some View {
    ScrollView(.horizontal) {
      HStack(spacing: AtomTokens.Space.x2) {
        ForEach(options, id: \.self) { option in
          AtomChip(
            option,
            systemImage: option == "All" ? "square.grid.2x2" : nil,
            isSelected: selection == option
          ) {
            selection = option
          }
        }
      }
    }
    .scrollIndicators(.hidden)
  }
}

private struct BadgeShowcase: View {
  var body: some View {
    FlowLayout(spacing: AtomTokens.Space.x2) {
      AtomBadge("Neutral")
      AtomBadge("Accent", tone: .accent)
      AtomBadge("Success", tone: .success)
      AtomBadge("Warning", tone: .warning)
      AtomBadge("Danger", tone: .danger)
    }
  }
}

private struct FlowLayout: Layout {
  let spacing: CGFloat

  func sizeThatFits(
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) -> CGSize {
    arrange(proposal: proposal, subviews: subviews).size
  }

  func placeSubviews(
    in bounds: CGRect,
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) {
    let result = arrange(proposal: proposal, subviews: subviews)
    for (index, point) in result.points.enumerated() {
      subviews[index].place(
        at: CGPoint(x: bounds.minX + point.x, y: bounds.minY + point.y),
        proposal: .unspecified
      )
    }
  }

  private func arrange(
    proposal: ProposedViewSize,
    subviews: Subviews
  ) -> (size: CGSize, points: [CGPoint]) {
    let maxWidth = proposal.width ?? .infinity
    var points: [CGPoint] = []
    var cursor = CGPoint.zero
    var rowHeight: CGFloat = 0
    var measuredWidth: CGFloat = 0

    for subview in subviews {
      let size = subview.sizeThatFits(.unspecified)
      if cursor.x > 0, cursor.x + size.width > maxWidth {
        cursor.x = 0
        cursor.y += rowHeight + spacing
        rowHeight = 0
      }
      points.append(cursor)
      cursor.x += size.width + spacing
      rowHeight = max(rowHeight, size.height)
      measuredWidth = max(measuredWidth, cursor.x - spacing)
    }

    return (
      CGSize(width: min(measuredWidth, maxWidth), height: cursor.y + rowHeight),
      points
    )
  }
}

private struct AvatarShowcase: View {
  var body: some View {
    HStack(alignment: .bottom, spacing: AtomTokens.Space.x4) {
      AvatarSample(name: "You Zhang", size: 36)
      AvatarSample(name: "Atom Sixty Three", size: 44)
      AvatarSample(name: "Design Systems", size: 64)
    }
  }
}

private struct AvatarSample: View {
  let name: String
  let size: CGFloat

  var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      AtomAvatar(name: name, size: size)
      Text(size, format: .number)
        .font(.caption2.monospacedDigit())
        .foregroundStyle(.secondary)
    }
  }
}

private struct AsyncImageShowcase: View {
  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      ShowcaseStateLabel("remote")
      AtomAsyncImage(
        url: URL(
          string: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900"
        ),
        accessibilityLabel: "Design workspace"
      )

      ShowcaseStateLabel("failure")
      AtomAsyncImage(
        url: URL(string: "https://invalid.atom63.dev/missing.jpg"),
        accessibilityLabel: "Unavailable project image",
        aspectRatio: 3 / 2
      )
    }
  }
}

private struct ContentStateShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x5) {
      VStack(spacing: AtomTokens.Space.x2) {
        ShowcaseStateLabel("empty")
        AtomContentStateView(
          title: "No projects yet",
          message: "Create a project to start building.",
          systemImage: "square.stack.3d.up.slash",
          actionTitle: "Create project"
        ) {}
      }

      Divider()

      VStack(spacing: AtomTokens.Space.x2) {
        ShowcaseStateLabel("error")
        AtomContentStateView(
          title: "Couldn’t load projects",
          message: "Check the connection and try again.",
          systemImage: "wifi.exclamationmark",
          tone: .error,
          actionTitle: "Try again"
        ) {}
      }
    }
  }
}

private struct NoticeShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x3) {
      AtomNotice(
        "Design system connected",
        message: "Shared intent is rendering through native SwiftUI."
      )
      AtomNotice(
        "Changes saved",
        message: "Your project is up to date.",
        tone: .success
      )
      AtomNotice(
        "Offline changes",
        message: "Updates will synchronize when the connection returns.",
        tone: .warning
      )
      AtomNotice(
        "Upload failed",
        message: "Check the connection and try again.",
        tone: .error,
        actionTitle: "Retry"
      ) {}
    }
  }
}

private struct ProgressShowcase: View {
  var body: some View {
    VStack(spacing: AtomTokens.Space.x5) {
      AtomProgressView("Synchronizing", message: "Contacting the remote source")
      AtomProgressView(
        "Foundation coverage",
        message: "Core mobile product patterns",
        value: 0.72
      )
      AtomProgressView("Upload", message: "3 of 8 files", value: 3, total: 8)
    }
  }
}

private struct SkeletonShowcase: View {
  @State private var isLoading = true

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      AtomToggle("Show skeleton", isOn: $isLoading)

      ShowcaseSection("Loading", subtitle: "Shared leading-to-trailing shimmer recipe") {
        VStack(spacing: AtomTokens.Space.x3) {
          AtomSkeletonRow()
          AtomSkeletonRow()
          AtomListRow(
            title: "Loaded project",
            subtitle: "The same anatomy can be redacted.",
            systemImage: "square.stack.3d.up"
          )
          .atomSkeleton(isLoading)
        }
      }

      ShowcaseSection("Reduced motion", subtitle: "Static placeholder, no transition") {
        AtomListRow(
          title: "Reduced motion project",
          subtitle: "The loading shape remains visible without shimmer.",
          systemImage: "figure.walk.motion"
        )
        .atomSkeleton()
        .atomMotionPreference(.reduced)
      }
    }
  }
}

private struct SyncStatusShowcase: View {
  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      ForEach(AtomSyncIntent.allCases, id: \.self) { intent in
        VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
          ShowcaseStateLabel(intent.rawValue)
          AtomSyncStatusView(intent: intent)
        }
      }
    }
  }
}

private struct PaginationShowcase: View {
  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      ForEach(AtomPaginationIntent.allCases, id: \.self) { intent in
        VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
          ShowcaseStateLabel(intent.rawValue)
          AtomLoadMoreView(intent: intent) {}
        }
      }
    }
  }
}

private struct ToastShowcase: View {
  @State private var toast: AtomToast?

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      AtomButton("Show success toast", variant: .primary) {
        toast = AtomToast(message: "Project saved")
      }
      AtomButton("Show warning toast", variant: .outline) {
        toast = AtomToast(
          message: "Working offline",
          systemImage: "wifi.slash"
        )
      }
    }
    .frame(maxWidth: .infinity, minHeight: 120, alignment: .topLeading)
    .atomToast($toast)
  }
}
