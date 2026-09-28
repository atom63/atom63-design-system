import Atom63UI
import Foundation
import SwiftData
import SwiftUI
import TipKit

@main
struct Atom63DemoApp: App {
  private let modelContainer: ModelContainer
  private let remote: any ProjectRemoteDataSource

  init() {
    let environment = ProcessInfo.processInfo.environment
    // The inform spotlight is a TipKit tip. UI tests start with no tips closed.
    if environment["ATOM63_UI_TESTING"] == "1" { try? Tips.resetDatastore() }
    try? Tips.configure()
    remote =
      environment["ATOM63_UI_TESTING"] == "1"
      ? StaticProjectRemoteDataSource(projects: DemoProject.samples)
      : GitHubProjectRemoteDataSource()

    do {
      let isTesting =
        environment["XCTestConfigurationFilePath"] != nil
        || environment["ATOM63_UI_TESTING"] == "1"
      let configuration = ModelConfiguration(isStoredInMemoryOnly: isTesting)
      modelContainer = try ModelContainer(
        for: CachedProject.self,
        PendingProjectMutation.self,
        CachedProjectPagination.self,
        configurations: configuration
      )
    } catch {
      fatalError("Unable to create the project store: \(error)")
    }
  }

  var body: some Scene {
    WindowGroup {
      ReferenceApp(
        repository: ProjectRepository(
          remote: remote,
          cache: SwiftDataProjectCache(context: modelContainer.mainContext)
        )
      )
      .atomTheme(.standard)
      .modelContainer(modelContainer)
    }
  }
}
