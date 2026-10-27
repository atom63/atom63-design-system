import SwiftUI

/// The toast's look. Mirrors the web Toaster's `variant` axis: `standard` is the
/// material capsule with the symbol before the message; `inverse` is a capsule
/// in the inverse colours (dark in light mode, light in dark mode) with the
/// symbol after the message, for a short status such as "Scheduling message…".
public enum AtomToastVariant: String, CaseIterable, Sendable {
  case standard = "default"
  case inverse
}

public struct AtomToast: Equatable, Identifiable, Sendable {
  public let id: UUID
  public let message: String
  public let systemImage: String
  public let variant: AtomToastVariant

  public init(
    id: UUID = UUID(),
    message: String,
    systemImage: String = "checkmark.circle.fill",
    variant: AtomToastVariant = .standard
  ) {
    self.id = id
    self.message = message
    self.systemImage = systemImage
    self.variant = variant
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

  @ViewBuilder
  private func toastView(_ toast: AtomToast) -> some View {
    switch toast.variant {
    case .standard:
      standardToast(toast)
    case .inverse:
      inverseToast(toast)
    }
  }

  private func inverseToast(_ toast: AtomToast) -> some View {
    HStack(spacing: AtomTokens.Space.x2) {
      Text(toast.message)
      Image(systemName: toast.systemImage)
        .accessibilityHidden(true)
    }
    .font(.subheadline)
    .fontWeight(.semibold)
    .foregroundStyle(theme.colors.actionNeutralForeground.resolve(for: colorScheme))
    .padding(.horizontal, AtomTokens.Space.x4)
    .padding(.vertical, AtomTokens.Space.x2)
    .background(theme.colors.actionNeutral.resolve(for: colorScheme), in: .capsule)
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(.isStaticText)
    .onAppear {
      AtomAccessibility.announce(toast.message)
    }
  }

  private func standardToast(_ toast: AtomToast) -> some View {
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
