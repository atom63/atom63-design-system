import SwiftUI
import TipKit

// The spotlight surface on iOS (IF4 in docs/design-system/ios-inform-plan.md):
// a TipKit popover on the view marked with `atomInformAnchor(_:)`. The tip's
// only rule is that the arbiter resolved its message, so TipKit's own
// eligibility never decides; closing the tip records the dismissal.

struct AtomInformSpotlightTip: Tip {
  /// The id of the tip whose message the arbiter resolved, if any. One
  /// parameter for every spotlight: the arbiter shows one at a time.
  @Parameter static var resolved: String? = nil

  /// TipKit keeps a closed tip closed across launches. A spotlight that is not
  /// dismissed for good gets a new tip each launch, so it can show again.
  private static let launch = UUID().uuidString

  let id: String
  let content: AtomInformContent

  init(message: AtomInformMessage, content: AtomInformContent) {
    id = message.dismiss == .persistent
      ? "a63.inform.\(message.dismissalKey)"
      : "a63.inform.\(message.dismissalKey).\(Self.launch)"
    self.content = content
  }

  /// A tip for an anchor with no spotlight: the arbiter never resolves its id,
  /// so it never shows, and the anchor keeps one popover modifier throughout.
  init(idleAt anchor: String) {
    id = "a63.inform.anchor.\(anchor)"
    content = AtomInformContent(body: "")
  }

  var title: Text { Text(content.title ?? content.body) }
  var message: Text? { content.title == nil ? nil : Text(content.body) }
  var image: Image? { content.systemImage.map(Image.init(systemName:)) }
  var actions: [Action] { content.actions.map { Action(id: $0.id, title: $0.label) } }
  var rules: [Rule] {
    let id = id
    return [#Rule(Self.$resolved) { $0 == id }]
  }
  var options: [any TipOption] { [Tips.IgnoresDisplayFrequency(true)] }
}

/// The resolved spotlight, passed down to the anchors.
struct AtomInformSpotlight: Sendable {
  let message: AtomInformMessage
  let tip: AtomInformSpotlightTip
  let store: AtomInformDismissalStore
}

extension EnvironmentValues {
  @Entry var atomInformSpotlight: AtomInformSpotlight? = nil
}

/// The anchors on screen, reported up to `atomInform` so the arbiter skips a
/// spotlight whose anchor is missing.
struct AtomInformAnchorsKey: PreferenceKey {
  static let defaultValue: Set<String> = []

  static func reduce(value: inout Set<String>, nextValue: () -> Set<String>) {
    value.formUnion(nextValue())
  }
}

private struct AtomInformAnchorModifier: ViewModifier {
  let anchor: String

  @Environment(\.atomInformSpotlight) private var spotlight

  func body(content: Content) -> some View {
    let spotlight = spotlight?.message.anchor == anchor ? spotlight : nil

    content
      .preference(key: AtomInformAnchorsKey.self, value: [anchor])
      .popoverTip(spotlight?.tip ?? AtomInformSpotlightTip(idleAt: anchor), arrowEdge: .top) { action in
        guard let spotlight else { return }
        spotlight.tip.content.actions.first { $0.id == action.id }?.perform()
        // An action ends the spotlight, as it closes a dialog.
        spotlight.tip.invalidate(reason: .actionPerformed)
      }
      .task(id: spotlight?.tip.id) {
        guard let spotlight else { return }
        // The close button, an action, or a tip TipKit closed on an earlier
        // launch: each records the dismissal, so the arbiter moves on.
        for await status in spotlight.tip.statusUpdates {
          if case .invalidated = status {
            spotlight.store.dismissSpotlight(spotlight.message)
            return
          }
        }
      }
  }
}

extension View {
  /// Mark the view a spotlight message points at: a message whose `anchor` is
  /// `anchor` shows as a TipKit popover here while the arbiter resolves it.
  /// Spotlights need `Tips.configure()` at app launch.
  public func atomInformAnchor(_ anchor: String) -> some View {
    modifier(AtomInformAnchorModifier(anchor: anchor))
  }
}
