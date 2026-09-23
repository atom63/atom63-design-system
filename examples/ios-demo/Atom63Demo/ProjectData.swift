import Atom63UI
import Foundation
import SwiftData

struct DemoProject: Codable, Hashable, Identifiable, Sendable {
  let id: String
  var title: String
  var summary: String
  var status: String
  var systemImage: String
  var imageURL: URL?

  static let samples = [
    DemoProject(
      id: "mobile-design-system",
      title: "Mobile design system",
      summary: "Shared semantics with native SwiftUI implementation.",
      status: "Active",
      systemImage: "square.stack.3d.up.fill",
      imageURL: URL(string: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200")
    ),
    DemoProject(
      id: "portfolio",
      title: "Portfolio",
      summary: "A spatial portfolio for design engineering work.",
      status: "Review",
      systemImage: "person.crop.rectangle.stack.fill",
      imageURL: URL(string: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200")
    ),
    DemoProject(
      id: "os63",
      title: "OS63",
      summary: "An expressive desktop environment built from shared primitives.",
      status: "Active",
      systemImage: "macwindow.on.rectangle",
      imageURL: URL(string: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200")
    ),
  ]
}

enum ProjectDataError: Error, Equatable, LocalizedError, Sendable {
  case invalidResponse
  case serverStatus(Int)
  case transport(URLError.Code)
  case decoding
  case persistence

  var errorDescription: String? {
    switch self {
    case .invalidResponse:
      "The server returned an invalid response."
    case .serverStatus(let status):
      "The server returned status \(status)."
    case .transport:
      "The network request failed."
    case .decoding:
      "The project response could not be read."
    case .persistence:
      "Saved projects could not be updated."
    }
  }

  static func map(_ error: Error) -> ProjectDataError {
    if let projectError = error as? ProjectDataError {
      return projectError
    }
    if let urlError = error as? URLError {
      return .transport(urlError.code)
    }
    if error is DecodingError {
      return .decoding
    }
    return .invalidResponse
  }
}

protocol ProjectRemoteDataSource: Sendable {
  func fetchProjects(page: Int) async throws -> ProjectPage
}

struct ProjectPage: Equatable, Sendable {
  let projects: [DemoProject]
  let nextPage: Int?
}

struct StaticProjectRemoteDataSource: ProjectRemoteDataSource {
  let projects: [DemoProject]
  var pageSize = 2

  func fetchProjects(page: Int) async throws -> ProjectPage {
    let startIndex = (page - 1) * pageSize
    guard startIndex < projects.count else {
      return ProjectPage(projects: [], nextPage: nil)
    }
    let endIndex = min(startIndex + pageSize, projects.count)
    return ProjectPage(
      projects: Array(projects[startIndex..<endIndex]),
      nextPage: endIndex < projects.count ? page + 1 : nil
    )
  }
}

@MainActor
protocol ProjectCaching: AnyObject {
  func load() throws -> [DemoProject]
  func replace(with projects: [DemoProject]) throws
  func merge(remoteProjects: [DemoProject]) throws -> [DemoProject]
  func upsertLocal(_ project: DemoProject) throws
  func deleteLocal(id: String) throws
  func hasPendingMutations() throws -> Bool
  func loadNextPage() throws -> Int?
  func saveNextPage(_ nextPage: Int?) throws
  func seedIfEmpty(with projects: [DemoProject]) throws
}

struct GitHubProjectRemoteDataSource: ProjectRemoteDataSource {
  private let owner: String
  private let pageSize: Int
  private let session: URLSession

  init(
    owner: String = "ATOM63",
    pageSize: Int = 6,
    session: URLSession = .shared
  ) {
    self.owner = owner
    self.pageSize = pageSize
    self.session = session
  }

  func fetchProjects(page: Int) async throws -> ProjectPage {
    var components = URLComponents(string: "https://api.github.com/users/\(owner)/repos")
    components?.queryItems = [
      URLQueryItem(name: "sort", value: "updated"),
      URLQueryItem(name: "per_page", value: String(pageSize)),
      URLQueryItem(name: "page", value: String(page)),
    ]
    guard let url = components?.url else {
      throw ProjectDataError.invalidResponse
    }

    var request = URLRequest(url: url)
    request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
    request.setValue("Atom63-iOS-Reference", forHTTPHeaderField: "User-Agent")

    let data: Data
    let response: URLResponse
    do {
      (data, response) = try await session.data(for: request)
    } catch {
      throw ProjectDataError.map(error)
    }

    guard let httpResponse = response as? HTTPURLResponse else {
      throw ProjectDataError.invalidResponse
    }
    guard (200..<300).contains(httpResponse.statusCode) else {
      throw ProjectDataError.serverStatus(httpResponse.statusCode)
    }

    do {
      let projects = try JSONDecoder()
        .decode([GitHubRepository].self, from: data)
        .filter { !$0.isFork }
        .map(\.project)
      return ProjectPage(
        projects: projects,
        nextPage: httpResponse.value(forHTTPHeaderField: "Link")?.contains("rel=\"next\"") == true
          ? page + 1
          : nil
      )
    } catch {
      throw ProjectDataError.map(error)
    }
  }
}

private struct GitHubRepository: Decodable {
  let id: Int
  let name: String
  let description: String?
  let isArchived: Bool
  let isFork: Bool

  enum CodingKeys: String, CodingKey {
    case id
    case name
    case description
    case isArchived = "archived"
    case isFork = "fork"
  }

  var project: DemoProject {
    DemoProject(
      id: "github-\(id)",
      title: name,
      summary: description ?? "Atom63 project",
      status: isArchived ? "Archived" : "Active",
      systemImage: isArchived ? "archivebox.fill" : "shippingbox.fill",
      imageURL: nil
    )
  }
}

@Model
final class CachedProject {
  @Attribute(.unique) var id: String
  var title: String
  var summary: String
  var status: String
  var systemImage: String
  var imageURLString: String?
  var sortIndex: Int

  init(project: DemoProject, sortIndex: Int) {
    id = project.id
    title = project.title
    summary = project.summary
    status = project.status
    systemImage = project.systemImage
    imageURLString = project.imageURL?.absoluteString
    self.sortIndex = sortIndex
  }

  var project: DemoProject {
    DemoProject(
      id: id,
      title: title,
      summary: summary,
      status: status,
      systemImage: systemImage,
      imageURL: imageURLString.flatMap(URL.init(string:))
    )
  }

  func update(with project: DemoProject, sortIndex: Int) {
    title = project.title
    summary = project.summary
    status = project.status
    systemImage = project.systemImage
    imageURLString = project.imageURL?.absoluteString
    self.sortIndex = sortIndex
  }
}

private enum ProjectMutationKind: String {
  case upsert
  case delete
}

@Model
final class PendingProjectMutation {
  @Attribute(.unique) var projectID: String
  var kindRawValue: String
  var title: String?
  var summary: String?
  var status: String?
  var systemImage: String?
  var imageURLString: String?
  var updatedAt: Date

  init(upserting project: DemoProject, updatedAt: Date = .now) {
    projectID = project.id
    kindRawValue = ProjectMutationKind.upsert.rawValue
    title = project.title
    summary = project.summary
    status = project.status
    systemImage = project.systemImage
    imageURLString = project.imageURL?.absoluteString
    self.updatedAt = updatedAt
  }

  init(deletingProjectID projectID: String, updatedAt: Date = .now) {
    self.projectID = projectID
    kindRawValue = ProjectMutationKind.delete.rawValue
    title = nil
    summary = nil
    status = nil
    systemImage = nil
    imageURLString = nil
    self.updatedAt = updatedAt
  }

  fileprivate var kind: ProjectMutationKind? {
    ProjectMutationKind(rawValue: kindRawValue)
  }

  var project: DemoProject? {
    guard
      kind == .upsert,
      let title,
      let summary,
      let status,
      let systemImage
    else {
      return nil
    }

    return DemoProject(
      id: projectID,
      title: title,
      summary: summary,
      status: status,
      systemImage: systemImage,
      imageURL: imageURLString.flatMap(URL.init(string:))
    )
  }

  func update(upserting project: DemoProject, updatedAt: Date = .now) {
    kindRawValue = ProjectMutationKind.upsert.rawValue
    title = project.title
    summary = project.summary
    status = project.status
    systemImage = project.systemImage
    imageURLString = project.imageURL?.absoluteString
    self.updatedAt = updatedAt
  }

  func updateForDeletion(updatedAt: Date = .now) {
    kindRawValue = ProjectMutationKind.delete.rawValue
    title = nil
    summary = nil
    status = nil
    systemImage = nil
    imageURLString = nil
    self.updatedAt = updatedAt
  }
}

@Model
final class CachedProjectPagination {
  @Attribute(.unique) var id: String
  var nextPage: Int?

  init(nextPage: Int?) {
    id = "projects"
    self.nextPage = nextPage
  }
}

@MainActor
final class SwiftDataProjectCache: ProjectCaching {
  private let context: ModelContext

  init(context: ModelContext) {
    self.context = context
  }

  func load() throws -> [DemoProject] {
    do {
      let descriptor = FetchDescriptor<CachedProject>(
        sortBy: [SortDescriptor(\.sortIndex)]
      )
      return try context.fetch(descriptor).map(\.project)
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func replace(with projects: [DemoProject]) throws {
    do {
      let cachedProjects = try context.fetch(FetchDescriptor<CachedProject>())
      let projectIDs = Set(projects.map(\.id))
      let cachedByID = Dictionary(uniqueKeysWithValues: cachedProjects.map { ($0.id, $0) })

      for (index, project) in projects.enumerated() {
        if let cached = cachedByID[project.id] {
          cached.update(with: project, sortIndex: index)
        } else {
          context.insert(CachedProject(project: project, sortIndex: index))
        }
      }

      for cached in cachedProjects where !projectIDs.contains(cached.id) {
        context.delete(cached)
      }
      try context.save()
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func merge(remoteProjects: [DemoProject]) throws -> [DemoProject] {
    do {
      let descriptor = FetchDescriptor<PendingProjectMutation>(
        sortBy: [
          SortDescriptor(\.updatedAt),
          SortDescriptor(\.projectID),
        ]
      )
      let mutations = try context.fetch(descriptor)
      var mergedProjects = remoteProjects

      for mutation in mutations {
        switch mutation.kind {
        case .upsert:
          guard let project = mutation.project else {
            throw ProjectDataError.persistence
          }
          mergedProjects.removeAll { $0.id == mutation.projectID }
          mergedProjects.insert(project, at: 0)
        case .delete:
          mergedProjects.removeAll { $0.id == mutation.projectID }
        case nil:
          throw ProjectDataError.persistence
        }
      }

      try replace(with: mergedProjects)
      return mergedProjects
    } catch let error as ProjectDataError {
      throw error
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func upsertLocal(_ project: DemoProject) throws {
    do {
      try recordMutation(for: project.id) { mutation in
        if let mutation {
          mutation.update(upserting: project)
        } else {
          context.insert(PendingProjectMutation(upserting: project))
        }
      }
      var projects = try load().filter { $0.id != project.id }
      projects.insert(project, at: 0)
      try replace(with: projects)
    } catch {
      context.rollback()
      throw ProjectDataError.persistence
    }
  }

  func deleteLocal(id: String) throws {
    do {
      try recordMutation(for: id) { mutation in
        if let mutation {
          mutation.updateForDeletion()
        } else {
          context.insert(PendingProjectMutation(deletingProjectID: id))
        }
      }
      try replace(with: load().filter { $0.id != id })
    } catch {
      context.rollback()
      throw ProjectDataError.persistence
    }
  }

  func hasPendingMutations() throws -> Bool {
    do {
      var descriptor = FetchDescriptor<PendingProjectMutation>()
      descriptor.fetchLimit = 1
      return try !context.fetch(descriptor).isEmpty
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func loadNextPage() throws -> Int? {
    do {
      return try context.fetch(FetchDescriptor<CachedProjectPagination>()).first?.nextPage
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func saveNextPage(_ nextPage: Int?) throws {
    do {
      if let pagination = try context.fetch(FetchDescriptor<CachedProjectPagination>()).first {
        pagination.nextPage = nextPage
      } else {
        context.insert(CachedProjectPagination(nextPage: nextPage))
      }
      try context.save()
    } catch {
      throw ProjectDataError.persistence
    }
  }

  func seedIfEmpty(with projects: [DemoProject]) throws {
    guard try load().isEmpty, !(try hasPendingMutations()) else { return }
    try replace(with: projects)
  }

  private func recordMutation(
    for projectID: String,
    update: (PendingProjectMutation?) -> Void
  ) throws {
    do {
      let descriptor = FetchDescriptor<PendingProjectMutation>(
        predicate: #Predicate { $0.projectID == projectID }
      )
      update(try context.fetch(descriptor).first)
    } catch {
      throw ProjectDataError.persistence
    }
  }
}

struct ProjectLoadResult: Equatable, Sendable {
  let projects: [DemoProject]
  let syncIntent: AtomSyncIntent
  let paginationIntent: AtomPaginationIntent
}

@MainActor
final class ProjectRepository {
  private let remote: any ProjectRemoteDataSource
  private let cache: any ProjectCaching
  private var isLoadingNextPage = false
  private var paginationGeneration = 0

  init(
    remote: any ProjectRemoteDataSource,
    cache: any ProjectCaching
  ) {
    self.remote = remote
    self.cache = cache
  }

  func seedIfNeeded() throws {
    try cache.seedIfEmpty(with: DemoProject.samples)
  }

  func cachedProjects() throws -> [DemoProject] {
    try cache.load()
  }

  func load() async throws -> ProjectLoadResult {
    paginationGeneration += 1
    let remotePage: ProjectPage
    do {
      remotePage = try await remote.fetchProjects(page: 1)
    } catch is CancellationError {
      throw CancellationError()
    } catch let error as ProjectDataError where error == .transport(.cancelled) {
      throw CancellationError()
    } catch {
      let remoteError = ProjectDataError.map(error)
      let cachedProjects = try cache.load()
      let hasPendingMutations = try cache.hasPendingMutations()
      guard !cachedProjects.isEmpty || hasPendingMutations else {
        throw remoteError
      }
      return ProjectLoadResult(
        projects: cachedProjects,
        syncIntent: .offline,
        paginationIntent: try cache.loadNextPage() == nil ? .exhausted : .idle
      )
    }

    let projects = try cache.merge(remoteProjects: remotePage.projects)
    try cache.saveNextPage(remotePage.nextPage)
    let syncIntent: AtomSyncIntent =
      try cache.hasPendingMutations() ? .stale : .synchronized
    return ProjectLoadResult(
      projects: projects,
      syncIntent: syncIntent,
      paginationIntent: remotePage.nextPage == nil ? .exhausted : .idle
    )
  }

  func loadNextPage() async throws -> ProjectLoadResult? {
    guard !isLoadingNextPage else { return nil }
    guard let nextPage = try cache.loadNextPage() else {
      return ProjectLoadResult(
        projects: try cache.load(),
        syncIntent: try cache.hasPendingMutations() ? .stale : .synchronized,
        paginationIntent: .exhausted
      )
    }

    isLoadingNextPage = true
    defer { isLoadingNextPage = false }
    let generation = paginationGeneration

    let remotePage: ProjectPage
    do {
      remotePage = try await remote.fetchProjects(page: nextPage)
    } catch is CancellationError {
      throw CancellationError()
    } catch let error as ProjectDataError where error == .transport(.cancelled) {
      throw CancellationError()
    } catch {
      throw ProjectDataError.map(error)
    }
    guard generation == paginationGeneration else {
      throw CancellationError()
    }

    let cachedProjects = try cache.load()
    let existingIDs = Set(cachedProjects.map(\.id))
    let appendedProjects =
      cachedProjects
      + remotePage.projects.filter { !existingIDs.contains($0.id) }
    let projects = try cache.merge(remoteProjects: appendedProjects)
    try cache.saveNextPage(remotePage.nextPage)
    return ProjectLoadResult(
      projects: projects,
      syncIntent: try cache.hasPendingMutations() ? .stale : .synchronized,
      paginationIntent: remotePage.nextPage == nil ? .exhausted : .idle
    )
  }

  func upsert(_ project: DemoProject) throws {
    try cache.upsertLocal(project)
  }

  func delete(_ project: DemoProject) throws {
    try cache.deleteLocal(id: project.id)
  }
}
