public struct AtomRendererConformanceEvidence: Equatable, Identifiable, Sendable {
  public let contractId: String
  public let implementedStates: [String]
  public let verifiedSharedOutcomes: [String]
  public let verifiedAccessibilityOutcomes: [String]
  public let verifiesMotionRecipe: Bool

  public var id: String { contractId }
}

public enum AtomRendererConformance {
  public static let verified: [AtomRendererConformanceEvidence] = [
    AtomRendererConformanceEvidence(
      contractId: "button",
      implementedStates: ["rest", "pressed", "disabled", "loading"],
      verifiedSharedOutcomes: [
        "action-fires-once",
        "loading-blocks-repeat-activation",
        "disabled-prevents-activation",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "announces-loading",
        "disabled-while-loading",
      ],
      verifiesMotionRecipe: true
    ),
    AtomRendererConformanceEvidence(
      contractId: "alert",
      implementedStates: ["info", "success", "warning", "error"],
      verifiedSharedOutcomes: [
        "tone-is-not-conveyed-by-color-alone",
        "message-remains-readable",
        "action-does-not-obscure-status",
      ],
      verifiedAccessibilityOutcomes: [
        "announces-semantic-tone",
        "text-does-not-rely-on-color",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "dialog",
      implementedStates: ["closed", "open", "focus-visible"],
      verifiedSharedOutcomes: [
        "opening-presents-a-modal-context",
        "background-interaction-is-blocked-while-open",
        "dismissal-returns-to-the-originating-context",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-modal-title",
        "keeps-assistive-focus-in-the-modal-context",
        "restores-access-to-the-originating-control",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "alert-dialog",
      implementedStates: ["closed", "open"],
      verifiedSharedOutcomes: [
        "consequential-action-requires-explicit-confirmation",
        "cancel-dismisses-without-performing-the-action",
        "confirmation-performs-the-action-once-and-dismisses",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-alert-dialog-title",
        "exposes-consequence-description",
        "identifies-cancel-and-confirm-actions",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "field",
      implementedStates: ["default", "invalid", "disabled"],
      verifiedSharedOutcomes: [
        "label-identifies-control",
        "description-explains-input",
        "invalid-state-exposes-error",
      ],
      verifiedAccessibilityOutcomes: [
        "associates-label",
        "associates-description",
        "announces-error",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "destination-link",
      implementedStates: ["rest", "focus-visible"],
      verifiedSharedOutcomes: [
        "internal-destination-preserves-application-navigation",
        "external-destination-uses-platform-external-navigation",
        "destination-kind-remains-distinguishable",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-link-label",
        "announces-external-destination-behavior",
        "preserves-native-link-semantics",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "input",
      implementedStates: ["rest", "focus", "disabled", "invalid"],
      verifiedSharedOutcomes: [
        "value-remains-editable-when-enabled",
        "focus-is-visible",
        "invalid-state-is-announced",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "exposes-value",
        "announces-invalid",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "textarea",
      implementedStates: ["rest", "focus", "disabled", "invalid"],
      verifiedSharedOutcomes: [
        "multi-line-value-remains-editable",
        "focus-is-visible",
        "invalid-state-is-announced",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "exposes-value",
        "announces-invalid",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "switch",
      implementedStates: ["off", "on", "disabled"],
      verifiedSharedOutcomes: [
        "value-is-boolean",
        "activation-toggles-value",
        "disabled-prevents-change",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "exposes-boolean-value",
        "preserves-native-control-role",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "select",
      implementedStates: ["closed", "open", "disabled", "selected-item", "disabled-item"],
      verifiedSharedOutcomes: [
        "current-selection-remains-visible",
        "activation-reveals-available-options",
        "choosing-an-option-updates-the-value-once",
        "disabled-controls-and-options-prevent-selection",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "exposes-selected-value",
        "preserves-single-selection-semantics",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "segmented-control",
      implementedStates: ["rest", "selected", "disabled"],
      verifiedSharedOutcomes: [
        "one-segment-is-selected-at-a-time",
        "activation-updates-the-selection-once",
        "disabled-segment-prevents-selection",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-each-segment-label",
        "exposes-selected-state",
        "preserves-single-selection-semantics",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "radio",
      implementedStates: ["unchecked", "checked", "disabled"],
      verifiedSharedOutcomes: [
        "exactly-one-option-may-be-selected",
        "activation-moves-selection-to-the-chosen-option",
        "disabled-option-prevents-selection",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-group-label",
        "exposes-option-labels-and-selected-state",
        "preserves-single-selection-semantics",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "slider",
      implementedStates: ["rest", "dragging", "disabled"],
      verifiedSharedOutcomes: [
        "value-remains-within-the-declared-range",
        "interaction-updates-value-using-the-declared-step",
        "disabled-control-prevents-value-change",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "exposes-current-value-and-range",
        "supports-adjustable-actions",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "dropdown-menu",
      implementedStates: ["closed", "open", "disabled", "checked", "destructive"],
      verifiedSharedOutcomes: [
        "enabled-action-executes-once-and-dismisses-the-menu",
        "disabled-action-does-not-execute",
        "checked-choice-exposes-its-current-state",
        "destructive-action-retains-destructive-intent",
      ],
      verifiedAccessibilityOutcomes: [
        "trigger-exposes-menu-availability",
        "items-expose-label-role-and-disabled-state",
        "checked-items-expose-selected-or-checked-state",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "accordion",
      implementedStates: ["closed", "open", "disabled"],
      verifiedSharedOutcomes: [
        "activation-toggles-associated-content-visibility",
        "expanded-state-matches-content-visibility",
        "disabled-trigger-prevents-disclosure-change",
      ],
      verifiedAccessibilityOutcomes: [
        "trigger-exposes-expanded-state",
        "trigger-is-associated-with-disclosed-content",
        "disabled-trigger-exposes-disabled-state",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "calendar",
      implementedStates: ["rest", "selected", "disabled"],
      verifiedSharedOutcomes: [
        "selection-updates-to-an-allowed-date",
        "disabled-date-prevents-selection",
        "selected-date-remains-visible",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-control-label",
        "dates-expose-complete-date-names",
        "selected-date-exposes-selected-state",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "search-field",
      implementedStates: ["empty", "query", "focus", "disabled"],
      verifiedSharedOutcomes: [
        "editing-updates-the-query",
        "clear-empties-the-query-and-preserves-input-context",
        "submit-commits-the-current-query-once",
        "disabled-search-prevents-editing-and-clear",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-search-input-role-and-label",
        "clear-action-has-an-accessible-label",
        "disabled-state-is-exposed",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "tabs",
      implementedStates: ["rest", "selected"],
      verifiedSharedOutcomes: [
        "one-tab-is-selected-at-a-time",
        "selection-reveals-the-associated-content",
        "selected-tab-remains-visually-distinguishable",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-tab-labels",
        "exposes-selected-state",
        "associates-selection-with-visible-content",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "load-more-trigger",
      implementedStates: ["idle", "loading", "failed", "exhausted"],
      verifiedSharedOutcomes: [
        "loading-is-announced",
        "failure-provides-retry",
        "exhaustion-is-announced",
        "existing-items-remain-stable-while-appending",
      ],
      verifiedAccessibilityOutcomes: [
        "announces-loading",
        "exposes-retry-action",
        "announces-exhausted",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "skeleton",
      implementedStates: ["loading", "reduced-motion"],
      verifiedSharedOutcomes: [
        "placeholder-is-hidden-from-assistive-technology",
        "interaction-is-blocked-while-loading",
        "reduced-motion-result-is-static",
      ],
      verifiedAccessibilityOutcomes: [
        "hidden-from-accessibility-tree",
        "blocks-interaction-while-active",
      ],
      verifiesMotionRecipe: true
    ),
    AtomRendererConformanceEvidence(
      contractId: "toggle",
      implementedStates: ["off", "on", "disabled"],
      verifiedSharedOutcomes: [
        "selected-state-is-visible",
        "activation-toggles-selection",
        "disabled-prevents-change",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "announces-selected-state",
        "preserves-button-role",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "card",
      implementedStates: ["rest", "interactive", "focus-visible"],
      verifiedSharedOutcomes: [
        "content-order-is-preserved",
        "static-card-does-not-imply-action",
        "interactive-card-has-one-primary-action",
      ],
      verifiedAccessibilityOutcomes: [
        "preserves-content-order",
        "does-not-imply-action-when-static",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "badge",
      implementedStates: ["neutral", "accent", "success", "warning", "error"],
      verifiedSharedOutcomes: [
        "label-remains-readable-without-color",
        "semantic-tone-retains-meaning",
      ],
      verifiedAccessibilityOutcomes: [
        "text-does-not-rely-on-color"
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "avatar",
      implementedStates: ["loading", "loaded", "fallback"],
      verifiedSharedOutcomes: [
        "accessible-name-is-preserved",
        "fallback-preserves-identity",
        "loading-does-not-expose-empty-image",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-accessible-name",
        "fallback-preserves-identity",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "empty",
      implementedStates: ["empty", "error"],
      verifiedSharedOutcomes: [
        "heading-explains-state",
        "supporting-copy-provides-context",
        "recovery-action-remains-available",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-heading",
        "exposes-recovery-action",
        "preserves-reading-order",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "progress",
      implementedStates: ["indeterminate", "progressing", "complete"],
      verifiedSharedOutcomes: [
        "label-identifies-operation",
        "determinate-value-is-exposed",
        "completion-is-distinguishable",
      ],
      verifiedAccessibilityOutcomes: [
        "exposes-label",
        "announces-progress-value",
      ],
      verifiesMotionRecipe: false
    ),
    AtomRendererConformanceEvidence(
      contractId: "toaster",
      implementedStates: ["visible", "dismissing", "reduced-motion"],
      verifiedSharedOutcomes: [
        "message-is-announced",
        "focus-is-not-trapped",
        "dismissal-respects-motion-preference",
      ],
      verifiedAccessibilityOutcomes: [
        "announces-message",
        "does-not-trap-focus",
      ],
      verifiesMotionRecipe: true
    ),
  ]

  public static func evidence(contractId: String) -> AtomRendererConformanceEvidence? {
    verified.first { $0.contractId == contractId }
  }
}
