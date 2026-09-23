import Atom63UI
import Observation
import SwiftUI

enum DemoCollectionState: String, CaseIterable, Identifiable {
  case loaded
  case loading
  case empty
  case error
  case offline

  var id: Self { self }
}

@Observable
@MainActor
final class DemoAppModel {
  var isAuthenticated = true
  private(set) var projects: [DemoProject]
  private(set) var resourceIntent: AtomResourceIntent
  private(set) var syncIntent: AtomSyncIntent
  private(set) var paginationIntent: AtomPaginationIntent
  private(set) var paginationRequestID = 0
  private(set) var projectErrorMessage = "Check the connection and try again."
  var toast: AtomToast?

  private let repository: ProjectRepository
  private var hasLoadedProjects = false

  init(repository: ProjectRepository) {
    self.repository = repository

    do {
      try repository.seedIfNeeded()
      let cachedProjects = try repository.cachedProjects()
      projects = cachedProjects
      resourceIntent = cachedProjects.isEmpty ? .loading : .content
      syncIntent = cachedProjects.isEmpty ? .idle : .stale
      paginationIntent = .idle
    } catch {
      projects = []
      resourceIntent = .error
      syncIntent = .failed
      paginationIntent = .failed
      projectErrorMessage = ProjectDataError.map(error).localizedDescription
    }
  }

  func signIn() {
    isAuthenticated = true
  }

  func signOut() {
    isAuthenticated = false
  }

  func addProject(title: String, summary: String, status: String) -> Bool {
    let project = DemoProject(
      id: "local-\(UUID().uuidString)",
      title: title,
      summary: summary,
      status: status,
      systemImage: "sparkles.rectangle.stack",
      imageURL: nil
    )

    do {
      try repository.upsert(project)
      projects = try repository.cachedProjects()
      resourceIntent = .content
      syncIntent = .stale
      toast = AtomToast(message: "Project saved locally")
      return true
    } catch {
      syncIntent = .failed
      toast = AtomToast(
        message: "Couldn’t save project",
        systemImage: "exclamationmark.triangle"
      )
      return false
    }
  }

  func updateProject(_ project: DemoProject) -> Bool {
    do {
      try repository.upsert(project)
      projects = try repository.cachedProjects()
      resourceIntent = .content
      syncIntent = .stale
      toast = AtomToast(message: "Project changes saved")
      return true
    } catch {
      syncIntent = .failed
      toast = AtomToast(
        message: "Couldn’t save project changes",
        systemImage: "exclamationmark.triangle"
      )
      return false
    }
  }

  func delete(_ project: DemoProject) -> Bool {
    do {
      try repository.delete(project)
      projects = try repository.cachedProjects()
      resourceIntent = projects.isEmpty ? .empty : .content
      syncIntent = .stale
      toast = AtomToast(message: "Project deleted", systemImage: "trash")
      return true
    } catch {
      syncIntent = .failed
      toast = AtomToast(
        message: "Couldn’t delete project",
        systemImage: "exclamationmark.triangle"
      )
      return false
    }
  }

  func loadProjectsIfNeeded() async {
    guard !hasLoadedProjects else { return }
    hasLoadedProjects = true
    await reloadProjects()
  }

  func reloadProjects() async {
    if projects.isEmpty {
      resourceIntent = .loading
    }
    syncIntent = .refreshing

    do {
      let result = try await repository.load()
      projects = result.projects
      resourceIntent = projects.isEmpty ? .empty : .content
      syncIntent = result.syncIntent
      paginationIntent = result.paginationIntent
      if paginationIntent == .idle {
        paginationRequestID += 1
      }
    } catch is CancellationError {
      return
    } catch {
      projectErrorMessage = ProjectDataError.map(error).localizedDescription
      resourceIntent = projects.isEmpty ? .error : .content
      syncIntent = .failed
    }
  }

  func loadNextPage() async {
    guard paginationIntent == .idle else { return }
    paginationIntent = .loadingMore

    do {
      guard let result = try await repository.loadNextPage() else { return }
      projects = result.projects
      resourceIntent = projects.isEmpty ? .empty : .content
      syncIntent = result.syncIntent
      paginationIntent = result.paginationIntent
      if paginationIntent == .idle {
        paginationRequestID += 1
      }
    } catch is CancellationError {
      paginationIntent = .idle
    } catch {
      paginationIntent = .failed
    }
  }

