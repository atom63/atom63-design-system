import SwiftUI

/// The toast's look. Mirrors the web Toaster's `variant` axis: `standard` is a
/// card on the panel surface with the symbol before the message; `inverse` is a
/// capsule in the inverse colours (dark in light mode, light in dark mode) with
/// the symbol after the message, for a short status such as "Scheduling message…".
public enum AtomToastVariant: String, CaseIterable, Sendable {
  case standard = "default"
  case inverse
}

/// What the toast reports. Mirrors the web Toaster's `tones`: `default` shows no
/// symbol unless you pass one, `loading` shows a spinner, and the others show
/// the semantic symbol of their tone.
public enum AtomToastTone: String, CaseIterable, Sendable {
  case `default`
  case info
  case success
  case warning
  case error
  case loading

  var semanticTone: AtomSemanticTone? {
    switch self {
    case .default, .loading: nil
    case .info: .info
    case .success: .success
    case .warning: .warning
    case .error: .error
    }
  }
}

public struct AtomToast: Equatable, Identifiable, Sendable {
  /// How long a toast stays when you do not pass a duration.
  public static let defaultDuration: Duration = .seconds(3)

  public let id: UUID
  public let message: String
  public let tone: AtomToastTone
  /// Replaces the tone's symbol; `nil` keeps it.
  public let systemImage: String?
  public let variant: AtomToastVariant
  /// How long the toast stays before it dismisses itself. `nil` keeps it until
  /// it is swiped away or replaced, as for a `.loading` toast you replace when
  /// the work finishes.
  public let duration: Duration?

  public init(
    id: UUID = UUID(),
    message: String,
    tone: AtomToastTone = .default,
    systemImage: String? = nil,
    variant: AtomToastVariant = .standard,
    duration: Duration? = AtomToast.defaultDuration
  ) {
    self.id = id
    self.message = message
    self.tone = tone
    self.systemImage = systemImage
    self.variant = variant
    self.duration = duration
  }
}

extension View {
  /// Presents `toast` at the top of this view. It dismisses itself after its
  /// `duration`, when it is swiped up, or with the VoiceOver escape gesture, and
  /// sets the binding to `nil`.
  public func atomToast(_ toast: Binding<AtomToast?>) -> some View {
    modifier(AtomToastModifier(toast: toast))
  }
}

private struct AtomToastModifier: ViewModifier {
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  @Binding var toast: AtomToast?

  func body(content: Content) -> some View {
    content
      .overlay(alignment: .top) {
        if let toast {
          AtomToastView(toast)
            .padding(.horizontal, AtomTokens.Space.x4)
            .padding(.top, AtomTokens.Space.x2)
            .gesture(
              DragGesture(minimumDistance: AtomTokens.Space.x2)
                .onEnded { value in
                  if value.translation.height < 0 {
                    dismiss(toast)
                  }
                }
            )
            .accessibilityAction(.escape) {
              dismiss(toast)
            }
            .onAppear {
              AtomAccessibility.announce(toast.message)
            }
            .transition(.move(edge: .top).combined(with: .opacity))
            .task(id: toast.id) {
              guard let duration = toast.duration else { return }
              do {
                try await Task.sleep(for: duration)
              } catch is CancellationError {
                return
              } catch {
                assertionFailure("Unexpected toast timer failure: \(error)")
                return
              }
              dismiss(toast)
            }
        }
      }
      .animation(
        effectiveReduceMotion ? nil : .easeOut(duration: AtomTokens.Motion.standard),
        value: toast
      )
  }

  /// Clears the binding only if it still holds this toast, not one that replaced it.
  private func dismiss(_ shown: AtomToast) {
    guard toast?.id == shown.id else { return }
    toast = nil
  }

  private var effectiveReduceMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
  }
}

/// One toast, without the presentation. `atomToast(_:)` shows it at the top of
/// a view and dismisses it; use the view directly to show a toast in place, as
/// a catalog or a preview does.
public struct AtomToastView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let toast: AtomToast

  public init(_ toast: AtomToast) {
    self.toast = toast
  }

  public var body: some View {
    Group {
      switch toast.variant {
      case .standard:
        standardToast
      case .inverse:
        inverseToast
      }
    }
    .font(.subheadline)
    .fontWeight(.semibold)
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(.isStaticText)
  }

  /// The web card: the symbol before the message, on the panel surface with a
  /// subtle border.
  private var standardToast: some View {
    let foreground = theme.colors.textPrimary.resolve(for: colorScheme)
    return HStack(alignment: .firstTextBaseline, spacing: AtomTokens.Space.x2) {
      symbol(tint: toast.tone.semanticTone?.tint(in: theme, colorScheme: colorScheme) ?? foreground)
      Text(toast.message)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .foregroundStyle(foreground)
    .padding(.horizontal, AtomTokens.Space.x4)
    .padding(.vertical, AtomTokens.Space.x3)
    .background(
      theme.colors.surfacePanel.resolve(for: colorScheme),
      in: .rect(cornerRadius: AtomTokens.Radius.large)
    )
    .overlay {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
        .strokeBorder(theme.colors.borderSubtle.resolve(for: colorScheme))
    }
    .shadow(radius: 8, y: 4)
  }

  /// The compact pill: the symbol after the message, in the inverse colours.
  private var inverseToast: some View {
    let foreground = theme.colors.actionNeutralForeground.resolve(for: colorScheme)
    return HStack(spacing: AtomTokens.Space.x2) {
      Text(toast.message)
      symbol(tint: foreground)
    }
    .foregroundStyle(foreground)
    .padding(.horizontal, AtomTokens.Space.x4)
    .padding(.vertical, AtomTokens.Space.x2)
    .background(theme.colors.actionNeutral.resolve(for: colorScheme), in: .capsule)
  }

  @ViewBuilder
  private func symbol(tint: Color) -> some View {
    if let systemImage = toast.systemImage ?? toast.tone.semanticTone?.systemImage {
      Image(systemName: systemImage)
        .foregroundStyle(tint)
        .accessibilityHidden(true)
    } else if toast.tone == .loading {
      ProgressView()
        .controlSize(.small)
        .tint(tint)
        .accessibilityHidden(true)
    }
  }
}
