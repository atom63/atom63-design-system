import SwiftUI

public enum AtomFormPresentation: CaseIterable, Equatable, Sendable {
  case standalone
  case grouped
  case sheet
}

extension EnvironmentValues {
  @Entry public var atomFormPresentation: AtomFormPresentation = .standalone
}

extension View {
  public func atomFormPresentation(_ presentation: AtomFormPresentation) -> some View {
    environment(\.atomFormPresentation, presentation)
  }
}