  func applyPreview(_ state: DemoCollectionState) {
    switch state {
    case .loaded:
      resourceIntent = projects.isEmpty ? .empty : .content
      syncIntent = .synchronized
      paginationIntent = .idle
    case .loading:
      resourceIntent = .loading
      syncIntent = .refreshing
    case .empty:
      resourceIntent = .empty
      syncIntent = .idle
      paginationIntent = .exhausted
    case .error:
      resourceIntent = .error
      syncIntent = .failed
    case .offline:
      resourceIntent = projects.isEmpty ? .empty : .content
      syncIntent = .offline
      paginationIntent = .failed
    }
  }
}

struct ReferenceApp: View {
  @State private var model: DemoAppModel

  init(repository: ProjectRepository) {
    _model = State(initialValue: DemoAppModel(repository: repository))
  }

  var body: some View {
    Group {
      if model.isAuthenticated {
        MainTabView(model: model)
      } else {
        LoginView(model: model)
      }
    }
    .atomToast($model.toast)
    .task {
      await model.loadProjectsIfNeeded()
    }
  }
}

private enum DemoTab: Hashable {
  case home
  case projects
  case catalog
  case settings
}

private struct MainTabView: View {
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  let model: DemoAppModel
  @State private var selectedTab: DemoTab = .home

  var body: some View {
    if horizontalSizeClass == .regular {
      regularWidthShell
    } else {
      compactTabShell
    }
  }

  private var regularWidthShell: some View {
    NavigationSplitView {
      List(selection: sidebarSelection) {
        Label("Home", systemImage: "house")
          .tag(DemoTab.home)
        Label("Projects", systemImage: "square.stack.3d.up")
          .tag(DemoTab.projects)
        Label("Catalog", systemImage: "rectangle.grid.2x2")
          .tag(DemoTab.catalog)
        Label("Settings", systemImage: "gearshape")
          .tag(DemoTab.settings)
      }
      .navigationTitle("Atom63")
    } detail: {
      selectedContent
    }
    .navigationSplitViewStyle(.balanced)
  }

  private var sidebarSelection: Binding<DemoTab?> {
    Binding(
      get: { selectedTab },
      set: { selection in
        if let selection {
          selectedTab = selection
        }
      }
    )
  }

  @ViewBuilder
  private var compactTabShell: some View {
    if #available(iOS 18.0, *) {
      TabView(selection: $selectedTab) {
        Tab("Home", systemImage: "house", value: DemoTab.home) {
          DashboardView(model: model)
        }

        Tab("Projects", systemImage: "square.stack.3d.up", value: DemoTab.projects) {
          ProjectsView(model: model)
        }

        Tab("Catalog", systemImage: "rectangle.grid.2x2", value: DemoTab.catalog) {
          CatalogView()
        }

        Tab("Settings", systemImage: "gearshape", value: DemoTab.settings) {
          SettingsView(onSignOut: model.signOut)
        }
      }
    } else {
      legacyTabShell
    }
  }

  private var legacyTabShell: some View {
    TabView(selection: $selectedTab) {
      DashboardView(model: model)
        .tag(DemoTab.home)
        .tabItem {
          Label("Home", systemImage: "house")
        }

      ProjectsView(model: model)
        .tag(DemoTab.projects)
        .tabItem {
          Label("Projects", systemImage: "square.stack.3d.up")
        }

      CatalogView()
        .tag(DemoTab.catalog)
        .tabItem {
          Label("Catalog", systemImage: "rectangle.grid.2x2")
        }

      SettingsView(onSignOut: model.signOut)
        .tag(DemoTab.settings)
        .tabItem {
          Label("Settings", systemImage: "gearshape")
        }
    }
  }

  @ViewBuilder
  private var selectedContent: some View {
    switch selectedTab {
    case .home:
      DashboardView(model: model)
    case .projects:
      ProjectsView(model: model)
    case .catalog:
      CatalogView()
    case .settings:
      SettingsView(onSignOut: model.signOut)
    }
  }
}

