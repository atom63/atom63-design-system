import SwiftUI

public struct AtomListRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.atomDensity) private var density

  private let title: String
  private let subtitle: String?
  private let systemImage: String
  private let badge: String?
  private let badgeTone: AtomBadgeTone
  private let showsDisclosure: Bool

  public init(
    title: String,
    subtitle: String? = nil,
    systemImage: String,
    badge: String? = nil,
    badgeTone: AtomBadgeTone = .primary,
    showsDisclosure: Bool = false
  ) {
    self.title = title
    self.subtitle = subtitle
    self.systemImage = systemImage
    self.badge = badge
    self.badgeTone = badgeTone
    self.showsDisclosure = showsDisclosure
  }

  public var body: some View {
    HStack(spacing: density.space(AtomTokens.Space.x3)) {
      Image(systemName: systemImage)
        .font(.system(density.textStyle(.headline)))
        .foregroundStyle(theme.colors.actionPrimary.resolve(for: colorScheme))
        .frame(width: iconSize, height: iconSize)
        .background(theme.colors.surfaceMuted.resolve(for: colorScheme))
        .clipShape(.rect(cornerRadius: AtomTokens.Radius.medium))
        .accessibilityHidden(true)

      VStack(alignment: .leading, spacing: density.space(AtomTokens.Space.x1)) {
        Text(title)
          .font(.system(density.textStyle(.body)))
          .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

        if let subtitle {
          Text(subtitle)
            .font(.system(density.textStyle(.footnote)))
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .lineLimit(2)
        }
      }

      Spacer(minLength: density.space(AtomTokens.Space.x2))

      if let badge {
        AtomBadge(badge, tone: badgeTone)
      }

      if showsDisclosure {
        Image(systemName: "chevron.forward")
          .font(.footnote.weight(.semibold))
          .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
          .accessibilityHidden(true)
      }
    }
    .padding(.vertical, density.space(AtomTokens.Space.x1))
    .atomListRowInsets()
    .contentShape(.rect)
    .accessibilityElement(children: .combine)
  }

  /// The icon tile: 32pt, 28pt in compact.
  private var iconSize: CGFloat { density == .compact ? 28 : 32 }
}
