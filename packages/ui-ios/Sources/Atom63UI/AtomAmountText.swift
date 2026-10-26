import SwiftUI

// AtomDisplayRole and AtomTokens.AmountFraction are generated from the display
// text roles and the amount-fraction utility in Atom63Tokens.generated.swift.

/// A money amount in a display role, as banking and pricing screens draw a
/// balance: "$13.25" with the integer part at the role size and the fraction
/// (".25") smaller and raised, like the web's `text-display` with `amount-fraction`.
///
/// The amount is formatted for the locale with `FormatStyle.Currency`, drawn with
/// monospaced digits, scales with Dynamic Type and reads as one accessibility
/// label. It takes the foreground style around it.
public struct AtomAmountText: View {
  @Environment(\.locale) private var environmentLocale
  @ScaledMetric private var size: Double

  private let value: Decimal
  private let currencyCode: String
  private let role: AtomDisplayRole
  private let strong: Bool
  private let locale: Locale?

  /// - Parameters:
  ///   - currencyCode: An ISO 4217 code, such as "USD" or "EUR".
  ///   - strong: The emphasized weight of the role.
  ///   - locale: Formats for this locale instead of the environment's.
  public init(
    _ value: Decimal,
    currencyCode: String,
    role: AtomDisplayRole = .display,
    strong: Bool = false,
    locale: Locale? = nil
  ) {
    self.value = value
    self.currencyCode = currencyCode
    self.role = role
    self.strong = strong
    self.locale = locale
    _size = ScaledMetric(wrappedValue: role.size, relativeTo: role.textStyle)
  }

  public var body: some View {
    let amount = AtomAmount(value, currencyCode: currencyCode, locale: locale ?? environmentLocale)
    Text(amount.attributedString(size: size, weight: strong ? role.strongWeight : role.weight))
      .lineLimit(1)
      .minimumScaleFactor(0.5)
      .accessibilityLabel(amount.formatted)
  }
}

/// A formatted money amount split into the parts AtomAmountText draws: the
/// fraction is the decimal separator and the digits after it.
public struct AtomAmount: Equatable, Sendable {
  public struct Part: Equatable, Sendable {
    public let text: String
    public let isFraction: Bool

    public init(_ text: String, isFraction: Bool) {
      self.text = text
      self.isFraction = isFraction
    }
  }

  /// The whole amount as the locale writes it, which is also its accessibility label.
  public let formatted: String
  public let parts: [Part]

  public init(_ value: Decimal, currencyCode: String, locale: Locale) {
    let attributed = value.formatted(.currency(code: currencyCode).locale(locale).attributed)
    var parts: [Part] = []
    for run in attributed.runs {
      let text = String(attributed[run.range].characters)
      let isFraction = run.numberPart == .fraction || run.numberSymbol == .decimalSeparator
      if let last = parts.last, last.isFraction == isFraction {
        parts[parts.count - 1] = Part(last.text + text, isFraction: isFraction)
      } else {
        parts.append(Part(text, isFraction: isFraction))
      }
    }
    self.formatted = String(attributed.characters)
    self.parts = parts
  }

  /// The parts at the role size, with the fraction scaled and raised.
  public func attributedString(size: Double, weight: Font.Weight) -> AttributedString {
    let fractionSize = size * AtomTokens.AmountFraction.scale
    var result = AttributedString()
    for part in parts {
      var run = AttributedString(part.text)
      run[AttributeScopes.SwiftUIAttributes.FontAttribute.self] =
        Font.system(size: part.isFraction ? fractionSize : size, weight: weight).monospacedDigit()
      if part.isFraction {
        run[AttributeScopes.SwiftUIAttributes.BaselineOffsetAttribute.self] =
          fractionSize * AtomTokens.AmountFraction.raise
      }
      result += run
    }
    return result
  }
}

extension View {
  /// Sets a display text role: balances, prices and hero numbers above Apple's
  /// text styles, scaled with Dynamic Type.
  public func atomDisplayFont(_ role: AtomDisplayRole = .display, strong: Bool = false)
    -> some View
  {
    modifier(AtomDisplayFont(role: role, strong: strong))
  }
}

private struct AtomDisplayFont: ViewModifier {
  @ScaledMetric private var size: Double
  private let weight: Font.Weight

  init(role: AtomDisplayRole, strong: Bool) {
    _size = ScaledMetric(wrappedValue: role.size, relativeTo: role.textStyle)
    weight = strong ? role.strongWeight : role.weight
  }

  func body(content: Content) -> some View {
    content.font(.system(size: size, weight: weight))
  }
}
