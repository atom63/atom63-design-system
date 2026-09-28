import Foundation
import Testing

@testable import Atom63UI

/// One case from AtomInformVectors.generated.swift, with the resolution the web
/// arbiter computed for it.
struct InformVector: Sendable {
  struct Message: Sendable {
    let id: String
    let surface: AtomInformSurface
    let priority: Int
    let dismiss: AtomInformDismissMode
    let version: Int
    let startsAt: Date?
    let endsAt: Date?
    let anchor: String?
    /// False stands for a `when` predicate that returns false.
    let eligible: Bool
  }

  let name: String
  let messages: [Message]
  let dismissals: [String]
  let anchors: [String]
  let banner: String?
  let dialog: String?
  let spotlight: String?
  let flyouts: [String]
}

func vectorDate(_ iso: String) -> Date {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  guard let date = formatter.date(from: iso) else { preconditionFailure("Bad vector date \(iso)") }
  return date
}

struct AtomInformArbiterTests {
  @Test(arguments: informVectors.map(\.name))
  func matchesTheWebArbiter(_ name: String) throws {
    let vector = try #require(informVectors.first { $0.name == name })
    let messages = vector.messages.map(Self.message(from:))
    let anchors = Set(vector.anchors)
    let resolution = AtomInformArbiter.resolve(
      messages,
      context: AtomInformContext(route: "/", locale: Locale(identifier: "en"), now: informVectorNow),
      dismissals: Set(vector.dismissals),
      isAnchorAvailable: { anchors.contains($0) }
    )
    #expect(resolution.banner?.id == vector.banner)
    #expect(resolution.dialog?.id == vector.dialog)
    #expect(resolution.spotlight?.id == vector.spotlight)
    #expect(resolution.cornerFlyouts.map { $0.id } == vector.flyouts)
  }

  private static func message(from spec: InformVector.Message) -> AtomInformMessage {
    let never: @Sendable (AtomInformContext) -> Bool = { _ in false }
    let content = AtomInformContent(body: spec.id)
    return AtomInformMessage(
      id: spec.id,
      surface: spec.surface,
      priority: spec.priority,
      dismiss: spec.dismiss,
      version: spec.version,
      startsAt: spec.startsAt,
      endsAt: spec.endsAt,
      anchor: spec.anchor,
      when: spec.eligible ? nil : never,
      content: content
    )
  }

  @Test
  func coversEveryRule() {
    #expect(informVectors.count >= 9)
  }

  @MainActor
  @Test
  func dismissalsFollowTheirMode() throws {
    let suite = "atom63.inform.tests.\(UUID().uuidString)"
    let defaults = try #require(UserDefaults(suiteName: suite))
    defer { defaults.removePersistentDomain(forName: suite) }

    let message = { (id: String, mode: AtomInformDismissMode) in
      AtomInformMessage(id: id, surface: .banner, dismiss: mode, content: AtomInformContent(body: id))
    }
    let store = AtomInformDismissalStore(defaults: defaults)
    store.dismiss(message("kept", .persistent))
    store.dismiss(message("launch", .session))
    store.dismiss(message("never", .none))
    #expect(store.dismissed == ["kept:1", "launch:1"])

    // A new store is a new launch: only persistent dismissals remain.
    #expect(AtomInformDismissalStore(defaults: defaults).dismissed == ["kept:1"])

    store.clear("kept:1")
    #expect(store.dismissed == ["launch:1"])
    store.clear()
    #expect(store.dismissed.isEmpty)
  }
}
