import Atom63UI
import Foundation
import Observation
import SwiftUI

struct ProjectSummary: Identifiable, Sendable {
  let id: UUID
  let name: String
  let summary: String
}

struct ProjectDraft: Sendable {
  let name: String
  let summary: String
}

protocol ProjectRepository: Sendable {
  func loadProjects() async throws -> [ProjectSummary]
  func saveProject(_ draft: ProjectDraft) async throws -> ProjectSummary
}

@MainActor
@Observable
final class ProjectFeatureModel {
  private let repository: any ProjectRepository

  private(set) var projects: [ProjectSummary] = []
  private(set) var resourceIntent: AtomResourceIntent = .loading
  var toast: AtomToast?

  init(repository: any ProjectRepository) {
    self.repository = repository
  }

  func load() async {
    resourceIntent = .loading
    do {
      projects = try await repository.loadProjects()
      resourceIntent = projects.isEmpty ? .empty : .content
    } catch {
      resourceIntent = .error
    }
  }

  func create(_ draft: ProjectDraft) async -> Bool {
    do {
      let project = try await repository.saveProject(draft)
      projects.append(project)
      resourceIntent = .content
      toast = AtomToast(message: "Project created")
      return true
    } catch {
      toast = AtomToast(
        message: "Couldn’t create project",
        systemImage: "exclamationmark.triangle"
      )
      return false
    }
  }
}

struct ProjectFeatureView: View {
  @Bindable var model: ProjectFeatureModel
  @State private var showsCreateSheet = false

  var body: some View {
    NavigationStack {
      content
        .navigationTitle("Projects")
        .toolbar {
          ToolbarItem(placement: .primaryAction) {
            Button("Add project", systemImage: "plus") {
              showsCreateSheet = true
            }
          }
        }
        .sheet(isPresented: $showsCreateSheet) {
          CreateProjectSheet(model: model)
        }
    }
    .task {
      await model.load()
    }
    .atomToast($model.toast)
  }

  @ViewBuilder
  private var content: some View {
    switch model.resourceIntent {
    case .loading:
      List(0..<3, id: \.self) { _ in
        AtomSkeletonRow()
      }
    case .content:
      List(model.projects) { project in
        AtomListRow(
          title: project.name,
          subtitle: project.summary,
          systemImage: "folder"
        )
      }
    case .empty:
      AtomContentStateView(
        title: "No projects",
        message: "Create the first project in this workspace.",
        systemImage: "folder.badge.plus",
        actionTitle: "Create project"
      ) {
        showsCreateSheet = true
      }
    case .error:
      AtomContentStateView(
        title: "Couldn’t load projects",
        message: "Check the connection and try again.",
        systemImage: "exclamationmark.triangle",
        tone: .error,
        actionTitle: "Try again"
      ) {
        Task {
          await model.load()
        }
      }
    }
  }
}

private struct CreateProjectSheet: View {
  @Environment(\.dismiss) private var dismiss
  let model: ProjectFeatureModel

  @State private var name = ""
  @State private var summary = ""
  @State private var isSaving = false

  var body: some View {
    NavigationStack {
      Form {
        AtomTextField("Name", text: $name, prompt: "Project name")
        AtomTextEditor(
          "Summary",
          text: $summary,
          prompt: "Describe the project outcome"
        )
      }
      .atomFormPresentation(.sheet)
      .scrollDismissesKeyboard(.interactively)
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .disabled(isSaving)
      .navigationTitle("New project")
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Cancel", action: dismiss.callAsFunction)
            .keyboardShortcut(.cancelAction)
            .disabled(isSaving)
        }
      }
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      AtomActionBar(
        primaryTitle: "Create project",
        isPrimaryLoading: isSaving
      ) {
        createProject()
      }
    }
    .interactiveDismissDisabled(isSaving)
  }

  private func createProject() {
    let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
    let trimmedSummary = summary.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedName.isEmpty, !trimmedSummary.isEmpty else { return }

    isSaving = true
    Task {
      let didCreate = await model.create(
        ProjectDraft(name: trimmedName, summary: trimmedSummary)
      )
      isSaving = false
      if didCreate {
        dismiss()
      }
    }
  }
}
