import Atom63UI
import Foundation

enum CatalogSection: String, CaseIterable, Identifiable {
  case foundations = "Foundations"
  case actions = "Actions"
  case navigation = "Navigation"
  case forms = "Forms and inputs"
  case content = "Content"
  case feedback = "Feedback and status"

  var id: Self { self }

  var systemImage: String {
    switch self {
    case .foundations:
      "paintpalette"
    case .actions:
      "hand.tap"
    case .navigation:
      "point.topleft.down.to.point.bottomright.curvepath"
    case .forms:
      "text.cursor"
    case .content:
      "rectangle.3.group"
    case .feedback:
      "waveform.path.ecg"
    }
  }
}

enum CatalogItem: String, CaseIterable, Hashable, Identifiable {
  case tokens
  case theme
  case button
  case iconButton
  case actionBar
  case menu
  case sheet
  case confirmationDialog
  case destinationLink
  case tabs
  case formField
  case textField
  case textEditor
  case toggle
  case picker
  case search
  case segmentedControl
  case radioGroup
  case slider
  case datePicker
  case formMessage
  case card
  case listRow
  case valueRow
  case selectionRow
  case disclosureGroup
  case sectionHeader
  case chip
  case badge
  case avatar
  case asyncImage
  case contentState
  case notice
  case progress
  case skeleton
  case syncStatus
  case pagination
  case toast

  var id: Self { self }

  var section: CatalogSection {
    switch self {
    case .tokens, .theme:
      .foundations
    case .button, .iconButton, .actionBar, .menu, .sheet, .confirmationDialog:
      .actions
    case .destinationLink, .tabs:
      .navigation
    case .formField, .textField, .textEditor, .toggle, .picker, .search, .segmentedControl,
      .radioGroup, .slider, .datePicker, .formMessage:
      .forms
    case .card, .listRow, .valueRow, .selectionRow, .disclosureGroup, .sectionHeader,
      .chip, .badge,
      .avatar, .asyncImage:
      .content
    case .contentState, .notice, .progress, .skeleton, .syncStatus, .pagination, .toast:
      .feedback
    }
  }

  var title: String {
    switch self {
    case .tokens: "Tokens"
    case .theme: "Theme"
    case .button: "Button"
    case .iconButton: "Icon button"
    case .actionBar: "Action bar"
    case .menu: "Menu"
    case .sheet: "Sheet"
    case .confirmationDialog: "Confirmation dialog"
    case .destinationLink: "Destination link"
    case .tabs: "Tabs"
    case .formField: "Form field"
    case .textField: "Text field"
    case .textEditor: "Text editor"
    case .toggle: "Toggle"
    case .picker: "Picker"
    case .search: "Search"
    case .segmentedControl: "Segmented control"
    case .radioGroup: "Radio group"
    case .slider: "Slider"
    case .datePicker: "Date picker"
    case .formMessage: "Form message"
    case .card: "Card"
    case .listRow: "List row"
    case .valueRow: "Value row"
    case .selectionRow: "Selection row"
    case .disclosureGroup: "Disclosure group"
    case .sectionHeader: "Section header"
    case .chip: "Chip"
    case .badge: "Badge"
    case .avatar: "Avatar"
    case .asyncImage: "Async image"
    case .contentState: "Content state"
    case .notice: "Notice"
    case .progress: "Progress"
    case .skeleton: "Skeleton"
    case .syncStatus: "Sync status"
    case .pagination: "Pagination"
    case .toast: "Toast"
    }
  }

