import SwiftUI

public struct AtomAvatar: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let name: String
  private let imageURL: URL?
  private let size: CGFloat

  public init(name: String, imageURL: URL? = nil, size: CGFloat = 44) {
    self.name = name
    self.imageURL = imageURL
    self.size = size
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
