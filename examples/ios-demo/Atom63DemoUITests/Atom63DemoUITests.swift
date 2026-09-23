import XCTest

@MainActor
final class Atom63DemoUITests: XCTestCase {
  override func setUpWithError() throws {
    continueAfterFailure = false
  }

  func testProjectDetailNavigation() {
    let app = launchApp()

    app.tabBars.buttons["Projects"].tap()
    app.staticTexts["Mobile design system"].tap()

    XCTAssertTrue(
      app.navigationBars["Mobile design system"].waitForExistence(timeout: 2)
    )
    XCTAssertTrue(app.buttons["Delete project"].exists)
    XCTAssertTrue(app.buttons["Edit project"].exists)

    app.buttons["Delete project"].tap()
    XCTAssertTrue(app.alerts["Delete project?"].waitForExistence(timeout: 2))
    app.alerts.buttons["Cancel"].tap()
    XCTAssertTrue(
      app.navigationBars["Mobile design system"].waitForExistence(timeout: 2)
    )
  }

  func testTabSelectionKeepsOneDestinationVisible() {
    let app = launchApp()

    XCTAssertTrue(app.navigationBars["Atom63"].waitForExistence(timeout: 2))
    app.tabBars.buttons["Catalog"].tap()
    XCTAssertTrue(app.navigationBars["Catalog"].waitForExistence(timeout: 2))
    XCTAssertFalse(app.navigationBars["Atom63"].exists)

    app.tabBars.buttons["Projects"].tap()
    XCTAssertTrue(app.navigationBars["Projects"].waitForExistence(timeout: 2))
    XCTAssertFalse(app.navigationBars["Catalog"].exists)
  }

  func testProjectFilterTouchTargetsMeetMinimumSize() {
    let app = launchApp()

    app.tabBars.buttons["Projects"].tap()

    for title in ["All", "Active", "Draft", "Archived"] {
      let filter = app.buttons[title]
      XCTAssertTrue(filter.waitForExistence(timeout: 2))
      XCTAssertGreaterThanOrEqual(filter.frame.height, 43.5)
    }
  }