  var symbol: String {
    switch self {
    case .tokens: "circle.hexagongrid"
    case .theme: "circle.lefthalf.filled"
    case .button: "rectangle.and.hand.point.up.left"
    case .iconButton: "square.grid.2x2"
    case .actionBar: "rectangle.bottomthird.inset.filled"
    case .menu: "ellipsis.circle"
    case .sheet: "rectangle.portrait.bottomhalf.inset.filled"
    case .confirmationDialog: "exclamationmark.bubble"
    case .destinationLink: "arrow.up.right.square"
    case .tabs: "square.split.2x1"
    case .formField: "rectangle.and.pencil.and.ellipsis"
    case .textField: "text.cursor"
    case .textEditor: "text.alignleft"
    case .toggle: "switch.2"
    case .picker: "checklist"
    case .search: "magnifyingglass"
    case .segmentedControl: "rectangle.split.3x1"
    case .radioGroup: "circle.inset.filled"
    case .slider: "slider.horizontal.3"
    case .datePicker: "calendar"
    case .formMessage: "exclamationmark.bubble"
    case .card: "rectangle"
    case .listRow: "list.bullet.rectangle"
    case .valueRow: "equal"
    case .selectionRow: "checkmark.circle"
    case .disclosureGroup: "chevron.down.circle"
    case .sectionHeader: "textformat.size"
    case .chip: "capsule"
    case .badge: "app.badge"
    case .avatar: "person.crop.circle"
    case .asyncImage: "photo"
    case .contentState: "rectangle.slash"
    case .notice: "info.circle"
    case .progress: "chart.bar.fill"
    case .skeleton: "square.stack.3d.up"
    case .syncStatus: "arrow.triangle.2.circlepath"
    case .pagination: "ellipsis.circle"
    case .toast: "bell.badge"
    }
  }

  var summary: String {
    switch self {
    case .tokens:
      "Shared color, spacing, radius, and motion primitives generated from the web foundation."
    case .theme:
      "Semantic colors resolved for the current appearance through the Atom63 environment."
    case .button:
      "Primary through ghost actions with size, loading, disabled, and pressed behavior."
    case .iconButton:
      "A labeled 44-point icon action with bounded Dynamic Type scaling."
    case .actionBar:
      "Safe-area-ready primary and secondary page actions that adapt at accessibility sizes."
    case .menu:
      "Native contextual actions and choices with disabled, checked, and destructive intent."
    case .sheet:
      "Native modal presentation for focused tasks with title, dismissal, and originating-context preservation."
    case .confirmationDialog:
      "Native consequential-action confirmation with explicit cancel and role-aware action semantics."
    case .destinationLink:
      "Internal and external destinations that preserve native navigation and announce external behavior."
    case .tabs:
      "Peer destination or content selection with one visible selected state and associated content."
    case .formField:
      "Label, control, support, focus, and error anatomy with standalone, grouped Form, and sheet presentation ownership."
    case .textField:
      "Single-line and secure text entry tied to Atom63 form intent."
    case .textEditor:
      "Multiline entry with prompt, support, validation, and native scrolling."
    case .toggle:
      "Native switch behavior with Atom63 semantics and accessibility-size layout."
    case .picker:
      "Native single-value selection with an exposed label, current value, and disabled behavior."
    case .search:
      "Native collection search with query editing, clear, submit, cancellation, and platform placement."
    case .segmentedControl:
      "Compact native single selection for switching a local mode or view."
    case .radioGroup:
      "Visible mutually exclusive options rendered as an inline Picker or selection rows."
    case .slider:
      "Native direct manipulation for a bounded, stepped numeric value."
    case .datePicker:
      "Native bounded date selection with platform-owned presentation and complete accessible values."
    case .formMessage:
      "Inline form-level information, success, and error feedback."
    case .card:
      "Token-driven static surface for related content composition."
    case .listRow:
      "Reusable row anatomy with icon, supporting text, badge, and disclosure."
    case .valueRow:
      "Read-only label and value presentation that reflows for Dynamic Type."
    case .selectionRow:
      "A native button row expressing single-choice selected intent."
    case .disclosureGroup:
      "Native in-place reveal and hide behavior for supporting content."
    case .sectionHeader:
      "Heading, supporting copy, and an optional contextual action."
    case .chip:
      "Compact, selectable filter action with optional SF Symbol."
    case .badge:
      "Small status or category label across five semantic tones."
    case .avatar:
      "Remote image or deterministic initials fallback with an accessible name."
    case .asyncImage:
      "Aspect-ratio-stable remote media with loading, reveal, and failure states."
    case .contentState:
      "Empty and error recovery built on native ContentUnavailableView."
    case .notice:
      "Persistent inline product feedback across four semantic tones."
    case .progress:
      "Determinate and indeterminate work with a complete VoiceOver value."
    case .skeleton:
      "Shape-preserving loading feedback that respects reduced motion."
    case .syncStatus:
      "Repository synchronization intent rendered without leaking infrastructure details."
    case .pagination:
      "Load-more idle, loading, retry, and exhausted intent."
    case .toast:
      "Transient confirmation with automatic dismissal and reduced-motion support."
    }
  }

