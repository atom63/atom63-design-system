import SwiftUI

public struct AtomAsyncImage: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  private let url: URL?
  private let accessibilityLabel: String
  private let aspectRatio: CGFloat

  public init(
    url: URL?,
    accessibilityLabel: String,
    aspectRatio: CGFloat = 16 / 9
  ) {
    self.url = url
    self.accessibilityLabel = accessibilityLabel
    self.aspectRatio = aspectRatio
  }

  public var body: some View {
    Rectangle()
      .fill(theme.colors.surfaceMuted.resolve(for: colorScheme))
      .aspectRatio(aspectRatio, contentMode: .fit)
      .overlay {
        AsyncImage(url: url, transaction: transaction) { phase in
          switch phase {
          case .empty:
            placeholder
              .redacted(reason: .placeholder)
          case .success(let image):
            image
              .resizable()
              .scaledToFill()
              .frame(maxWidth: .infinity, maxHeight: .infinity)
              .transition(.opacity)
          case .failure:
            placeholder
          @unknown default:
            placeholder
          }
        }
      }
      .clipped()
      .compositingGroup()
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
      .accessibilityLabel(accessibilityLabel)
  }

  private var placeholder: some View {
    Image(systemName: "photo")
      .font(.title)
      .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
  }

  private var transaction: Transaction {
    var transaction = Transaction(
      animation: effectiveReduceMotion ? nil : .easeOut(duration: AtomTokens.Motion.standard)
    )
    transaction.disablesAnimations = effectiveReduceMotion
    return transaction
  }

  private var effectiveReduceMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
  }
}
