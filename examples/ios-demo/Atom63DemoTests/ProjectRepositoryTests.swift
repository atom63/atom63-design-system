import Foundation
import SwiftData
import XCTest

@testable import Atom63Demo

@MainActor
final class ProjectRepositoryTests: XCTestCase {
  func testRemoteSuccessReplacesCacheAndSynchronizes() async throws {
    let remoteProjects = [DemoProject.samples[1]]
    let cache = InMemoryProjectCache(projects: DemoProject.samples)
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .success(remoteProjects)),
      cache: cache
    )

    let result = try await repository.load()

    XCTAssertEqual(result.projects, remoteProjects)
    XCTAssertEqual(result.syncIntent, .synchronized)
    XCTAssertEqual(result.paginationIntent, .exhausted)
    XCTAssertEqual(try cache.load(), remoteProjects)
  }

  func testRemoteRefreshPreservesPendingLocalUpsertAsStale() async throws {
    let localProject = DemoProject(
      id: "local",
      title: "Local project",
      summary: "Waiting for a writable remote.",
      status: "Draft",
      systemImage: "internaldrive",
      imageURL: nil
    )
    let cache = InMemoryProjectCache(projects: DemoProject.samples)
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .success([DemoProject.samples[1]])),
      cache: cache
    )
    try repository.upsert(localProject)

    let result = try await repository.load()

    XCTAssertEqual(result.projects, [localProject, DemoProject.samples[1]])
    XCTAssertEqual(result.syncIntent, .stale)
    XCTAssertEqual(try cache.load(), result.projects)
  }

  func testRemoteRefreshPreservesPendingLocalDeleteAsStale() async throws {
    let deletedProject = DemoProject.samples[0]
    let cache = InMemoryProjectCache(projects: DemoProject.samples)
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .success(DemoProject.samples)),
      cache: cache
    )
    try repository.delete(deletedProject)

    let result = try await repository.load()

    XCTAssertFalse(result.projects.contains(deletedProject))
    XCTAssertEqual(result.syncIntent, .stale)
  }

  func testRemoteFailureReturnsCachedProjectsAsOffline() async throws {
    let cache = InMemoryProjectCache(projects: DemoProject.samples, nextPage: 2)
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .failure(.transport(.notConnectedToInternet))),
      cache: cache
    )

    let result = try await repository.load()

    XCTAssertEqual(result.projects, DemoProject.samples)
    XCTAssertEqual(result.syncIntent, .offline)
    XCTAssertEqual(result.paginationIntent, .idle)
  }

  func testRemoteFailureWithoutCacheSurfacesTypedError() async {
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .failure(.serverStatus(503))),
      cache: InMemoryProjectCache()
    )

    do {
      _ = try await repository.load()
      XCTFail("Expected a typed server error")
    } catch {
      XCTAssertEqual(error as? ProjectDataError, .serverStatus(503))
    }
  }

  func testRemoteFailureWithPendingDeleteReturnsEmptyOfflineState() async throws {
    let project = DemoProject.samples[0]
    let cache = InMemoryProjectCache(projects: [project])
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .failure(.transport(.notConnectedToInternet))),
      cache: cache
    )
    try repository.delete(project)

    let result = try await repository.load()

    XCTAssertTrue(result.projects.isEmpty)
    XCTAssertEqual(result.syncIntent, .offline)
  }

  func testSeedDoesNotResurrectPendingLocalDelete() throws {
    let project = DemoProject.samples[0]
    let cache = InMemoryProjectCache(projects: [project])
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .success([])),
      cache: cache
    )
    try repository.delete(project)

    try repository.seedIfNeeded()

    XCTAssertTrue(try repository.cachedProjects().isEmpty)
  }

  func testCancelledRefreshPropagatesCancellation() async {
    let repository = ProjectRepository(
      remote: StubProjectRemote(result: .failure(.transport(.cancelled))),
      cache: InMemoryProjectCache(projects: DemoProject.samples)
    )

    do {
      _ = try await repository.load()
      XCTFail("Expected cancellation to propagate")
    } catch {
      XCTAssertTrue(error is CancellationError)
    }
  }

  func testSwiftDataCachePersistsProjectMutations() throws {
    let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try ModelContainer(
      for: CachedProject.self,
      PendingProjectMutation.self,
      CachedProjectPagination.self,
      configurations: configuration
    )
    let cache = SwiftDataProjectCache(context: container.mainContext)

    try cache.replace(with: DemoProject.samples)
    XCTAssertEqual(try cache.load(), DemoProject.samples)

    let localProject = DemoProject(
      id: "local-test",
      title: "Local test",
      summary: "Persisted through SwiftData.",
      status: "Draft",
      systemImage: "internaldrive",
      imageURL: nil
    )
    try cache.upsertLocal(localProject)
    XCTAssertEqual(try cache.load().first, localProject)
    XCTAssertTrue(try cache.hasPendingMutations())

    try cache.deleteLocal(id: localProject.id)
    XCTAssertFalse(try cache.load().contains(localProject))

    let mergedProjects = try cache.merge(remoteProjects: [localProject])
    XCTAssertFalse(mergedProjects.contains(localProject))

    try cache.seedIfEmpty(with: DemoProject.samples)
    XCTAssertTrue(try cache.load().isEmpty)
  }

  func testSwiftDataOutboxCompactsMutationsByProject() throws {
    let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try ModelContainer(
      for: CachedProject.self,
      PendingProjectMutation.self,
      CachedProjectPagination.self,
      configurations: configuration
    )
    let cache = SwiftDataProjectCache(context: container.mainContext)
    let project = DemoProject.samples[0]

    try cache.upsertLocal(project)
    try cache.deleteLocal(id: project.id)
    try cache.upsertLocal(project)

    let mutations = try container.mainContext.fetch(
      FetchDescriptor<PendingProjectMutation>()
    )
    XCTAssertEqual(mutations.count, 1)
    XCTAssertEqual(mutations.first?.project, project)
  }

  func testURLSessionRemoteDecodesGitHubRepositories() async throws {
    let configuration = URLSessionConfiguration.ephemeral
    configuration.protocolClasses = [StubURLProtocol.self]
    let session = URLSession(configuration: configuration)
    StubURLProtocol.handler = { request in
      guard let url = request.url else {
        throw ProjectDataError.invalidResponse
      }
      let response = try XCTUnwrap(
        HTTPURLResponse(
          url: url,
          statusCode: 200,
          httpVersion: nil,
          headerFields: [
            "Content-Type": "application/json",
            "Link": "<https://api.github.com/users/ATOM63/repos?page=2>; rel=\"next\"",
          ]
        )
      )
      let data = Data(
        """
        [
          {
            "id": 63,
            "name": "atom63-mobile",
            "description": "Native mobile system",
            "archived": false,
            "fork": false
          }
        ]
        """.utf8
      )
      return (response, data)
    }
    defer {
      StubURLProtocol.handler = nil
      session.invalidateAndCancel()
    }

    let page = try await GitHubProjectRemoteDataSource(
      owner: "ATOM63",
      session: session
    ).fetchProjects(page: 1)

    XCTAssertEqual(page.projects.count, 1)
    XCTAssertEqual(page.projects.first?.id, "github-63")
    XCTAssertEqual(page.projects.first?.status, "Active")
    XCTAssertEqual(page.nextPage, 2)
  }

  func testLoadNextPageAppendsAndStablyDeduplicates() async throws {
    let first = DemoProject.samples[0]
    let second = DemoProject.samples[1]
    let third = DemoProject.samples[2]
    let cache = InMemoryProjectCache()
    let repository = ProjectRepository(
      remote: StubProjectRemote(
        pages: [
          1: .success(ProjectPage(projects: [first, second], nextPage: 2)),
          2: .success(ProjectPage(projects: [second, third], nextPage: nil)),
        ]
      ),
      cache: cache
    )

    let initialResult = try await repository.load()
    let loadedNextPage = try await repository.loadNextPage()
    let appendedResult = try XCTUnwrap(loadedNextPage)

    XCTAssertEqual(initialResult.paginationIntent, .idle)
    XCTAssertEqual(appendedResult.projects, [first, second, third])
    XCTAssertEqual(appendedResult.paginationIntent, .exhausted)
    XCTAssertNil(try cache.loadNextPage())
  }

  func testLoadNextPageFailurePreservesLoadedContentAndCursor() async throws {
    let first = DemoProject.samples[0]
    let cache = InMemoryProjectCache()
    let repository = ProjectRepository(
      remote: StubProjectRemote(
        pages: [
          1: .success(ProjectPage(projects: [first], nextPage: 2)),
          2: .failure(.serverStatus(503)),
        ]
      ),
      cache: cache
    )
    _ = try await repository.load()

    do {
      _ = try await repository.loadNextPage()
      XCTFail("Expected the next page to fail")
    } catch {
      XCTAssertEqual(error as? ProjectDataError, .serverStatus(503))
    }

    XCTAssertEqual(try cache.load(), [first])
    XCTAssertEqual(try cache.loadNextPage(), 2)
  }

  func testLoadNextPageReappliesPendingMutations() async throws {
    let localProject = DemoProject(
      id: "local",
      title: "Local project",
      summary: "Pending upload",
      status: "Draft",
      systemImage: "internaldrive",
      imageURL: nil
    )
    let first = DemoProject.samples[0]
    let deletedLaterProject = DemoProject.samples[2]
    let cache = InMemoryProjectCache()
    let repository = ProjectRepository(
      remote: StubProjectRemote(
        pages: [
          1: .success(ProjectPage(projects: [first], nextPage: 2)),
          2: .success(ProjectPage(projects: [deletedLaterProject], nextPage: nil)),
        ]
      ),
      cache: cache
    )
    try repository.upsert(localProject)
    try repository.delete(deletedLaterProject)

    _ = try await repository.load()
    let loadedNextPage = try await repository.loadNextPage()
    let result = try XCTUnwrap(loadedNextPage)

    XCTAssertEqual(result.projects, [localProject, first])
    XCTAssertEqual(result.syncIntent, .stale)
  }
}