private struct DashboardView: View {
  let model: DemoAppModel
  @State private var selectedRuntime = "Native SwiftUI"

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: AtomTokens.Space.x4) {
          AtomAsyncImage(
            url: URL(string: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200"),
            accessibilityLabel: "Design workspace"
          )

          AtomNotice(
            "Design system connected",
            message: "Shared intent and tokens are rendering through native SwiftUI.",
            tone: .success
          )

          AtomSectionHeader(
            "Workspace",
            subtitle: "Reusable composition patterns for product screens"
          )

          AtomCard {
            HStack(spacing: AtomTokens.Space.x3) {
              AtomAvatar(name: "You Zhang")

              VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
                Text("Welcome back")
                  .font(.headline)
                Text("\(model.projects.count) projects in your workspace")
                  .font(.subheadline)
                  .foregroundStyle(.secondary)
              }
            }
          }

          AtomCard {
            VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
              AtomSectionHeader("System coverage")
              AtomValueRow(
                "Navigation", value: "Native",
                systemImage: "point.topleft.down.to.point.bottomright.curvepath")
              AtomValueRow("Feedback states", value: "Covered", systemImage: "checkmark.circle")
              AtomValueRow("Dynamic Type", value: "AX5", systemImage: "textformat.size")
              AtomProgressView(
                "Foundation coverage",
                message: "Core mobile product patterns",
                value: 0.72
              )
            }
          }

          AtomCard {
            VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
              HStack {
                AtomSectionHeader(
                  "Runtime",
                  subtitle: "Choose the platform rendering strategy"
                )
                AtomIconButton("Runtime help", systemImage: "questionmark.circle") {
                  model.toast = AtomToast(message: "Atom63 uses native SwiftUI rendering")
                }
              }

              AtomSelectionRow(
                "Native SwiftUI",
                subtitle: "Recommended for production apps",
                isSelected: selectedRuntime == "Native SwiftUI"
              ) {
                selectedRuntime = "Native SwiftUI"
              }
              AtomSelectionRow(
                "Web container",
                subtitle: "Reserved for embedded web experiences",
                isSelected: selectedRuntime == "Web container"
              ) {
                selectedRuntime = "Web container"
              }
            }
          }
        }
        .padding(AtomTokens.Space.x4)
      }
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .navigationTitle("Atom63")
    }
  }
}

private enum ProjectsSheet: String, Identifiable {
  case add

  var id: String { rawValue }
}

private enum ProjectFilter: String, CaseIterable, Identifiable {
  case all = "All"
  case active = "Active"
  case draft = "Draft"
  case archived = "Archived"

  var id: Self { self }

  static let creatableCases: [ProjectFilter] = [.active, .draft, .archived]

  func includes(_ project: DemoProject) -> Bool {
    self == .all || project.status == rawValue
  }
}

private extension DemoProject {
  var statusTone: AtomBadgeTone {
    switch ProjectFilter(rawValue: status) {
    case .active:
      .success
    case .draft:
      .warning
    case .archived, .all, nil:
      .neutral
    }
  }
}

private struct ProjectsView: View {
  let model: DemoAppModel
  @State private var query = ""
  @State private var filter: ProjectFilter = .all
  @State private var presentedSheet: ProjectsSheet?

  private var filteredProjects: [DemoProject] {
    model.projects.filter { project in
      filter.includes(project)
        && (query.isEmpty
          || project.title.localizedStandardContains(query)
          || project.summary.localizedStandardContains(query))
    }
  }

