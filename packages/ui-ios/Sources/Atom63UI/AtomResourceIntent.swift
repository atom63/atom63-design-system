public enum AtomResourceIntent: String, CaseIterable, Equatable, Sendable {
  case loading
  case content
  case empty
  case error
}

public enum AtomSyncIntent: String, CaseIterable, Equatable, Sendable {
  case idle
  case refreshing
  case synchronized
  case stale
  case offline
  case failed
}

public enum AtomPaginationIntent: String, CaseIterable, Equatable, Sendable {
  case idle
  case loadingMore = "loading"
  case failed
  case exhausted

  public var semanticTone: AtomSemanticTone {
    guard
      let rawTone = AtomComponentContracts.contract(catalogItem: "pagination")?
        .stateTones[rawValue],
      let tone = AtomSemanticTone(rawValue: rawTone)
    else {
      preconditionFailure("Missing pagination semantic tone for \(rawValue)")
    }
    return tone
  }
}
