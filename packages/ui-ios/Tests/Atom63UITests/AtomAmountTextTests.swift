import Foundation
import SwiftUI
import Testing

@testable import Atom63UI

struct AtomAmountTextTests {
  private func split(_ amount: AtomAmount) -> [String] {
    amount.parts.map { $0.isFraction ? "[\($0.text)]" : $0.text }
  }

  @Test
  func dollarsDrawTheCentsAsTheFraction() {
    let amount = AtomAmount(13.25, currencyCode: "USD", locale: Locale(identifier: "en_US"))
    #expect(amount.formatted == "$13.25")
    #expect(split(amount) == ["$13", "[.25]"])
  }

  @Test
  func groupingStaysInTheIntegerPart() {
    let amount = AtomAmount(1234.5, currencyCode: "USD", locale: Locale(identifier: "en_US"))
    #expect(split(amount) == ["$1,234", "[.50]"])
  }

  @Test
  func germanEurosKeepTheSymbolAfterTheFraction() {
    let amount = AtomAmount(13.25, currencyCode: "EUR", locale: Locale(identifier: "de_DE"))
    #expect(amount.formatted == "13,25\u{00A0}€")
    #expect(split(amount) == ["13", "[,25]", "\u{00A0}€"])
  }

  @Test
  func yenHasNoFraction() {
    let amount = AtomAmount(1325, currencyCode: "JPY", locale: Locale(identifier: "ja_JP"))
    #expect(amount.parts.allSatisfy { !$0.isFraction })
    #expect(amount.formatted == amount.parts.map(\.text).joined())
  }

  @Test
  func rightToLeftLocalesSplitTheFractionToo() {
    for identifier in ["ar_EG", "he_IL"] {
      let amount = AtomAmount(13.25, currencyCode: "USD", locale: Locale(identifier: identifier))
      #expect(amount.parts.contains { $0.isFraction })
      #expect(amount.formatted == amount.parts.map(\.text).joined())
    }
  }

  @Test
  func theAccessibilityLabelIsTheWholeAmount() {
    let amount = AtomAmount(-13.25, currencyCode: "USD", locale: Locale(identifier: "en_US"))
    #expect(amount.formatted == "-$13.25")
    #expect(amount.formatted == amount.parts.map(\.text).joined())
  }

  @Test
  func theFractionIsHalfSizeAndRaised() {
    let amount = AtomAmount(13.25, currencyCode: "USD", locale: Locale(identifier: "en_US"))
    let attributed = amount.attributedString(size: AtomDisplayRole.display.size, weight: .semibold)
    let offsets = attributed.runs.map { $0[AttributeScopes.SwiftUIAttributes.BaselineOffsetAttribute.self] }
    #expect(offsets == [nil, 16])
  }

  @Test
  func baselineFractionsAreHalfSizeOnTheBaseline() {
    // The amount contract lists fractions raised and baseline; iOS mirrors them.
    #expect(AtomAmountFraction.allCases.map(\.rawValue) == ["raised", "baseline"])
    for identifier in ["en_US", "de_DE", "ar_EG"] {
      let amount = AtomAmount(13.25, currencyCode: "USD", locale: Locale(identifier: identifier))
      let size = AtomDisplayRole.display.size
      let attributed = amount.attributedString(size: size, weight: .semibold, fraction: .baseline)
      #expect(attributed.runs.allSatisfy {
        $0[AttributeScopes.SwiftUIAttributes.BaselineOffsetAttribute.self] == nil
      })
      #expect(attributed.runs.count == amount.parts.count)
      #expect(String(attributed.characters) == amount.formatted)
      let fractionFonts = zip(attributed.runs, amount.parts).filter { $0.1.isFraction }
        .map { $0.0[AttributeScopes.SwiftUIAttributes.FontAttribute.self] }
      #expect(!fractionFonts.isEmpty, "\(identifier)")
      #expect(fractionFonts.allSatisfy {
        $0 == Font.system(size: size * AtomTokens.AmountFraction.scale, weight: .semibold)
          .monospacedDigit()
      })
    }
  }

  @Test
  func displayRolesFollowTheWebScale() {
    #expect(AtomDisplayRole.display.size == 40)
    #expect(AtomDisplayRole.displayLarge.size == 56)
    #expect(AtomDisplayRole.allCases.allSatisfy { $0.textStyle == .largeTitle })
    #expect(AtomTokens.AmountFraction.scale == 0.5)
    #expect(AtomTokens.AmountFraction.raise == 0.8)
  }
}
