import SwiftUI

/// Which side a message is from. Mirrors `direction` on the web `Message`.
public enum AtomMessageDirection: String, CaseIterable, Sendable {
  case incoming
  case outgoing
}

/// Where a message sits in a run of consecutive messages from one sender. Mirrors `position`.
public enum AtomMessagePosition: String, CaseIterable, Sendable {
  case single
  case first
  case middle
  case last

  /// Single and last messages draw the tail and show the avatar.
  var endsRun: Bool { self == .single || self == .last }
  /// Middle and last messages join the message above.
  var joinsAbove: Bool { self == .middle || self == .last }
  /// First and middle messages join the message below.
  var joinsBelow: Bool { self == .first || self == .middle }
}

/// The delivery status of an outgoing message. Mirrors `status`.
public enum AtomMessageDeliveryState: String, CaseIterable, Sendable {
  case sending
  case sent
  case delivered
  case read
  case failed

  var systemImage: String {
    switch self {
    case .sending: "clock"
    case .sent: "checkmark"
    case .delivered, .read: "checkmark.circle"
    case .failed: "exclamationmark.circle"
    }
  }

  var label: String {
    switch self {
    case .sending: "Sending"
    case .sent: "Sent"
    case .delivered: "Delivered"
    case .read: "Read"
    case .failed: "Not delivered"
    }
  }
}

/// One message between people, as a bubble on its sender's side. For an AI
/// assistant's turn, compose your own view; this is for person-to-person
/// threads. Mirrors `Message` in `@atom63/ui-react`; the shared intent lives in
/// the cross-renderer contract.
///
/// Pass `position` from your own grouping of consecutive messages: the corners
/// where messages join tighten, and only `.single` and `.last` draw the tail and
/// show the avatar (the others keep its column).
public struct AtomMessage<Content: View, Avatar: View, Media: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let sender: String
  private let direction: AtomMessageDirection
  private let position: AtomMessagePosition
  private let time: String?
  private let status: AtomMessageDeliveryState?
  private let content: Content
  private let avatar: Avatar
  private let media: Media

  public init(
    from sender: String,
    direction: AtomMessageDirection = .incoming,
    position: AtomMessagePosition = .single,
    time: String? = nil,
    status: AtomMessageDeliveryState? = nil,
    @ViewBuilder avatar: () -> Avatar = { EmptyView() },
    @ViewBuilder media: () -> Media = { EmptyView() },
    @ViewBuilder content: () -> Content
  ) {
    self.sender = sender
    self.direction = direction
    self.position = position
    self.time = time
    self.status = status
    self.avatar = avatar()
    self.media = media()
    self.content = content()
  }

  public var body: some View {
    HStack(alignment: .bottom, spacing: AtomTokens.Space.x2) {
      if direction == .outgoing {
        Spacer(minLength: AtomTokens.Space.x6 * 2)
      }
      if direction == .incoming, Avatar.self != EmptyView.self {
        avatar
          .opacity(position.endsRun ? 1 : 0)
          .accessibilityHidden(true)
      }
      bubble
      if direction == .incoming {
        Spacer(minLength: AtomTokens.Space.x6 * 2)
      }
    }
  }

  private var bubble: some View {
    VStack(alignment: .trailing, spacing: 0) {
      if Media.self != EmptyView.self {
        media
      }
      if Content.self != EmptyView.self || time != nil || status != nil {
        // The meta sits at the end of the last line, so the bubble hugs short messages.
        HStack(alignment: .lastTextBaseline, spacing: AtomTokens.Space.x2) {
          if Content.self != EmptyView.self {
            content
              .font(.body)
          }
          meta
        }
        .padding(.horizontal, AtomTokens.Space.x3)
        .padding(.vertical, AtomTokens.Space.x2)
      }
    }
    .fixedSize(horizontal: false, vertical: true)
    .foregroundStyle(foreground)
    .background(background)
    .clipShape(shape)
    .accessibilityElement(children: .combine)
    .accessibilityLabel(Text(sender))
    .accessibilityValue(Text(accessibilityValue))
  }

  @ViewBuilder private var meta: some View {
    if time != nil || status != nil {
      HStack(spacing: AtomTokens.Space.x1) {
        if let time {
          Text(time)
        }
        if let status {
          Image(systemName: status.systemImage)
            .symbolVariant(status == .read ? .fill : .none)
            .accessibilityLabel(status.label)
        }
      }
      .font(.caption)
      .foregroundStyle(metaColor)
    }
  }

  private var accessibilityValue: String {
    [time, status?.label].compactMap { $0 }.joined(separator: ", ")
  }

  private var foreground: Color {
    (direction == .outgoing ? theme.colors.actionPrimaryForeground : theme.colors.textPrimary)
      .resolve(for: colorScheme)
  }

  private var background: Color {
    (direction == .outgoing ? theme.colors.actionPrimary : theme.colors.surfaceMuted)
      .resolve(for: colorScheme)
  }

  private var metaColor: Color {
    (direction == .outgoing ? theme.colors.actionPrimaryForeground : theme.colors.textSecondary)
      .resolve(for: colorScheme)
  }

  /// Joined corners on the sender's side tighten; the tail is a sharp bottom corner on that side.
  private var shape: UnevenRoundedRectangle {
    let round = AtomTokens.Radius.extraLarge + AtomTokens.Space.x1
    let joined = AtomTokens.Radius.small
    let tail = AtomTokens.Radius.small / 3
    let top = position.joinsAbove ? joined : round
    let bottom = position.endsRun ? tail : (position.joinsBelow ? joined : round)
    return direction == .incoming
      ? UnevenRoundedRectangle(
        topLeadingRadius: top,
        bottomLeadingRadius: bottom,
        bottomTrailingRadius: round,
        topTrailingRadius: round,
        style: .continuous
      )
      : UnevenRoundedRectangle(
        topLeadingRadius: round,
        bottomLeadingRadius: round,
        bottomTrailingRadius: bottom,
        topTrailingRadius: top,
        style: .continuous
      )
  }
}

extension AtomMessage where Content == Text, Media == EmptyView {
  /// A text message.
  public init(
    _ text: String,
    from sender: String,
    direction: AtomMessageDirection = .incoming,
    position: AtomMessagePosition = .single,
    time: String? = nil,
    status: AtomMessageDeliveryState? = nil,
    @ViewBuilder avatar: () -> Avatar = { EmptyView() }
  ) {
    self.init(
      from: sender,
      direction: direction,
      position: position,
      time: time,
      status: status,
      avatar: avatar,
      content: { Text(text) }
    )
  }
}

/// A centred row for what is not a message in a thread: a call, a date, someone
/// joining. Mirrors `MessageEvent`.
public struct AtomMessageEvent: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let text: String
  private let systemImage: String?

  public init(_ text: String, systemImage: String? = nil) {
    self.text = text
    self.systemImage = systemImage
  }

  public var body: some View {
    HStack(spacing: AtomTokens.Space.x1) {
      if let systemImage {
        Image(systemName: systemImage)
          .accessibilityHidden(true)
      }
      Text(text)
    }
    .font(.caption)
    .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
    .frame(maxWidth: .infinity)
    .multilineTextAlignment(.center)
  }
}
