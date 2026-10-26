import SwiftUI

/// One tab of an `AtomTabRow`: a label, an optional SF Symbol drawn over it, and
/// the selection value it stands for.
public struct AtomTab<Value: Hashable>: Identifiable {
  public let title: String
  public let systemImage: String?
  public let value: Value

  public var id: Value { value }

  public init(_ title: String, systemImage: String? = nil, value: Value) {
    self.title = title
    self.systemImage = systemImage
    self.value = value
  }
}

/// The underline tabs of the Tabs contract: a row of text tabs above the content
/// it selects. The selected tab reads text-primary over an accent bar and the
/// others text-secondary. The row scrolls sideways when the tabs do not fit and
/// keeps the selected tab in view. For a short second-level filter, use a
/// segmented `Picker` instead; for app-level sections, use `TabView`.
public struct AtomTabRow<Value: Hashable>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.colorSchemeContrast) private var accessibilityContrast
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference
  @Namespace private var indicator

  private let label: String
  @Binding private var selection: Value
  private let tabs: [AtomTab<Value>]

  /// - Parameters:
  ///   - label: Names the row for VoiceOver, such as "Project sections".
  ///   - selection: The value of the selected tab.
  ///   - tabs: The tabs, in reading order.
  public init(_ label: String, selection: Binding<Value>, tabs: [AtomTab<Value>]) {
    self.label = label
    _selection = selection
    self.tabs = tabs
  }

  public var body: some View {
    ScrollViewReader { proxy in
      ScrollView(.horizontal) {
        HStack(alignment: .bottom, spacing: 0) {
          ForEach(tabs) { tab in
            tabButton(tab)
              .id(tab.value)
          }
        }
        .padding(.horizontal, AtomTokens.Space.x1)
        .animation(AtomTabRowMotion.indicator(reduceMotion: reducesMotion), value: selection)
      }
      .scrollIndicators(.hidden)
      .scrollBounceBehavior(.basedOnSize, axes: .horizontal)
      .onAppear {
        proxy.scrollTo(selection, anchor: .center)
      }
      .onChange(of: selection) { _, value in
        withAnimation(AtomTabRowMotion.indicator(reduceMotion: reducesMotion)) {
          proxy.scrollTo(value, anchor: .center)
        }
      }
    }
    .background(alignment: .bottom) {
      Rectangle()
        .fill(theme.colors.borderSubtle.resolve(for: colorScheme))
        .frame(height: 1)
        .accessibilityHidden(true)
    }
    .accessibilityElement(children: .contain)
    .accessibilityLabel(label)
    .accessibilityAddTraits(.isTabBar)
  }

  private func tabButton(_ tab: AtomTab<Value>) -> some View {
    let isSelected = tab.value == selection
    return Button {
      select(tab.value)
    } label: {
      VStack(spacing: AtomTokens.Space.x1) {
        if let systemImage = tab.systemImage {
          Image(systemName: systemImage)
            .font(.title3)
            .accessibilityHidden(true)
        }
        Text(tab.title)
          .font(.subheadline.weight(.medium))
          .lineLimit(1)
          .fixedSize()
      }
      .foregroundStyle(
        (isSelected ? theme.colors.textPrimary : theme.colors.textSecondary)
          .resolve(for: colorScheme)
      )
      .padding(.horizontal, AtomTokens.Space.x3)
      .padding(.vertical, AtomTokens.Space.x2)
      .frame(minHeight: 44)
      .overlay(alignment: .bottom) {
        if isSelected {
          Capsule()
            .fill(theme.colors.actionPrimary.resolve(for: colorScheme))
            .frame(height: accessibilityContrast == .increased ? 3 : 2)
            .matchedGeometryEffect(id: "indicator", in: indicator)
            .accessibilityHidden(true)
        }
      }
      .contentShape(.rect)
    }
    .buttonStyle(.plain)
    .accessibilityLabel(tab.title)
    .accessibilityAddTraits(AtomTabRowMotion.traits(isSelected: isSelected))
  }

  /// Selects a tab. Selecting the tab that is already selected changes nothing.
  func select(_ value: Value) {
    guard value != selection else { return }
    selection = value
  }

  private var reducesMotion: Bool {
    motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
  }
}

enum AtomTabRowMotion {
  /// The indicator slides with the standard duration on the emphasized curve,
  /// and jumps under Reduce Motion.
  static func indicator(reduceMotion: Bool) -> Animation? {
    guard !reduceMotion else { return nil }
    let (x1, y1, x2, y2) = AtomTokens.Motion.emphasizedControlPoints
    return .timingCurve(x1, y1, x2, y2, duration: AtomTokens.Motion.standard)
  }

  static func traits(isSelected: Bool) -> AccessibilityTraits {
    isSelected ? [.isButton, .isSelected] : .isButton
  }
}
