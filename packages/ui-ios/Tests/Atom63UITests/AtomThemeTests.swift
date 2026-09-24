import Testing
@testable import Atom63UI

struct AtomThemeTests {
  @Test func defaultSelectionIsTheStandardTheme() {
    #expect(AtomTheme() == AtomTheme.standard)
    #expect(AtomTheme(skin: .modern, brand: .b1, surface: .n1) == AtomTheme.standard)
  }

  @Test func everySelectionResolves() {
    var themes = 0
    for skin in AtomSkin.allCases {
      for brand in AtomBrand.allCases {
        for surface in AtomSurface.allCases {
          _ = AtomTheme(skin: skin, brand: brand, surface: surface)
          themes += 1
        }
      }
    }
    #expect(themes == 144)
  }

  @Test func selectionsChangeTheColors() {
    #expect(AtomTheme(brand: .b3).colors.actionPrimary != AtomTheme.standard.colors.actionPrimary)
    #expect(AtomTheme(surface: .n2).colors.surfacePage != AtomTheme.standard.colors.surfacePage)
    #expect(AtomTheme(skin: .terminal).colors.textPrimary != AtomTheme.standard.colors.textPrimary)
  }

  /// The Swift resolver agrees with Scripts/lib/theme-graph.mjs, which
  /// packages/styles checks against Chromium for every selection.
  @Test func matchesTheResolverFixture() throws {
    let rows = AtomThemeFixture.rows.split(separator: "\n")
    #expect(rows.count > 1000)
    var mismatches: [String] = []
    for row in rows {
      let fields = row.split(separator: " ").map(String.init)
      let skin = try #require(AtomSkin(rawValue: fields[0]))
      let brand = try #require(AtomBrand(rawValue: fields[1]))
      let surface = try #require(AtomSurface(rawValue: fields[2]))
      let dark = fields[3] == "dark"
      let expected = AtomColorComponents(
        red: try #require(Double(fields[5])),
        green: try #require(Double(fields[6])),
        blue: try #require(Double(fields[7])),
        opacity: try #require(Double(fields[8]))
      )
      let colors = AtomThemeColors(skin: skin, brand: brand, surface: surface)
      let color = try #require(field(fields[4], of: colors))
      let actual = dark ? color.dark : color.light
      if actual != expected { mismatches.append(String(row)) }
    }
    #expect(mismatches.isEmpty, "\(mismatches.prefix(5))")
  }

  private func field(_ name: String, of colors: AtomThemeColors) -> AtomDynamicColor? {
    let fields: [String: AtomDynamicColor] = [
      "surfacePage": colors.surfacePage,
      "surfacePanel": colors.surfacePanel,
      "surfaceMuted": colors.surfaceMuted,
      "surfaceControl": colors.surfaceControl,
      "textPrimary": colors.textPrimary,
      "textSecondary": colors.textSecondary,
      "borderSubtle": colors.borderSubtle,
      "borderControl": colors.borderControl,
      "actionPrimary": colors.actionPrimary,
      "actionPrimaryPressed": colors.actionPrimaryPressed,
      "actionPrimaryForeground": colors.actionPrimaryForeground,
      "actionNeutral": colors.actionNeutral,
      "actionNeutralForeground": colors.actionNeutralForeground,
      "actionDanger": colors.actionDanger,
      "actionDangerForeground": colors.actionDangerForeground,
      "statusInfo": colors.statusInfo,
      "statusSuccess": colors.statusSuccess,
      "statusWarning": colors.statusWarning,
      "selectionTrackOff": colors.selectionTrackOff,
      "selectionThumb": colors.selectionThumb,
      "skeletonHighlight": colors.skeletonHighlight,
    ]
    return fields[name]
  }
}