  func testProjectEditFlowUsesVerifiedFormComponents() {
    let app = launchApp()

    app.tabBars.buttons["Projects"].tap()
    app.staticTexts["Mobile design system"].tap()
    app.buttons["Edit project"].tap()

    XCTAssertTrue(app.navigationBars["Edit project"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.descendants(matching: .any)["project-edit-name"].exists)
    XCTAssertTrue(app.descendants(matching: .any)["project-edit-summary"].exists)

    let archivedSwitch = app.switches["project-edit-archived"]
    XCTAssertTrue(archivedSwitch.exists)
    archivedSwitch.coordinate(withNormalizedOffset: CGVector(dx: 0.9, dy: 0.5)).tap()
    let switchChanged = NSPredicate { element, _ in
      (element as? XCUIElement)?.value as? String == "1"
    }

    expectation(for: switchChanged, evaluatedWith: archivedSwitch)
    waitForExpectations(timeout: 2)

    app.buttons["Save changes"].tap()

    XCTAssertTrue(
      app.navigationBars["Mobile design system"].waitForExistence(timeout: 2)
    )
    XCTAssertTrue(app.staticTexts["Archived"].waitForExistence(timeout: 2))
  }

  func testProjectCreationUsesNativeSheetAndPickerContracts() {
    let app = launchApp()

    app.tabBars.buttons["Projects"].tap()
    app.buttons["Add project"].tap()

    XCTAssertTrue(app.navigationBars["New project"].waitForExistence(timeout: 2))

    let nameField = app.textFields["project-create-name"]
    let summaryField = app.textViews["project-create-summary"]
    let createButton = app.buttons["Create project"]
    XCTAssertTrue(nameField.exists)
    XCTAssertTrue(summaryField.exists)
    XCTAssertTrue(createButton.exists)
    XCTAssertLessThan(createButton.frame.maxY, app.frame.maxY - 20)

    nameField.tap()
    nameField.typeText("Picker contract")
    summaryField.tap()
    summaryField.typeText("Native modal selection flow")

    let statusPicker = app.descendants(matching: .any)["project-create-status"].firstMatch
    XCTAssertTrue(statusPicker.exists)

    createButton.tap()

    XCTAssertTrue(app.navigationBars["Projects"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.staticTexts["Picker contract"].waitForExistence(timeout: 2))
    app.staticTexts["Picker contract"].tap()
    XCTAssertTrue(app.staticTexts["Draft"].waitForExistence(timeout: 2))
  }

  func testFormValidationSummary() {
    let app = launchApp()

    app.tabBars.buttons["Settings"].tap()
    let formsLink = app.buttons["Forms and inputs"]
    XCTAssertTrue(formsLink.waitForExistence(timeout: 10))
    formsLink.tap()

    XCTAssertTrue(
      app.navigationBars["Forms and inputs"].waitForExistence(timeout: 10)
    )

    // Each swipe waits briefly for the lazily rendered form rows to appear
    // before deciding to swipe again; a cold CI simulator renders slowly.
    let saveButton = app.buttons["Save project"]
    for _ in 0..<8 where !(saveButton.waitForExistence(timeout: 1) && saveButton.isHittable) {
      app.swipeUp()
    }
    XCTAssertTrue(saveButton.isHittable)
    saveButton.tap()

    let validationSummary = app.staticTexts["Review 3 fields"]
    for _ in 0..<6 where !validationSummary.waitForExistence(timeout: 1) {
      app.swipeDown()
    }
    XCTAssertTrue(validationSummary.waitForExistence(timeout: 10))

    let nameError = app.staticTexts["Error: Enter a project name"]
    for _ in 0..<6 where !nameError.waitForExistence(timeout: 1) {
      app.swipeDown()
    }
    XCTAssertTrue(nameError.waitForExistence(timeout: 10))

    let emailError = app.staticTexts["Error: Enter a valid email address"]
    for _ in 0..<4 where !emailError.waitForExistence(timeout: 1) {
      app.swipeUp()
    }
    XCTAssertTrue(emailError.waitForExistence(timeout: 10))
  }

  func testTabRootFormActionClearsKeyboardAndTabBar() {
    let app = launchApp()

    app.tabBars.buttons["Settings"].tap()

    let displayName = app.textFields["Display name"]
    let saveButton = app.buttons["Save changes"]
    let tabBar = app.tabBars.firstMatch

    XCTAssertTrue(displayName.waitForExistence(timeout: 2))
    displayName.tap()
    XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 2))

    for _ in 0..<4 where !saveButton.isHittable {
      app.swipeUp()
    }

    XCTAssertTrue(saveButton.isHittable)
    let obstructionTop =
      app.keyboards.firstMatch.exists
      ? app.keyboards.firstMatch.frame.minY
      : tabBar.frame.minY
    XCTAssertLessThanOrEqual(saveButton.frame.maxY, obstructionTop)
  }

  func testNativeSelectionAndSliderControls() {
    let app = launchApp()

    app.tabBars.buttons["Settings"].tap()
    app.buttons["Forms and inputs"].tap()

    XCTAssertTrue(
      app.navigationBars["Forms and inputs"].waitForExistence(timeout: 2)
    )

    let segmentedControl = app.segmentedControls["visibility-segmented-control"]
    for _ in 0..<4 where !segmentedControl.isHittable {
      app.swipeUp()
    }
    XCTAssertTrue(segmentedControl.waitForExistence(timeout: 2))
    segmentedControl.buttons["Shared"].tap()
    XCTAssertTrue(segmentedControl.buttons["Shared"].isSelected)

    let slider = app.sliders["priority-slider"]
    for _ in 0..<3 where !slider.isHittable {
      app.swipeUp()
    }
    XCTAssertTrue(slider.waitForExistence(timeout: 2))
    let initialValue = slider.value as? String
    slider.adjust(toNormalizedSliderPosition: 0.8)
    XCTAssertNotEqual(slider.value as? String, initialValue)
  }