  var typeName: String {
    switch self {
    case .tokens: "AtomTokens"
    case .theme: "AtomTheme"
    case .button: "AtomButton"
    case .iconButton: "AtomIconButton"
    case .actionBar: "AtomActionBar"
    case .menu: "Menu"
    case .sheet: "sheet(isPresented:) / presentationDetents(_:)"
    case .confirmationDialog: "alert(_:isPresented:actions:message:)"
    case .destinationLink: "NavigationLink / Link"
    case .tabs: "TabView"
    case .formField: "AtomFormField"
    case .textField: "AtomTextField"
    case .textEditor: "AtomTextEditor"
    case .toggle: "AtomToggle"
    case .picker: "Picker"
    case .search: "searchable(text:prompt:)"
    case .segmentedControl: "Picker(.segmented)"
    case .radioGroup: "Picker(.inline) / AtomSelectionRow"
    case .slider: "Slider"
    case .datePicker: "DatePicker"
    case .formMessage: "AtomFormMessage"
    case .card: "AtomCard"
    case .listRow: "AtomListRow"
    case .valueRow: "AtomValueRow"
    case .selectionRow: "AtomSelectionRow"
    case .disclosureGroup: "DisclosureGroup"
    case .sectionHeader: "AtomSectionHeader"
    case .chip: "AtomChip"
    case .badge: "AtomBadge"
    case .avatar: "AtomAvatar"
    case .asyncImage: "AtomAsyncImage"
    case .contentState: "AtomContentStateView"
    case .notice: "AtomNotice"
    case .progress: "AtomProgressView"
    case .skeleton: "AtomSkeletonRow / atomSkeleton(_:)"
    case .syncStatus: "AtomSyncStatusView / AtomSyncIntent"
    case .pagination: "AtomLoadMoreView / AtomPaginationIntent"
    case .toast: "AtomToast / atomToast(_:)"
    }
  }

