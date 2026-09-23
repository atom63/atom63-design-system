import SwiftUI

public struct AtomListRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

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
    badgeTone: AtomBadgeTone = .accent,
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
    HStack(spacing: AtomTokens.Space.x3) {
      Image(systemName: systemImage)
        .font(.headline)
        .foregroundStyle(theme.colors.actionPrimary.resolve(for: colorScheme))
        .frame(width: 32, height: 32)
        .background(theme.colors.surfaceMuted.resolve(for: colorScheme))
        .clipShape(.rect(cornerRadius: AtomTokens.Radius.medium))
        .accessibilityHidden(true)

      VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
        Text(title)
          .font(.body)
          .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

        if let subtitle {
          Text(subtitle)
            .font(.footnote)
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .lineLimit(2)
        }
      }

      Spacer(minLength: AtomTokens.Space.x2)

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
    .padding(.vertical, AtomTokens.Space.x1)
    .contentShape(.rect)
    .accessibilityElement(children: .combine)
  }
}
