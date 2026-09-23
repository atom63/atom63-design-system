import SwiftUI

#if canImport(UIKit)
  import UIKit
#endif

enum AtomAccessibility {
  @MainActor
  static func announce(_ message: String) {
    #if canImport(UIKit)
      guard UIAccessibility.isVoiceOverRunning else { return }
      UIAccessibility.post(notification: .announcement, argument: message)
    #endif
  }
}
