import SwiftUI

public enum AtomSemanticTone: String, CaseIterable, Sendable {
  case neutral
  case info
  case success
  case warning
  case error
}

extension AtomSemanticTone {
  func tint(in theme: AtomTheme, colorScheme: ColorScheme) -> Color {
    switch self {
    case .neutral:
      theme.colors.textSecondary.resolve(for: colorScheme)
    case .info:
      theme.colors.statusInfo.resolve(for: colorScheme)
    case .success:
      theme.colors.statusSuccess.resolve(for: colorScheme)
    case .warning:
      theme.colors.statusWarning.resolve(for: colorScheme)
    case .error:
      theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }

  var accessibilityLabel: String {
    switch self {
    case .neutral:
      "Status"
    case .info:
      "Information"
    case .success:
      "Success"
    case .warning:
      "Warning"
    case .error:
      "Error"
    }
  }

  var systemImage: String {
    switch self {
    case .neutral:
      "circle.fill"
    case .info:
      "info.circle.fill"
    case .success:
      "checkmark.circle.fill"
    case .warning:
      "exclamationmark.triangle.fill"
    case .error:
      "xmark.octagon.fill"
    }
  }
}
