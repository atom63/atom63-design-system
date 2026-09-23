import SwiftUI

private struct AtomSkeletonModifier: ViewModifier {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.layoutDirection) private var layoutDirection
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  let isActive: Bool

  @ViewBuilder
  func body(content: Content) -> some View {
    if isActive {
      content
        .redacted(reason: .placeholder)
        .overlay {
          skeletonSurface(mask: content.redacted(reason: .placeholder))
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    } else {
      content
    }
  }

  private func skeletonSurface<Mask: View>(mask: Mask) -> some View {
    GeometryReader { geometry in
      ZStack {
        Rectangle()
          .fill(theme.colors.surfaceMuted.resolve(for: colorScheme))

        if !effectiveReduceMotion {
          TimelineView(.animation(minimumInterval: 1 / 30)) { context in
            shimmer(in: geometry.size, at: context.date)
          }
        }
      }
      .mask(mask)
    }
    .allowsHitTesting(false)
  }

  private var effectiveReduceMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
  }

  private func shimmer(in size: CGSize, at date: Date) -> some View {
    let duration = AtomTokens.Motion.skeletonShimmer
    let phase = date.timeIntervalSinceReferenceDate
      .truncatingRemainder(dividingBy: duration) / duration
    let shimmerWidth = max(size.width * 0.65, 44)
    let travel = size.width + shimmerWidth
    let leadingOffset = -shimmerWidth + travel * phase
    let offset =
      layoutDirection == .rightToLeft
      ? size.width - travel * phase
      : leadingOffset

    return LinearGradient(
      colors: [
        .clear,
        theme.colors.skeletonHighlight.resolve(for: colorScheme),
        .clear,
      ],
      startPoint: .leading,
      endPoint: .trailing
    )
    .frame(width: shimmerWidth)
    .offset(x: offset)
  }
}

extension View {
  public func atomSkeleton(_ isActive: Bool = true) -> some View {
    modifier(AtomSkeletonModifier(isActive: isActive))
  }
}

public struct AtomSkeletonRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  public init() {}

  public var body: some View {
    HStack(spacing: AtomTokens.Space.x3) {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.medium)
        .fill(theme.colors.surfaceMuted.resolve(for: colorScheme))
        .frame(width: 40, height: 40)

      VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
        Text("Loading item title")
          .font(.body)
        Text("Loading supporting description")
          .font(.footnote)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .atomSkeleton()
  }
}