  var body: some View {
    NavigationStack {
      content
        .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
        .navigationTitle("Projects")
        .searchable(text: $query, prompt: "Search projects")
        .safeAreaInset(edge: .top, spacing: 0) {
          VStack(spacing: 0) {
            if showsSyncStatus {
              AtomSyncStatusView(intent: model.syncIntent)
            }
            projectFilters
          }
        }
        .navigationDestination(for: DemoProject.self) { project in
          ProjectDetailView(project: project, model: model)
        }
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Menu("Preview state", systemImage: "slider.horizontal.3") {
              ForEach(DemoCollectionState.allCases) { state in
                Button(state.rawValue.capitalized) {
                  model.applyPreview(state)
                }
              }
            }
          }

          ToolbarItem(placement: .topBarTrailing) {
            Button("Add project", systemImage: "plus") {
              presentedSheet = .add
            }
            .keyboardShortcut("n", modifiers: .command)
          }
        }
        .sheet(item: $presentedSheet) { sheet in
          switch sheet {
          case .add:
            AddProjectSheet(model: model)
              .presentationDetents([.medium, .large])
          }
        }
    }
  }

  private var projectFilters: some View {
    ScrollView(.horizontal) {
      HStack(spacing: AtomTokens.Space.x2) {
        ForEach(ProjectFilter.allCases) { projectFilter in
          AtomChip(
            projectFilter.rawValue,
            isSelected: filter == projectFilter
          ) {
            filter = projectFilter
          }
        }
      }
      .padding(.horizontal, AtomTokens.Space.x4)
      .padding(.vertical, AtomTokens.Space.x2)
    }
    .scrollIndicators(.hidden)
    .background(.bar)
  }

  @ViewBuilder
  private var content: some View {
    switch model.resourceIntent {
    case .content:
      List {
        if filteredProjects.isEmpty {
          ContentUnavailableView.search(text: query)
            .listRowBackground(Color.clear)
        } else {
          ForEach(filteredProjects) { project in
            NavigationLink(value: project) {
              AtomListRow(
                title: project.title,
                subtitle: project.summary,
                systemImage: project.systemImage,
                badge: project.status,
                badgeTone: project.statusTone
              )
            }
          }
        }

        AtomLoadMoreView(
          intent: model.paginationIntent,
          loadMore: startLoadingNextPage
        )
        .task(id: model.paginationRequestID) {
          if model.paginationIntent == .idle {
            await model.loadNextPage()
          }
        }
        .listRowSeparator(.hidden)
        .accessibilityIdentifier("projects-load-more")
      }
      .refreshable {
        await model.reloadProjects()
      }
    case .loading:
      List(0..<3, id: \.self) { _ in
        AtomSkeletonRow()
      }
      .disabled(true)
    case .empty:
      AtomContentStateView(
        title: "No projects yet",
        message: "Create a project to start testing the complete app flow.",
        systemImage: "square.stack.3d.up.slash",
        actionTitle: "Create project"
      ) {
        presentedSheet = .add
      }
    case .error:
      AtomContentStateView(
        title: "Couldn’t load projects",
        message: model.projectErrorMessage,
        systemImage: "wifi.exclamationmark",
        tone: .error,
        actionTitle: "Try again"
      ) {
        Task {
          await model.reloadProjects()
        }
      }
    }
  }

  private func startLoadingNextPage() {
    Task {
      await model.loadNextPage()
    }
  }

  private var showsSyncStatus: Bool {
    switch model.syncIntent {
    case .refreshing, .stale, .offline, .failed:
      true
    case .idle, .synchronized:
      false
    }
  }
}

private struct ProjectDetailView: View {
  @Environment(\.dismiss) private var dismiss
  let project: DemoProject
  let model: DemoAppModel
  @State private var confirmsDeletion = false
  @State private var showsEditor = false

  private var currentProject: DemoProject {
    model.projects.first { $0.id == project.id } ?? project
  }

  var body: some View {
    ScrollView {
      VStack(spacing: AtomTokens.Space.x4) {
        AtomAsyncImage(
          url: currentProject.imageURL,
          accessibilityLabel: "\(currentProject.title) preview"
        )

        AtomCard {
          VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
            HStack {
              Text(currentProject.title)
                .font(.title2)
                .fontWeight(.bold)
              Spacer()
              AtomBadge(currentProject.status, tone: currentProject.statusTone)
            }

            Text(currentProject.summary)
              .font(.body)
              .foregroundStyle(.secondary)
          }
        }
      }
      .padding(AtomTokens.Space.x4)
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      AtomActionBar(
        primaryTitle: "Delete project",
        primaryVariant: .destructive
      ) {
        confirmsDeletion = true
      }
    }
    .navigationTitle(currentProject.title)
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        Button("Edit project", systemImage: "pencil") {
          showsEditor = true
        }
        .accessibilityIdentifier("project-edit")
      }
    }
    .sheet(isPresented: $showsEditor) {
      EditProjectSheet(project: currentProject, model: model)
        .presentationDetents([.large])
    }
    .alert("Delete project?", isPresented: $confirmsDeletion) {
      Button("Delete", role: .destructive) {
        if model.delete(currentProject) {
          dismiss()
        }
      }
      Button("Cancel", role: .cancel) {}
    } message: {
      Text("This removes \(currentProject.title) from the demo workspace.")
    }
  }
}

