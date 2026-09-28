import SwiftUI

// The inform surfaces on iOS (IF3 in docs/design-system/ios-inform-plan.md):
// a banner inset at the top, a system alert or a sheet for a dialog, and a
// stack of flyouts at the bottom edge. `atomInform(_:route:store:)` resolves
// the messages with AtomInformArbiter and presents the result.

extension AtomInformSeverity {
  var noticeTone: AtomNoticeTone {
    switch self {
    case .info: .info
    case .success: .success
    case .warning: .warning
    case .danger: .error
    }
  }
}

/// A banner or flyout: the message in an `AtomNotice`, its actions, and a
/// close button when the message can be dismissed.
struct AtomInformCard: View {
  let message: AtomInformMessage
  let content: AtomInformContent
  let onDismiss: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      HStack(alignment: .top, spacing: AtomTokens.Space.x2) {
        AtomNotice(
          content.title ?? content.body,
          message: content.title == nil ? nil : content.body,
          tone: message.severity.noticeTone
        )
        if message.dismiss != .none {
          Button {
            onDismiss()
          } label: {
            Image(systemName: "xmark")
              .frame(width: AtomTokens.Control.minTouchTarget, height: AtomTokens.Control.minTouchTarget)
              .contentShape(.rect)
          }
          .buttonStyle(.plain)
          .accessibilityLabel("Dismiss")
        }
      }
      if !content.actions.isEmpty {
        HStack(spacing: AtomTokens.Space.x2) {
          ForEach(content.actions) { action in
            AtomButton(
              variant: action.role == .primary ? .primary : .outline,
              size: .compact,
              action: action.perform
            ) {
              Text(action.label)
            }
          }
        }
      }
    }
  }
}

private struct AtomInformModifier: ViewModifier {
  let messages: [AtomInformMessage]
  let route: String
  let store: AtomInformDismissalStore
  let isAnchorAvailable: (String) -> Bool

  @Environment(\.locale) private var locale

  func body(content: Content) -> some View {
    let context = AtomInformContext(route: route, locale: locale, now: .now)
    let resolution = AtomInformArbiter.resolve(
      messages,
      context: context,
      dismissals: store.dismissed,
      isAnchorAvailable: isAnchorAvailable
    )
    let dialog = resolution.dialog
    let dialogContent = dialog.map { $0.content(context) }
    // A system alert holds a title, a message and two buttons; more needs a sheet.
    let usesAlert = (dialogContent?.actions.count ?? 0) <= 2

    content
      .safeAreaInset(edge: .top, spacing: 0) {
        if let banner = resolution.banner {
          AtomInformCard(message: banner, content: banner.content(context)) {
            store.dismiss(banner)
          }
          .padding(.horizontal, AtomTokens.Space.x4)
          .padding(.vertical, AtomTokens.Space.x2)
          .transition(.move(edge: .top).combined(with: .opacity))
        }
      }
      .overlay(alignment: .bottom) {
        VStack(spacing: AtomTokens.Space.x2) {
          ForEach(resolution.cornerFlyouts) { flyout in
            // AtomNotice is already a tinted card; a second surface around it
            // would nest one card in another.
            AtomInformCard(message: flyout, content: flyout.content(context)) {
              store.dismiss(flyout)
            }
            .transition(.move(edge: .bottom).combined(with: .opacity))
          }
        }
        .padding(AtomTokens.Space.x4)
      }
      .alert(
        dialogContent?.title ?? "",
        isPresented: presented(dialog, when: usesAlert),
        presenting: dialogContent
      ) { content in
        // Choosing an action closes the alert, so it also records the dismissal:
        // otherwise the arbiter would present the same dialog again.
        ForEach(content.actions) { action in
          Button(action.label, role: action.role == .primary ? nil : .cancel) {
            action.perform()
            if let dialog { store.dismiss(dialog) }
          }
        }
      } message: { content in
        Text(content.body)
      }
      .sheet(isPresented: presented(dialog, when: !usesAlert)) {
        if let dialog, let dialogContent {
          AtomInformSheet(content: dialogContent) {
            store.dismiss(dialog)
          }
        }
      }
  }

  /// Presented while the arbiter resolves a dialog; closing it dismisses the message.
  private func presented(_ dialog: AtomInformMessage?, when condition: Bool) -> Binding<Bool> {
    Binding(
      get: { dialog != nil && condition },
      set: { isPresented in
        if !isPresented, let dialog { store.dismiss(dialog) }
      }
    )
  }
}

/// A dialog with more than two actions: title, body and one button per action.
struct AtomInformSheet: View {
  let content: AtomInformContent
  let onDismiss: () -> Void

  var body: some View {
    NavigationStack {
      VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
        Text(content.body)
          .frame(maxWidth: .infinity, alignment: .leading)
        ForEach(content.actions) { action in
          AtomButton(
            variant: action.role == .primary ? .primary : .outline,
            fullWidth: true,
            action: {
              action.perform()
              onDismiss()
            }
          ) {
            Text(action.label)
          }
        }
        Spacer(minLength: 0)
      }
      .padding(AtomTokens.Space.x4)
      .navigationTitle(content.title ?? "")
      .navigationBarTitleDisplayModeInline()
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Close", action: onDismiss)
        }
      }
    }
    .presentationDetents([.medium, .large])
  }
}

extension View {
  fileprivate func navigationBarTitleDisplayModeInline() -> some View {
    #if os(iOS)
      navigationBarTitleDisplayMode(.inline)
    #else
      self
    #endif
  }

  /// Show the inform messages the arbiter resolves for this route: a banner at
  /// the top, a dialog as an alert or sheet, and up to three flyouts at the
  /// bottom edge. Dismissals go to `store`, which updates the view.
  public func atomInform(
    _ messages: [AtomInformMessage],
    route: String,
    store: AtomInformDismissalStore,
    isAnchorAvailable: @escaping (String) -> Bool = { _ in false }
  ) -> some View {
    modifier(
      AtomInformModifier(
        messages: messages,
        route: route,
        store: store,
        isAnchorAvailable: isAnchorAvailable
      )
    )
  }
}
