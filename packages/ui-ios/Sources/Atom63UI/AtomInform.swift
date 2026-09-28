import Foundation

// The inform pattern's core on iOS: the message model and the arbiter from
// @atom63/inform (src/core), ported one to one. Shared test vectors generated
// from the web arbiter keep the two in step (AtomInformArbiterTests).

/// Where a message is shown.
public enum AtomInformSurface: String, CaseIterable, Sendable {
  case banner
  case dialog
  case cornerFlyout = "corner-flyout"
  case spotlight

  /// The surfaces that block the rest of the page, in precedence order: the
  /// first with a candidate takes the single blocking slot.
  public static let blocking: [AtomInformSurface] = [.dialog, .spotlight]
}

public enum AtomInformSeverity: String, CaseIterable, Sendable {
  case info
  case success
  case warning
  case danger
}

/// How long a dismissal lasts: never recorded, for this launch, or kept.
public enum AtomInformDismissMode: String, CaseIterable, Sendable {
  case none
  case session
  case persistent
}

/// What the arbiter's predicates and the content can read.
public struct AtomInformContext: Sendable {
  public var route: String
  public var locale: Locale
  public var now: Date

  public init(route: String, locale: Locale = .current, now: Date = .now) {
    self.route = route
    self.locale = locale
    self.now = now
  }
}

public struct AtomInformAction: Identifiable, Sendable {
  public enum Role: String, Sendable {
    case primary
    case secondary
  }

  public let id: String
  public let label: String
  public let role: Role
  public let perform: @Sendable @MainActor () -> Void

  public init(
    id: String,
    label: String,
    role: Role = .secondary,
    perform: @escaping @Sendable @MainActor () -> Void
  ) {
    self.id = id
    self.label = label
    self.role = role
    self.perform = perform
  }
}

public struct AtomInformContent: Sendable {
  public var title: String?
  public var body: String
  /// An SF Symbol name.
  public var systemImage: String?
  public var actions: [AtomInformAction]

  public init(
    title: String? = nil,
    body: String,
    systemImage: String? = nil,
    actions: [AtomInformAction] = []
  ) {
    self.title = title
    self.body = body
    self.systemImage = systemImage
    self.actions = actions
  }
}

public struct AtomInformMessage: Identifiable, Sendable {
  public let id: String
  public let surface: AtomInformSurface
  public let severity: AtomInformSeverity
  public let priority: Int
  public let dismiss: AtomInformDismissMode
  /// Bump it to show a dismissed message again.
  public let version: Int
  public let startsAt: Date?
  public let endsAt: Date?
  /// For a spotlight: the anchor it points at.
  public let anchor: String?
  public let when: (@Sendable (AtomInformContext) -> Bool)?
  public let content: @Sendable (AtomInformContext) -> AtomInformContent

  public init(
    id: String,
    surface: AtomInformSurface,
    severity: AtomInformSeverity = .info,
    priority: Int = 0,
    dismiss: AtomInformDismissMode = .persistent,
    version: Int = 1,
    startsAt: Date? = nil,
    endsAt: Date? = nil,
    anchor: String? = nil,
    when: (@Sendable (AtomInformContext) -> Bool)? = nil,
    content: @escaping @Sendable (AtomInformContext) -> AtomInformContent
  ) {
    self.id = id
    self.surface = surface
    self.severity = severity
    self.priority = priority
    self.dismiss = dismiss
    self.version = version
    self.startsAt = startsAt
    self.endsAt = endsAt
    self.anchor = anchor
    self.when = when
    self.content = content
  }

  public init(
    id: String,
    surface: AtomInformSurface,
    severity: AtomInformSeverity = .info,
    priority: Int = 0,
    dismiss: AtomInformDismissMode = .persistent,
    version: Int = 1,
    startsAt: Date? = nil,
    endsAt: Date? = nil,
    anchor: String? = nil,
    when: (@Sendable (AtomInformContext) -> Bool)? = nil,
    content: AtomInformContent
  ) {
    self.init(
      id: id,
      surface: surface,
      severity: severity,
      priority: priority,
      dismiss: dismiss,
      version: version,
      startsAt: startsAt,
      endsAt: endsAt,
      anchor: anchor,
      when: when,
      content: { _ in content }
    )
  }

