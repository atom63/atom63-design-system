import SwiftUI
import Testing

@testable import Atom63UI

struct AtomDensityTests {
  @Test
  func regularLeavesEveryValueAlone() {
    let density = AtomDensity.regular
    #expect(density.space(AtomTokens.Space.x4) == 16)
    #expect(density.textStyle(.body) == .body)
    #expect(density.controlSize(.regular) == .regular)
    #expect(density.controlSize(.large) == .large)
  }

  @Test
  func compactScalesSpaceLikeTheWebDensityAxis() {
    // [data-a63-density='compact'] sets --a63-space-unit to 0.875 × the base unit.
    let density = AtomDensity.compact
    #expect(density.space(AtomTokens.Space.x4) == 14)
    #expect(density.space(AtomTokens.Space.x2) == 7)
  }

  @Test
  func compactStepsTextDownOneStyle() {
    let density = AtomDensity.compact
    #expect(density.textStyle(.headline) == .subheadline)
    #expect(density.textStyle(.body) == .subheadline)
    #expect(density.textStyle(.subheadline) == .footnote)
    #expect(density.textStyle(.footnote) == .caption)
    #expect(density.textStyle(.caption2) == .caption2)
  }

  @Test
  func compactDrawsButtonsOneSizeSmallerButKeepsIconButtons() {
    let density = AtomDensity.compact
    #expect(density.controlSize(.regular) == .compact)
    #expect(density.controlSize(.large) == .regular)
    #expect(density.controlSize(.compact) == .compact)
    // Icon buttons are already at the 44pt interaction floor in both axes.
    #expect(density.controlSize(.icon) == .icon)
  }

  @Test
  func theDefaultDensityIsRegular() {
    #expect(EnvironmentValues().atomDensity == .regular)
  }
}
