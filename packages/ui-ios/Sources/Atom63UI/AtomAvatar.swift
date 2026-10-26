import SwiftUI

/// A marker pinned to an avatar's corner, the SwiftUI side of `AvatarBadge`. Each case carries
/// what VoiceOver reads after the name, such as "Online" or "3 unread messages".
public enum AtomAvatarBadge: Equatable, Sendable {
  /// A status dot at the bottom trailing corner.
  case dot(accessibilityLabel: String)
  /// A count at the top trailing corner; above 99 it reads "99+".
  case count(Int, accessibilityLabel: String)

  var accessibilityLabel: String {
    switch self {
    case .dot(let label), .count(_, let label):
      label
    }
  }

  /// The text a count badge draws; nil for a dot.
  var text: String? {
    guard case .count(let count, _) = self else { return nil }
    return count > 99 ? "99+" : "\(max(count, 0))"
  }
}

public struct AtomAvatar: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let name: String
  private let imageURL: URL?
  private let size: CGFloat
  private let badge: AtomAvatarBadge?

  public init(
    name: String,
    imageURL: URL? = nil,
    size: CGFloat = 44,
    badge: AtomAvatarBadge? = nil
  ) {
    self.name = name
    self.imageURL = imageURL
    self.size = size
    self.badge = badge
  }

  public var body: some View {
    Group {
      if let imageURL {
        AsyncImage(url: imageURL) { phase in
          switch phase {
          case .empty:
            fallback
              .redacted(reason: .placeholder)
          case .success(let image):
            image
              .resizable()
              .scaledToFill()
          case .failure:
            fallback
          @unknown default:
            fallback
          }
        }
      } else {
        fallback
      }
    }
    .frame(width: size, height: size)
    .compositingGroup()
    .clipShape(.circle)
    .accessibilityLabel(name)
    .accessibilityValue(badge?.accessibilityLabel ?? "")
    .overlay(alignment: badgeAlignment) {
      if let badge {
        // The avatar's own element reads the badge as its value.
        AtomAvatarBadgeView(badge: badge, avatarSize: size)
          .accessibilityHidden(true)
      }
    }
  }

  private var badgeAlignment: Alignment {
    if case .count = badge { .topTrailing } else { .bottomTrailing }
  }

  private var fallback: some View {
    Text(initials)
      .font(.system(size: size * 0.34, weight: .semibold, design: .rounded))
      .foregroundStyle(theme.colors.actionPrimaryForeground.resolve(for: colorScheme))
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(theme.colors.actionPrimary.resolve(for: colorScheme))
  }

  private var initials: String {
    name
      .split(separator: " ")
      .prefix(2)
      .compactMap(\.first)
      .map(String.init)
      .joined()
      .uppercased()
  }
}

/// The badge fill is the primary action color, ringed in the page surface so it reads against
/// the image, as on the web.
private struct AtomAvatarBadgeView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  let badge: AtomAvatarBadge
  let avatarSize: CGFloat

  private let ringWidth: CGFloat = 2

  var body: some View {
    switch badge {
    case .dot:
      Circle()
        .fill(fill)
        .frame(width: dotSize, height: dotSize)
        .padding(ringWidth)
        .background(Circle().fill(ring))
    case .count:
      Text(badge.text ?? "")
        .font(.caption2.weight(.semibold))
        .monospacedDigit()
        .dynamicTypeSize(...DynamicTypeSize.xxLarge)
        .foregroundStyle(theme.colors.actionPrimaryForeground.resolve(for: colorScheme))
        .padding(.horizontal, AtomTokens.Space.x1)
        .frame(minWidth: AtomTokens.Space.x4, minHeight: AtomTokens.Space.x4)
        .background(Capsule().fill(fill))
        .padding(ringWidth)
        .background(Capsule().fill(ring))
        .fixedSize()
    }
  }

  /// 8 points on avatars under 40 points, 12 from 40 points up.
  private var dotSize: CGFloat {
    avatarSize < AtomTokens.Control.Height.sm ? AtomTokens.Space.x2 : AtomTokens.Space.x3
  }

  private var fill: Color {
    theme.colors.actionPrimary.resolve(for: colorScheme)
  }

  private var ring: Color {
    theme.colors.surfacePage.resolve(for: colorScheme)
  }
}