  /// The dismissal record key, `id:version`, the same as the web's.
  public var dismissalKey: String { "\(id):\(version)" }
}

/// What each surface shows.
public struct AtomInformResolution: Sendable {
  public var banner: AtomInformMessage?
  public var dialog: AtomInformMessage?
  public var spotlight: AtomInformMessage?
  public var cornerFlyouts: [AtomInformMessage]

  public static let empty = AtomInformResolution(
    banner: nil,
    dialog: nil,
    spotlight: nil,
    cornerFlyouts: []
  )
}

public enum AtomInformArbiter {
  /// Corner flyouts shown at once; the rest wait their turn.
  public static let flyoutStackLimit = 3

  /// Filter, rank, then apply exclusion, as `resolveInform` does on the web.
  /// Ranking is by descending priority; declaration order breaks ties.
  public static func resolve(
    _ messages: [AtomInformMessage],
    context: AtomInformContext,
    dismissals: Set<String>,
    isAnchorAvailable: (String) -> Bool = { _ in false }
  ) -> AtomInformResolution {
    let eligible = messages.filter { message in
      if dismissals.contains(message.dismissalKey) { return false }
      if let startsAt = message.startsAt, context.now < startsAt { return false }
      if let endsAt = message.endsAt, context.now > endsAt { return false }
      if let when = message.when, !when(context) { return false }
      // A spotlight with no anchor would point at nothing.
      if message.surface == .spotlight, let anchor = message.anchor, !isAnchorAvailable(anchor) {
        return false
      }
      return true
    }

    func ranked(_ surface: AtomInformSurface) -> [AtomInformMessage] {
      eligible.enumerated()
        .filter { $0.element.surface == surface }
        .sorted { lhs, rhs in
          lhs.element.priority != rhs.element.priority
            ? lhs.element.priority > rhs.element.priority
            : lhs.offset < rhs.offset
        }
        .map(\.element)
    }

    var blocking: AtomInformMessage?
    var blockingResolutions: [AtomInformSurface: AtomInformMessage] = [:]
    for surface in AtomInformSurface.blocking where blocking == nil {
      if let candidate = ranked(surface).first {
        blockingResolutions[surface] = candidate
        blocking = candidate
      }
    }

    return AtomInformResolution(
      banner: ranked(.banner).first,
      dialog: blockingResolutions[.dialog],
      spotlight: blockingResolutions[.spotlight],
      cornerFlyouts: blocking == nil
        ? Array(ranked(.cornerFlyout).prefix(flyoutStackLimit))
        : []
    )
  }
}

/// Where dismissals live: `persistent` ones in `UserDefaults`, `session` ones
/// in memory until the app quits. Keys are `id:version`, values the time.
@MainActor
public final class AtomInformDismissalStore {
  public static let defaultsKey = "a63.inform.dismissed"

  private let defaults: UserDefaults
  private var session: [String: Double] = [:]

  public init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
  }

  private var persisted: [String: Double] {
    defaults.dictionary(forKey: Self.defaultsKey) as? [String: Double] ?? [:]
  }

  /// Every dismissed key, persistent or for this session.
  public var dismissed: Set<String> {
    Set(persisted.keys).union(session.keys)
  }

  public func dismiss(_ message: AtomInformMessage, at date: Date = .now) {
    let at = date.timeIntervalSince1970 * 1000
    switch message.dismiss {
    case .none:
      return
    case .session:
      session[message.dismissalKey] = at
    case .persistent:
      var next = persisted
      next[message.dismissalKey] = at
      defaults.set(next, forKey: Self.defaultsKey)
    }
  }

  /// Forget one dismissal, or all of them.
  public func clear(_ key: String? = nil) {
    guard let key else {
      session = [:]
      defaults.removeObject(forKey: Self.defaultsKey)
      return
    }
    session[key] = nil
    var next = persisted
    next[key] = nil
    defaults.set(next, forKey: Self.defaultsKey)
  }
}