private struct StubProjectRemote: ProjectRemoteDataSource {
  let pages: [Int: Result<ProjectPage, ProjectDataError>]

  init(result: Result<[DemoProject], ProjectDataError>) {
    pages = [
      1: result.map { ProjectPage(projects: $0, nextPage: nil) }
    ]
  }

  init(pages: [Int: Result<ProjectPage, ProjectDataError>]) {
    self.pages = pages
  }

  func fetchProjects(page: Int) async throws -> ProjectPage {
    try pages[page, default: .success(ProjectPage(projects: [], nextPage: nil))].get()
  }
}

@MainActor
private final class InMemoryProjectCache: ProjectCaching {
  private var projects: [DemoProject]
  private var nextPage: Int?
  private var mutations: [String: Mutation] = [:]
  private var mutationOrder: [String] = []

  init(projects: [DemoProject] = [], nextPage: Int? = nil) {
    self.projects = projects
    self.nextPage = nextPage
  }

  func load() throws -> [DemoProject] {
    projects
  }

  func replace(with projects: [DemoProject]) throws {
    self.projects = projects
  }

  func merge(remoteProjects: [DemoProject]) throws -> [DemoProject] {
    projects = remoteProjects
    for projectID in mutationOrder {
      projects.removeAll { $0.id == projectID }
      if case .upsert(let project) = mutations[projectID] {
        projects.insert(project, at: 0)
      }
    }
    return projects
  }

