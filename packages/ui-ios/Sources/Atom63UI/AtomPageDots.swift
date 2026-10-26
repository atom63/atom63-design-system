import SwiftUI

/// A page indicator for a paged carousel: one dot per page, the current one a pill, and a tap
/// on a dot shows its page. The SwiftUI side of `CarouselDots`.
///
/// Page with a `TabView` and hide its own index, then bind the dots to the same selection:
///
/// ```swift
/// TabView(selection: $page) {
///   ForEach(slides.indices, id: \.self) { index in
///     SlideView(slides[index]).tag(index)
///   }
/// }
/// .tabViewStyle(.page(indexDisplayMode: .never))
/// AtomPageDots(count: slides.count, selection: $page)
/// ```
///
/// VoiceOver reads the dots as one adjustable element ("Slides, Slide 2 of 5"); swiping up or
/// down changes the page.
public struct AtomPageDots: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.accessibilityReduceMotion) private var systemReduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  @Binding private var selection: Int
  private let count: Int
  private let accessibilityLabel: String
  private let pageLabel: (Int, Int) -> String

  /// - Parameters:
  ///   - count: The number of pages.
  ///   - selection: The zero-based index of the current page.
  ///   - accessibilityLabel: The name of the indicator; "Slides" by default.
  ///   - pageLabel: The spoken position for a page index and the count; "Slide 2 of 5" by default.
  public init(
    count: Int,
    selection: Binding<Int>,
    accessibilityLabel: String = "Slides",
    pageLabel: @escaping (Int, Int) -> String = { index, count in
      "Slide \(index + 1) of \(count)"
    }
  ) {
    self.count = max(count, 0)
    _selection = selection
    self.accessibilityLabel = accessibilityLabel
    self.pageLabel = pageLabel
  }

  public var body: some View {
    HStack(spacing: 0) {
      ForEach(0..<count, id: \.self) { index in
        Button {
          selection = index
        } label: {
          Capsule()
            .fill(index == selection ? currentColor : restColor)
            .frame(
              width: index == selection ? AtomTokens.Space.x5 : AtomTokens.Space.x2,
              height: AtomTokens.Space.x2
            )
            .frame(
              width: AtomTokens.Control.minTouchTarget,
              height: AtomTokens.Control.minTouchTarget
            )
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
      }
    }
    .animation(
      reduceMotion ? nil : .easeOut(duration: AtomTokens.Motion.controlFeedback),
      value: selection
    )
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(accessibilityLabel)
    .accessibilityValue(count > 0 ? pageLabel(Self.page(selection, count: count), count) : "")
    .accessibilityAdjustableAction { direction in
      switch direction {
      case .increment:
        selection = Self.page(selection + 1, count: count)
      case .decrement:
        selection = Self.page(selection - 1, count: count)
      @unknown default:
        break
      }
    }
  }

  /// The page index clamped to the pages there are.
  static func page(_ index: Int, count: Int) -> Int {
    min(max(index, 0), max(count - 1, 0))
  }

  private var reduceMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: systemReduceMotion)
  }

  private var currentColor: Color {
    theme.colors.textPrimary.resolve(for: colorScheme)
  }

  private var restColor: Color {
    theme.colors.textSecondary.resolve(for: colorScheme).opacity(0.35)
  }
}