private struct EditProjectSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  let project: DemoProject
  let model: DemoAppModel

  @State private var title: String
  @State private var summary: String
  @State private var isArchived: Bool
  @State private var hasAttemptedSave = false
  @State private var isSaving = false

  init(project: DemoProject, model: DemoAppModel) {
    self.project = project
    self.model = model
    _title = State(initialValue: project.title)
    _summary = State(initialValue: project.summary)
    _isArchived = State(initialValue: project.status == "Archived")
  }

  var body: some View {
    NavigationStack {
      Form {
        Section("Details") {
          AtomTextField(
            "Name",
            text: $title,
            prompt: "Project name",
            supportingText: "Shown in project lists and navigation.",
            errorMessage: titleError
          )
          .textInputAutocapitalization(.words)
          .accessibilityIdentifier("project-edit-name")

          AtomTextEditor(
            "Summary",
            text: $summary,
            prompt: "Describe the project",
            supportingText: "Explain the outcome in at least 12 characters.",
            errorMessage: summaryError
          )
          .accessibilityIdentifier("project-edit-summary")
        }
        .listRowBackground(theme.colors.surfacePanel.resolve(for: colorScheme))

        Section("Status") {
          AtomToggle(
            "Archived",
            isOn: $isArchived,
            description: "Archived projects remain available but are no longer active.",
            accessibilityIdentifier: "project-edit-archived"
          )
          .disabled(isSaving)
        }
        .listRowBackground(theme.colors.surfacePanel.resolve(for: colorScheme))
      }
      .disabled(isSaving)
      .atomFormPresentation(.sheet)
      .scrollDismissesKeyboard(.interactively)
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .scrollContentBackground(.hidden)
      .background(theme.colors.surfacePage.resolve(for: colorScheme))
      .navigationTitle("Edit project")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Cancel", action: dismiss.callAsFunction)
            .disabled(isSaving)
            .keyboardShortcut(.cancelAction)
        }
      }
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      AtomActionBar(
        primaryTitle: "Save changes",
        isPrimaryLoading: isSaving,
        primaryAction: save
      )
    }
    .presentationBackground(theme.colors.surfacePage.resolve(for: colorScheme))
    .interactiveDismissDisabled(isSaving)
  }

  private var titleError: String? {
    guard hasAttemptedSave else { return nil }
    return trimmedTitle.isEmpty ? "Enter a project name." : nil
  }

  private var summaryError: String? {
    guard hasAttemptedSave else { return nil }
    return trimmedSummary.count < 12 ? "Enter at least 12 characters." : nil
  }

  private var trimmedTitle: String {
    title.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private var trimmedSummary: String {
    summary.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private func save() {
    hasAttemptedSave = true
    guard titleError == nil, summaryError == nil else { return }

    isSaving = true
    Task {
      do {
        try await Task.sleep(for: .milliseconds(300))
      } catch is CancellationError {
        isSaving = false
        return
      } catch {
        isSaving = false
        model.toast = AtomToast(
          message: "Couldn’t save project changes",
          systemImage: "exclamationmark.triangle"
        )
        return
      }
      let updatedProject = DemoProject(
        id: project.id,
        title: trimmedTitle,
        summary: trimmedSummary,
        status: isArchived ? "Archived" : restoredActiveStatus,
        systemImage: project.systemImage,
        imageURL: project.imageURL
      )
      let didSave = model.updateProject(updatedProject)
      isSaving = false
      if didSave {
        dismiss()
      }
    }
  }

  private var restoredActiveStatus: String {
    project.status == "Archived" ? "Active" : project.status
  }
}

private struct AddProjectSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  let model: DemoAppModel
  @State private var title = ""
  @State private var summary = ""
  @State private var status: ProjectFilter = .draft
  @State private var hasAttemptedSave = false
  @State private var isSaving = false

  var body: some View {
    NavigationStack {
      Form {
        Section("Details") {
          AtomTextField(
            "Name",
            text: $title,
            prompt: "Project name",
            supportingText: "Shown in project lists and navigation.",
            errorMessage: titleError
          )
          .accessibilityIdentifier("project-create-name")

          AtomTextEditor(
            "Summary",
            text: $summary,
            prompt: "What are you building?",
            supportingText: "Explain the outcome in at least 12 characters.",
            errorMessage: summaryError
          )
          .accessibilityIdentifier("project-create-summary")
        }
        .listRowBackground(theme.colors.surfacePanel.resolve(for: colorScheme))

        Section("Status") {
          Picker("Project status", selection: $status) {
            ForEach(ProjectFilter.creatableCases) { status in
              Text(status.rawValue).tag(status)
            }
          }
          .accessibilityIdentifier("project-create-status")
          .disabled(isSaving)
        }
        .listRowBackground(theme.colors.surfacePanel.resolve(for: colorScheme))
      }
      .disabled(isSaving)
      .atomFormPresentation(.sheet)
      .scrollDismissesKeyboard(.interactively)
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .scrollContentBackground(.hidden)
      .background(theme.colors.surfacePage.resolve(for: colorScheme))
      .navigationTitle("New project")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Cancel", action: dismiss.callAsFunction)
            .disabled(isSaving)
            .keyboardShortcut(.cancelAction)
        }
      }
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      AtomActionBar(
        primaryTitle: "Create project",
        isPrimaryLoading: isSaving,
        primaryAction: createProject
      )
    }
    .presentationBackground(theme.colors.surfacePage.resolve(for: colorScheme))
    .interactiveDismissDisabled(isSaving)
  }

  private var titleError: String? {
    guard hasAttemptedSave else { return nil }
    return trimmedTitle.isEmpty ? "Enter a project name." : nil
  }

  private var summaryError: String? {
    guard hasAttemptedSave else { return nil }
    return trimmedSummary.count < 12 ? "Enter at least 12 characters." : nil
  }

  private var trimmedTitle: String {
    title.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private var trimmedSummary: String {
    summary.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private func createProject() {
    hasAttemptedSave = true
    guard titleError == nil, summaryError == nil else { return }

    isSaving = true
    Task {
      do {
        try await Task.sleep(for: .milliseconds(300))
      } catch is CancellationError {
        isSaving = false
        return
      } catch {
        isSaving = false
        model.toast = AtomToast(
          message: "Couldn’t create project",
          systemImage: "exclamationmark.triangle"
        )
        return
      }
      let didCreate = model.addProject(
        title: trimmedTitle,
        summary: trimmedSummary,
        status: status.rawValue
      )
      isSaving = false
      if didCreate {
        dismiss()
      }
    }
  }
}

private struct LoginView: View {
  let model: DemoAppModel
  @State private var email = ""
  @State private var password = ""
  @State private var isSigningIn = false

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: AtomTokens.Space.x5) {
          Image(systemName: "atom")
            .font(.system(size: 56))
            .foregroundStyle(.tint)
            .accessibilityHidden(true)

          VStack(spacing: AtomTokens.Space.x3) {
            Text("Welcome to Atom63")
              .font(.largeTitle)
              .fontWeight(.bold)
            Text("Sign in to open the reference application.")
              .foregroundStyle(.secondary)
              .multilineTextAlignment(.center)
          }

          AtomCard {
            VStack(spacing: AtomTokens.Space.x4) {
              AtomTextField("Email", text: $email, prompt: "you@example.com")
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)

              AtomTextField(
                "Password",
                text: $password,
                prompt: "Password",
                isSecure: true
              )
              .textContentType(.password)
            }
          }

          AtomButton(
            "Sign in",
            variant: .primary,
            size: .large,
            fullWidth: true,
            isLoading: isSigningIn
          ) {
            signIn()
          }
          .disabled(email.isEmpty || password.isEmpty)
        }
        .padding(AtomTokens.Space.x4)
      }
      .navigationBarTitleDisplayMode(.inline)
    }
  }

  private func signIn() {
    guard !isSigningIn else { return }
    isSigningIn = true

    Task {
      do {
        try await Task.sleep(for: .milliseconds(500))
      } catch is CancellationError {
        isSigningIn = false
        return
      } catch {
        assertionFailure("Unexpected sign-in delay failure: \(error)")
        isSigningIn = false
        return
      }
      model.signIn()
      isSigningIn = false
    }
  }
}