  func upsertLocal(_ project: DemoProject) throws {
    mutationOrder.removeAll { $0 == project.id }
    mutationOrder.append(project.id)
    mutations[project.id] = .upsert(project)
    projects.removeAll { $0.id == project.id }
    projects.insert(project, at: 0)
  }

  func deleteLocal(id: String) throws {
    mutationOrder.removeAll { $0 == id }
    mutationOrder.append(id)
    mutations[id] = .delete
    projects.removeAll { $0.id == id }
  }

  func hasPendingMutations() throws -> Bool {
    !mutations.isEmpty
  }

  func loadNextPage() throws -> Int? {
    nextPage
  }

  func saveNextPage(_ nextPage: Int?) throws {
    self.nextPage = nextPage
  }

  func seedIfEmpty(with projects: [DemoProject]) throws {
    guard self.projects.isEmpty, mutations.isEmpty else { return }
    self.projects = projects
  }

  private enum Mutation {
    case upsert(DemoProject)
    case delete
  }
}

private final class StubURLProtocol: URLProtocol, @unchecked Sendable {
  nonisolated(unsafe) static var handler:
    (@Sendable (URLRequest) throws -> (HTTPURLResponse, Data))?

  override class func canInit(with request: URLRequest) -> Bool {
    true
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    request
  }

  override func startLoading() {
    guard let handler = Self.handler else {
      client?.urlProtocol(
        self,
        didFailWithError: ProjectDataError.invalidResponse
      )
      return
    }

    do {
      let (response, data) = try handler(request)
      client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
      client?.urlProtocol(self, didLoad: data)
      client?.urlProtocolDidFinishLoading(self)
    } catch {
      client?.urlProtocol(self, didFailWithError: error)
    }
  }

  override func stopLoading() {}
}
