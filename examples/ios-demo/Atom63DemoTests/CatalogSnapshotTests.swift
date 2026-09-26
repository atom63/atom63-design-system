import Atom63UI
import SnapshotTesting
import SwiftUI
import XCTest

@testable import Atom63Demo

/// Screenshot tests for every catalog showcase, in light, dark and a large Dynamic Type size.
///
/// Baselines live in `__Snapshots__/<device>_iOS-<version>/`. Only the simulator pinned in
/// `snapshot-simulator.json` compares against the committed baselines; any other simulator writes
/// and compares its own baselines under the git-ignored `__Snapshots__/local/`. See the README.
@MainActor
final class CatalogSnapshotTests: XCTestCase {
  override func setUp() async throws {
    try await super.setUp()
    UIView.setAnimationsEnabled(false)
    Self.swapSpinnerStart()
    // Remote images never load, so AtomAsyncImage always renders its placeholder.
    URLProtocol.registerClass(HeldURLProtocol.self)
  }

  override func tearDown() async throws {
    URLProtocol.unregisterClass(HeldURLProtocol.self)
    Self.swapSpinnerStart()
    UIView.setAnimationsEnabled(true)
    try await super.tearDown()
  }

  /// Spinners (`ProgressView()`, a `UIActivityIndicatorView`) share a phase taken from the wall
  /// clock, so each capture would catch a different frame. While the tests run, `startAnimating()`
  /// leaves the spinner still and visible instead. Calling this again restores it.
  private static func swapSpinnerStart() {
    guard
      let original = class_getInstanceMethod(
        UIActivityIndicatorView.self,
        #selector(UIActivityIndicatorView.startAnimating)
      ),
      let still = class_getInstanceMethod(
        UIActivityIndicatorView.self,
        #selector(UIActivityIndicatorView.atom63SnapshotStartAnimating)
      )
    else {
      preconditionFailure("UIActivityIndicatorView.startAnimating is missing")
    }
    method_exchangeImplementations(original, still)
  }

  func testLightShowcases() {
    assertShowcases(.light)
  }

  func testDarkShowcases() {
    assertShowcases(.dark)
  }

  func testLargeTypeShowcases() {
    assertShowcases(.largeType)
  }

  /// A catalog entry without a committed baseline, or a baseline without an entry, fails here.
  func testEveryCatalogEntryHasCommittedBaselines() throws {
    try XCTSkipIf(SnapshotEnvironment.isRecording, "Recording baselines")

    let expected = Set(
      CatalogRegistry.items.flatMap { item in
        SnapshotVariant.allCases.map { SnapshotEnvironment.fileName(item: item, variant: $0) }
      }
    )
    let directory = SnapshotEnvironment.pinnedDirectory
    let committed = Set(
      ((try? FileManager.default.contentsOfDirectory(atPath: directory.path)) ?? [])
        .filter { $0.hasSuffix(".png") }
    )

    let missing = expected.subtracting(committed).sorted()
    let orphaned = committed.subtracting(expected).sorted()
    XCTAssert(
      missing.isEmpty,
      """
      \(missing.count) catalog snapshots have no baseline in \(directory.path): \
      \(missing.joined(separator: ", ")). Run the iOS snapshots workflow with "update" on the branch.
      """
    )
    XCTAssert(
      orphaned.isEmpty,
      """
      Baselines without a catalog entry: \(orphaned.joined(separator: ", ")). \
      Run the iOS snapshots workflow with "update" on the branch.
      """
    )
  }

  private func assertShowcases(_ variant: SnapshotVariant) {
    let directory = SnapshotEnvironment.directory
    for item in CatalogRegistry.items {
      let reference = directory.appendingPathComponent(
        SnapshotEnvironment.fileName(item: item, variant: variant)
      )
      let recording =
        SnapshotEnvironment.isRecording
        || (!SnapshotEnvironment.isPinned
          && !FileManager.default.fileExists(atPath: reference.path))

      let failure = verifySnapshot(
        of: SnapshotCanvas(item: item, variant: variant),
        as: .image(
          drawHierarchyInKeyWindow: true,
          precision: 0.995,
          perceptualPrecision: 0.98,
          layout: .sizeThatFits,
          traits: variant.traits
        ),
        named: variant.rawValue,
        record: recording ? .all : .never,
        snapshotDirectory: directory.path,
        testName: item.rawValue
      )

      if recording {
        // Recording always reports a message; only a missing file is a failure.
        XCTAssert(
          FileManager.default.fileExists(atPath: reference.path),
          "\(item.rawValue) \(variant.rawValue): \(failure ?? "no snapshot was written")"
        )
      } else if let failure {
        XCTFail("\(item.rawValue) \(variant.rawValue): \(failure)")
      }
    }
  }
}