  func testNativeMenuAndDisclosureFlows() {
    let app = launchApp()

    app.tabBars.buttons["Projects"].tap()
    app.buttons["Preview state"].tap()
    app.buttons["Empty"].tap()
    XCTAssertTrue(app.staticTexts["No projects yet"].waitForExistence(timeout: 2))

    app.tabBars.buttons["Catalog"].tap()
    let searchField = app.searchFields["Search components and intents"]
    XCTAssertTrue(searchField.waitForExistence(timeout: 2))
    searchField.tap()
    searchField.typeText("Disclosure group")

    let disclosureItem = app.buttons["catalog-item-disclosureGroup"]
    XCTAssertTrue(disclosureItem.waitForExistence(timeout: 2))
    disclosureItem.tap()
    XCTAssertTrue(app.navigationBars["Disclosure group"].waitForExistence(timeout: 2))

    app.buttons["Implementation details"].tap()
    XCTAssertTrue(
      app.staticTexts["Native SwiftUI renderer with shared product intent."]
        .waitForExistence(timeout: 2)
    )
  }

  func testCatalogNavigationAndPreviewControls() {
    let app = launchApp()

    app.tabBars.buttons["Catalog"].tap()
    XCTAssertTrue(app.navigationBars["Catalog"].waitForExistence(timeout: 2))

    app.buttons["catalog-item-button"].tap()
    XCTAssertTrue(app.navigationBars["Button"].waitForExistence(timeout: 2))

    let contractHeading = app.staticTexts["Cross-renderer contract"]
    for _ in 0..<6 where !contractHeading.exists {
      app.swipeUp()
    }
    XCTAssertTrue(contractHeading.exists)

    let usageHeading = app.staticTexts["Usage"]
    for _ in 0..<8 where !usageHeading.exists {
      app.swipeUp()
    }
    XCTAssertTrue(usageHeading.exists)

    app.buttons["Preview environment"].tap()
    XCTAssertTrue(
      app.navigationBars["Preview environment"].waitForExistence(timeout: 2)
    )
    XCTAssertTrue(app.descendants(matching: .any)["catalog-appearance"].exists)
    let motionControl = app.descendants(matching: .any)["catalog-motion"]
    for _ in 0..<3 where !motionControl.exists {
      app.swipeUp()
    }
    XCTAssertTrue(motionControl.exists)
  }

  func testNativeContentRendererEvidence() {
    let app = launchApp()

    XCTAssertTrue(app.staticTexts["You Zhang"].waitForExistence(timeout: 2))
    XCTAssertFalse(app.buttons["Welcome back"].exists)

    let progress = app.staticTexts.matching(
      NSPredicate(format: "label BEGINSWITH %@", "Foundation coverage")
    ).firstMatch
    XCTAssertTrue(progress.waitForExistence(timeout: 2))
    XCTAssertEqual(progress.value as? String, "72%")

    app.buttons["Runtime help"].tap()
    XCTAssertTrue(
      app.staticTexts["Atom63 uses native SwiftUI rendering"].waitForExistence(timeout: 2)
    )

    app.tabBars.buttons["Catalog"].tap()
    let cardItem = app.buttons["catalog-item-card"]
    for _ in 0..<8 where !cardItem.isHittable {
      app.swipeUp()
    }
    XCTAssertTrue(cardItem.isHittable)
    cardItem.tap()

    let interactiveCard = app.buttons["catalog-interactive-card"]
    for _ in 0..<4 where !interactiveCard.isHittable {
      app.swipeUp()
    }
    interactiveCard.tap()
    XCTAssertTrue(app.staticTexts["Profile opened"].waitForExistence(timeout: 2))
  }

  private func launchApp() -> XCUIApplication {
    let app = XCUIApplication()
    app.launchEnvironment["ATOM63_UI_TESTING"] = "1"
    app.launch()
    return app
  }
}
