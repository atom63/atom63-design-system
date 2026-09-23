import SwiftUI

public enum AtomMotionPreference: Sendable {
  case system
  case reduced

  func resolvesReduceMotion(systemValue: Bool) -> Bool {
    switch self {
    case .system:
      systemValue
    case .reduced:
      true
    }
  }
}

extension EnvironmentValues {
  @Entry public var atomMotionPreference: AtomMotionPreference = .system
}

extension View {
  public func atomMotionPreference(_ preference: AtomMotionPreference) -> some View {
    environment(\.atomMotionPreference, preference)
  }
}