enum SnapshotVariant: String, CaseIterable {
  case light
  case dark
  case largeType = "large-type"

  var colorScheme: ColorScheme {
    self == .dark ? .dark : .light
  }

  var dynamicTypeSize: DynamicTypeSize {
    self == .largeType ? .accessibility3 : .large
  }

  var traits: UITraitCollection {
    UITraitCollection { traits in
      traits.userInterfaceStyle = colorScheme == .dark ? .dark : .light
      traits.preferredContentSizeCategory =
        self == .largeType ? .accessibilityLarge : .large
      traits.displayScale = SnapshotEnvironment.displayScale
      // An sRGB, 8-bit image, the same format the PNG baselines are read back in.
      traits.displayGamut = .SRGB
    }
  }
}

enum SnapshotEnvironment {
  /// The iPhone 17 Pro screen width, in points.
  static let width: CGFloat = 402
  /// 2x keeps the committed PNGs small while still resolving one-point changes.
  static let displayScale: CGFloat = 2

  private static let demoDirectory = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent()
    .deletingLastPathComponent()
  private static let snapshotsDirectory = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent()
    .appendingPathComponent("__Snapshots__")

  private struct Pin: Decodable {
    let device: String
    let os: String
  }

  private static let pin: Pin = {
    let url = demoDirectory.appendingPathComponent("snapshot-simulator.json")
    guard
      let data = try? Data(contentsOf: url),
      let pin = try? JSONDecoder().decode(Pin.self, from: data)
    else {
      preconditionFailure("Cannot read the pinned snapshot simulator from \(url.path)")
    }
    return pin
  }()

  static var device: String {
    ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] ?? UIDevice.current.model
  }

  static var osVersion: String {
    UIDevice.current.systemVersion
  }

  static var isPinned: Bool {
    device == pin.device && osVersion == pin.os
  }

  /// Set by `run-ios-snapshots.mjs --record` (as `TEST_RUNNER_ATOM63_SNAPSHOT_RECORD`).
  static var isRecording: Bool {
    ProcessInfo.processInfo.environment["ATOM63_SNAPSHOT_RECORD"] == "1"
  }

  static var pinnedDirectory: URL {
    snapshotsDirectory.appendingPathComponent(folderName(device: pin.device, os: pin.os))
  }

  static var directory: URL {
    isPinned
      ? pinnedDirectory
      : snapshotsDirectory
        .appendingPathComponent("local")
        .appendingPathComponent(folderName(device: device, os: osVersion))
  }

  static func fileName(item: CatalogItem, variant: SnapshotVariant) -> String {
    "\(item.rawValue).\(variant.rawValue).png"
  }

  private static func folderName(device: String, os: String) -> String {
    "\(device.replacingOccurrences(of: " ", with: "-"))_iOS-\(os)"
  }
}

/// A showcase on the catalog's page surface, at a fixed width and its natural height, with
/// motion reduced and locale, time zone and calendar fixed.
private struct SnapshotCanvas: View {
  let item: CatalogItem
  let variant: SnapshotVariant

  var body: some View {
    CatalogShowcase(item: item)
      .padding(AtomTokens.Space.x4)
      .frame(width: SnapshotEnvironment.width, alignment: .topLeading)
      .fixedSize(horizontal: false, vertical: true)
      .background(AtomTheme.standard.colors.surfacePage.resolve(for: variant.colorScheme))
      .atomTheme(.standard)
      .atomMotionPreference(.reduced)
      .transaction { $0.disablesAnimations = true }
      .environment(\.colorScheme, variant.colorScheme)
      .environment(\.dynamicTypeSize, variant.dynamicTypeSize)
      .environment(\.locale, Locale(identifier: "en_US"))
      .environment(\.timeZone, TimeZone(identifier: "UTC") ?? .gmt)
      .environment(\.calendar, Calendar(identifier: .gregorian))
  }
}

extension UIActivityIndicatorView {
  /// Swapped in for `startAnimating()` during the snapshot tests.
  @objc fileprivate func atom63SnapshotStartAnimating() {
    hidesWhenStopped = false
  }
}

/// Holds every HTTP request open, so remote images stay in their loading state.
private final class HeldURLProtocol: URLProtocol, @unchecked Sendable {
  override class func canInit(with request: URLRequest) -> Bool {
    ["http", "https"].contains(request.url?.scheme)
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    request
  }

  override func startLoading() {}

  override func stopLoading() {}
}
