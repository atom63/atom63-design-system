import SwiftUI

public struct AtomToast: Equatable, Identifiable, Sendable {
  public let id: UUID
  public let message: String
  public let systemImage: String

  public init(
    id: UUID = UUID(),
    message: String,
    systemImage: String = "checkmark.circle.fill"
  ) {
    self.id = id
    self.message = message
    self.systemImage = systemImage
  }
}

extension View {
  public func atomToast(_ toast: Binding<AtomToast?>) -> some View {
    modifier(AtomToastModifier(toast: toast))
  }
}

private struct AtomToastModifier: ViewModifier {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  @Binding var toast: AtomToast?

  func body(content: Content) -> some View {
    content
      .overlay(alignment: .top) {
        if let toast {
          toastView(toast)
            .padding(.horizontal, AtomTokens.Space.x4)
            .padding(.top, AtomTokens.Space.x2)
            .transition(.move(edge: .top).combined(with: .opacity))
            .task(id: toast.id) {
              do {
                try await Task.sleep(for: .seconds(3))
              } catch is CancellationError {
                return
              } catch {
                assertionFailure("Unexpected toast timer failure: \(error)")
                return
              }
              guard self.toast?.id == toast.id else { return }
              self.toast = nil
            }
        }
      }
      .animation(
        effectiveReduceMotion ? nil : .easeOut(duration: AtomTokens.Motion.standard),
        value: toast
      )
  }

  private var effectiveReduceMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
  }

  private func toastView(_ toast: AtomToast) -> some View {
    Label(toast.message, systemImage: toast.systemImage)
      .font(.subheadline)
      .fontWeight(.semibold)
      .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
      .padding(.horizontal, AtomTokens.Space.x4)
      .padding(.vertical, AtomTokens.Space.x3)
      .background(.regularMaterial)
      .overlay {
        Capsule()
          .strokeBorder(theme.colors.borderSubtle.resolve(for: colorScheme))
      }
      .clipShape(.capsule)
      .shadow(radius: 8, y: 4)
      .accessibilityAddTraits(.isStaticText)
      .onAppear {
        AtomAccessibility.announce(toast.message)
      }
  }
}