  var usage: String {
    switch self {
    case .tokens:
      "VStack(spacing: AtomTokens.Space.x4) {\n  content\n}"
    case .theme:
      "RootView()\n  .atomTheme(.standard)"
    case .button:
      "AtomButton(\"Save changes\", variant: .primary) {\n  save()\n}"
    case .iconButton:
      "AtomIconButton(\"Add project\", systemImage: \"plus\") {\n  addProject()\n}"
    case .actionBar:
      "AtomActionBar(\n  primaryTitle: \"Publish\",\n  primaryAction: publish,\n  secondaryTitle: \"Save draft\",\n  secondaryAction: saveDraft\n)"
    case .menu:
      "Menu(\"Actions\") {\n  Button(\"Duplicate\", action: duplicate)\n  Toggle(\"Show details\", isOn: $showsDetails)\n  Button(\"Delete\", role: .destructive, action: delete)\n}"
    case .sheet:
      "Button(\"New project\") { showsSheet = true }\n  .sheet(isPresented: $showsSheet) {\n    ProjectForm()\n      .presentationDetents([.medium, .large])\n  }"
    case .confirmationDialog:
      ".alert(\"Delete project?\", isPresented: $confirmsDeletion) {\n  Button(\"Delete\", role: .destructive, action: delete)\n  Button(\"Cancel\", role: .cancel) {}\n}"
    case .destinationLink:
      "NavigationLink(\"Project\", value: project)\nLink(\"Documentation\", destination: docsURL)"
    case .tabs:
      "TabView(selection: $selection) {\n  OverviewView().tag(Tab.overview)\n  ActivityView().tag(Tab.activity)\n}"
    case .formField:
      "AtomFormField(\"Code\", supportingText: \"Six digits\") {\n  TextField(\"Code\", text: $code)\n}\n.atomFormPresentation(.grouped)"
    case .textField:
      "AtomTextField(\n  \"Email\",\n  text: $email,\n  errorMessage: validationError\n)"
    case .textEditor:
      "AtomTextEditor(\n  \"Description\",\n  text: $description,\n  supportingText: \"Describe the outcome\"\n)"
    case .toggle:
      "AtomToggle(\n  \"Notifications\",\n  isOn: $notificationsEnabled,\n  description: \"Receive activity updates.\"\n)"
    case .picker:
      "Picker(\"Project status\", selection: $status) {\n  ForEach(Status.allCases) { status in\n    Text(status.title).tag(status)\n  }\n}"
    case .search:
      "ProjectList()\n  .searchable(text: $query, prompt: \"Search projects\")\n  .onSubmit(of: .search, submitSearch)"
    case .segmentedControl:
      "Picker(\"Layout\", selection: $layout) {\n  Text(\"List\").tag(Layout.list)\n  Text(\"Grid\").tag(Layout.grid)\n}\n.pickerStyle(.segmented)"
    case .radioGroup:
      "Picker(\"Renderer\", selection: $renderer) {\n  Text(\"Native SwiftUI\").tag(Renderer.native)\n  Text(\"Web container\").tag(Renderer.web)\n}\n.pickerStyle(.inline)"
    case .slider:
      "Slider(value: $priority, in: 0...100, step: 10)\n  .accessibilityLabel(\"Priority\")\n  .accessibilityValue(\"\\(Int(priority)) percent\")"
    case .datePicker:
      "DatePicker(\n  \"Start date\",\n  selection: $startDate,\n  in: Date.now...,\n  displayedComponents: .date\n)"
    case .formMessage:
      "AtomFormMessage(\n  \"Review required\",\n  message: \"Resolve the highlighted fields.\",\n  tone: .error\n)"
    case .card:
      "AtomCard(action: openProject) {\n  VStack(alignment: .leading) {\n    Text(\"Project\")\n    Text(\"Supporting details\")\n  }\n}"
    case .listRow:
      "AtomListRow(\n  title: \"Mobile design system\",\n  subtitle: \"Native SwiftUI renderer\",\n  systemImage: \"iphone\",\n  badge: \"Active\",\n  badgeTone: .success\n)"
    case .valueRow:
      "AtomValueRow(\"Runtime\", value: \"Native\", systemImage: \"swift\")"
    case .selectionRow:
      "AtomSelectionRow(\"Native SwiftUI\", isSelected: selected) {\n  selected = true\n}"
    case .disclosureGroup:
      "DisclosureGroup(\"Implementation details\", isExpanded: $isExpanded) {\n  Text(\"Native SwiftUI with shared intent.\")\n}"
    case .sectionHeader:
      "AtomSectionHeader(\n  \"Projects\",\n  subtitle: \"Recently updated\",\n  actionTitle: \"See all\",\n  action: showAll\n)"
    case .chip:
      "AtomChip(\"Active\", isSelected: filter == .active) {\n  filter = .active\n}"
    case .badge:
      "AtomBadge(\"Synchronized\", tone: .success)"
    case .avatar:
      "AtomAvatar(name: \"You Zhang\", imageURL: profileURL)"
    case .asyncImage:
      "AtomAsyncImage(\n  url: imageURL,\n  accessibilityLabel: \"Design workspace\"\n)"
    case .contentState:
      "AtomContentStateView(\n  title: \"No projects\",\n  message: \"Create your first project.\",\n  systemImage: \"square.stack.3d.up.slash\",\n  actionTitle: \"Create project\",\n  action: createProject\n)"
    case .notice:
      "AtomNotice(\n  \"Changes saved\",\n  message: \"Your project is up to date.\",\n  tone: .success\n)"
    case .progress:
      "AtomProgressView(\"Uploading\", value: uploaded, total: total)"
    case .skeleton:
      "List(0..<3, id: \\.self) { _ in\n  AtomSkeletonRow()\n}"
    case .syncStatus:
      "AtomSyncStatusView(intent: repositoryResult.syncIntent)"
    case .pagination:
      "AtomLoadMoreView(intent: paginationIntent) {\n  Task { await loadNextPage() }\n}"
    case .toast:
      "ContentView()\n  .atomToast($toast)"
    }
  }

  var searchText: String {
    let contractText =
      conformanceContract.map {
        "\($0.foundationContract) \($0.requiredStates.joined(separator: " "))"
      } ?? ""
    return "\(title) \(typeName) \(summary) \(section.rawValue) \(contractText)"
  }

  var conformanceContract: AtomComponentContract? {
    AtomComponentContracts.contract(catalogItem: rawValue)
  }
}

enum CatalogRegistry {
  static let sections = CatalogSection.allCases
  static let items = CatalogItem.allCases

  static func items(in section: CatalogSection, matching query: String) -> [CatalogItem] {
    items.filter { item in
      item.section == section
        && (query.isEmpty || item.searchText.localizedStandardContains(query))
    }
  }
}
