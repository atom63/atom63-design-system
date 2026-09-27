import XCTest

// The iOS side of the APG pattern contracts in @atom63/ui-foundation. The data
// is generated into A11yContracts.generated.swift; these types and the test
// below play it against each pattern's catalog showcase.

enum A11yIOSScope {
  /// The showcase's component preview.
  case preview
  /// The list the system draws for an open menu or menu-style picker.
  case popup
  /// The whole app, for alerts and sheets.
  case app
}

enum A11yIOSPosition {
  case first
  case last
  case index(Int)
}

struct A11yIOSPart {
  let type: XCUIElement.ElementType
  let nameRequired: Bool
  let scope: A11yIOSScope
}

struct A11yIOSTarget {
  let part: String
  let at: A11yIOSPosition?
  let label: String?
}

struct A11yIOSCheck {
  let target: A11yIOSTarget
  let exists: Bool?
  let enabled: Bool?
  let selected: Bool?
  let value: String?
  let labelIncludes: String?
}

struct A11yIOSInteraction {
  let id: String
  let on: A11yIOSTarget
  let given: [A11yIOSCheck]
  let then: [A11yIOSCheck]
  let result: String
}

struct A11yIOSContract {
  let pattern: String
  let catalogItem: String
  let parts: [String: A11yIOSPart]
  let structure: [A11yIOSCheck]
  let interactions: [A11yIOSInteraction]
}

@MainActor
final class A11yContractUITests: XCTestCase {
  /// How long a check waits for the UI to settle after an action.
  private let settle: TimeInterval = 3

  func testEveryPatternContractHoldsInItsShowcase() {
    continueAfterFailure = true
    XCTAssertFalse(A11yIOSContract.all.isEmpty)
    for contract in A11yIOSContract.all {
      XCTContext.runActivity(named: "\(contract.pattern) in the \(contract.catalogItem) showcase") { _ in
        play(contract)
      }
    }
  }

  private func play(_ contract: A11yIOSContract) {
    let app = XCUIApplication()
    app.launchEnvironment["ATOM63_UI_TESTING"] = "1"
    app.launchEnvironment["ATOM63_CATALOG_ITEM"] = contract.catalogItem
    app.launch()
    defer { app.terminate() }

    let preview = app.otherElements["Component preview"]
    guard preview.waitForExistence(timeout: 5) else {
      XCTFail("\(contract.pattern): the \(contract.catalogItem) showcase did not open")
      return
    }

    for check in contract.structure {
      verify(check, in: contract, app: app, context: "structure")
    }
    for interaction in contract.interactions {
      for check in interaction.given {
        verify(check, in: contract, app: app, context: "\(interaction.id) (given)")
      }
      let element = resolve(interaction.on, in: contract, app: app)
      guard element.waitForExistence(timeout: settle) else {
        XCTFail("\(contract.pattern) \(interaction.id): nothing to act on for \(describe(interaction.on))")
        return
      }
      tap(element, part: contract.parts[interaction.on.part])
      for check in interaction.then {
        verify(check, in: contract, app: app, context: "\(interaction.id): \(interaction.result)")
      }
    }
  }

  // MARK: Finding parts

  private func query(for target: A11yIOSTarget, in contract: A11yIOSContract, app: XCUIApplication)
    -> XCUIElementQuery
  {
    guard let part = contract.parts[target.part] else {
      XCTFail("\(contract.pattern): unknown part \(target.part)")
      return app.descendants(matching: .any).matching(NSPredicate(value: false))
    }
    let container: XCUIElement
    switch part.scope {
    case .preview:
      container = app.otherElements["Component preview"]
    case .popup:
      // The open menu or picker list is the last collection view the app draws.
      let lists = app.collectionViews
      guard lists.count > 0 else {
        return app.descendants(matching: .any).matching(NSPredicate(value: false))
      }
      container = lists.element(boundBy: lists.count - 1)
    case .app:
      container = app
    }
    var result = container.descendants(matching: part.type)
    // A part that must be named is found only among labelled elements, so an
    // unlabelled control fails as missing instead of passing unnoticed.
    if part.nameRequired {
      result = result.matching(NSPredicate(format: "label != ''"))
    }
    if let label = target.label {
      result = result.matching(NSPredicate(format: "label == %@", label))
    }
    return result
  }

  private func resolve(_ target: A11yIOSTarget, in contract: A11yIOSContract, app: XCUIApplication)
    -> XCUIElement
  {
    let matches = query(for: target, in: contract, app: app)
    switch target.at {
    case .first, .none:
      return matches.firstMatch
    case .last:
      return matches.element(boundBy: max(matches.count - 1, 0))
    case .index(let index):
      return matches.element(boundBy: index)
    }
  }

  private func describe(_ target: A11yIOSTarget) -> String {
    [target.part, target.label.map { "\"\($0)\"" }].compactMap { $0 }.joined(separator: " ")
  }

  // MARK: Acting and checking

  private func tap(_ element: XCUIElement, part: A11yIOSPart?) {
    if part?.type == .switch {
      // A switch row's label fills most of it; activate the control itself.
      element.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5)).tap()
    } else {
      element.tap()
    }
  }

  private func verify(
    _ check: A11yIOSCheck,
    in contract: A11yIOSContract,
    app: XCUIApplication,
    context: String
  ) {
    let what = "\(contract.pattern) \(context): \(describe(check.target))"
    let deadline = Date().addingTimeInterval(settle)
    var failure: String?
    repeat {
      failure = evaluate(check, in: contract, app: app)
      if failure == nil { return }
      RunLoop.current.run(until: Date().addingTimeInterval(0.2))
    } while Date() < deadline
    XCTFail("\(what) \(failure ?? "")")
  }

  /// Nil when the check holds, otherwise what was found instead.
  private func evaluate(_ check: A11yIOSCheck, in contract: A11yIOSContract, app: XCUIApplication)
    -> String?
  {
    if let exists = check.exists, check.target.at == nil {
      let count = query(for: check.target, in: contract, app: app).count
      return (count > 0) == exists ? nil : "should \(exists ? "" : "not ")exist; found \(count)"
    }
    let element = resolve(check.target, in: contract, app: app)
    guard element.exists else {
      return check.exists == false ? nil : "was not found"
    }
    if check.exists == false { return "should not exist" }
    if let enabled = check.enabled, element.isEnabled != enabled {
      return "should be \(enabled ? "enabled" : "disabled")"
    }
    if let selected = check.selected, element.isSelected != selected {
      return "should \(selected ? "" : "not ")be selected"
    }
    if let value = check.value, (element.value as? String) != value {
      return "should have the value \(value); has \(String(describing: element.value))"
    }
    if let text = check.labelIncludes, !element.label.contains(text) {
      return "should have \"\(text)\" in its label; has \"\(element.label)\""
    }
    return nil
  }
}
