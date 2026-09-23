import Atom63UI
import SwiftUI

struct CatalogView: View {
  @State private var query = ""

  private var visibleSections: [CatalogSection] {
    CatalogRegistry.sections.filter {
      !CatalogRegistry.items(in: $0, matching: query).isEmpty
    }
  }

  var body: some View {
    NavigationStack {
      List {
        CatalogIntroduction()

        ForEach(visibleSections) { section in
          CatalogSectionRows(
            section: section,
            items: CatalogRegistry.items(in: section, matching: query)
          )
        }
      }
      .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
      .overlay {
        if visibleSections.isEmpty {
          ContentUnavailableView.search(text: query)
        }
      }
      .navigationTitle("Catalog")
      .searchable(text: $query, prompt: "Search components and intents")
      .navigationDestination(for: CatalogItem.self) { item in
        CatalogDetailView(item: item)
      }
      .accessibilityIdentifier("catalog-root")
    }
  }
}

private struct CatalogIntroduction: View {
  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      Label("Atom63UI", systemImage: "swift")
        .font(.title2.weight(.semibold))
        .foregroundStyle(.primary)

      Text(
        "Native SwiftUI components, shared design intent, and generated foundation tokens in one executable reference."
      )
      .font(.subheadline)
      .foregroundStyle(.secondary)

      HStack(spacing: AtomTokens.Space.x2) {
        AtomBadge("\(CatalogRegistry.items.count) entries", tone: .accent)
        AtomBadge("iOS 17+", tone: .neutral)
        AtomBadge("Native", tone: .success)
      }
    }
    .padding(.vertical, AtomTokens.Space.x2)
    .accessibilityElement(children: .contain)
    .listRowBackground(Color.clear)
  }
}

private struct CatalogSectionRows: View {
  let section: CatalogSection
  let items: [CatalogItem]

  var body: some View {
    Section {
      ForEach(items) { item in
        NavigationLink(value: item) {
          CatalogItemRow(item: item)
        }
        .accessibilityIdentifier("catalog-item-\(item.rawValue)")
      }
    } header: {
      Label(section.rawValue, systemImage: section.systemImage)
    }
  }
}

private struct CatalogItemRow: View {
  let item: CatalogItem

  var body: some View {
    Label {
      VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
        Text(item.title)
          .font(.body)
        Text(item.summary)
          .font(.footnote)
          .foregroundStyle(.secondary)
          .lineLimit(2)
      }
    } icon: {
      Image(systemName: item.symbol)
        .foregroundStyle(.tint)
        .frame(width: 28)
        .accessibilityHidden(true)
    }
    .padding(.vertical, AtomTokens.Space.x1)
  }
}

private enum CatalogAppearance: String, CaseIterable, Identifiable {
  case system = "System"
  case light = "Light"
  case dark = "Dark"

  var id: Self { self }

  func resolve(in inherited: ColorScheme) -> ColorScheme {
    switch self {
    case .system: inherited
    case .light: .light
    case .dark: .dark
    }
  }
}

private enum CatalogTypeSize: String, CaseIterable, Identifiable {
  case system = "System"
  case small = "Small"
  case large = "Large"
  case accessibility = "Accessibility 3"

  var id: Self { self }

  func resolve(in inherited: DynamicTypeSize) -> DynamicTypeSize {
    switch self {
    case .system: inherited
    case .small: .small
    case .large: .large
    case .accessibility: .accessibility3
    }
  }
}

private enum CatalogMotion: String, CaseIterable, Identifiable {
  case system = "System"
  case reduced = "Reduced motion"

  var id: Self { self }

  var preference: AtomMotionPreference {
    switch self {
    case .system: .system
    case .reduced: .reduced
    }
  }
}

private struct CatalogDetailView: View {
  let item: CatalogItem

  @State private var appearance: CatalogAppearance = .system
  @State private var typeSize: CatalogTypeSize = .system
  @State private var motion: CatalogMotion = .system
  @State private var showsEnvironment = false

  var body: some View {
    ScrollView {
      LazyVStack(alignment: .leading, spacing: AtomTokens.Space.x5) {
        CatalogDetailHeader(item: item)

        CatalogPreviewCanvas(
          appearance: appearance,
          typeSize: typeSize,
          motion: motion
        ) {
          CatalogShowcase(item: item)
        }

        if let contract = item.conformanceContract {
          CatalogContractCard(contract: contract)
        }

        CatalogSourceCard(item: item)
      }
      .padding(AtomTokens.Space.x4)
      .frame(maxWidth: 760)
      .frame(maxWidth: .infinity)
    }
    .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
    .navigationTitle(item.title)
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        Button("Preview environment", systemImage: "slider.horizontal.3") {
          showsEnvironment = true
        }
        .accessibilityIdentifier("catalog-environment")
      }
    }
    .sheet(isPresented: $showsEnvironment) {
      CatalogEnvironmentSettings(
        appearance: $appearance,
        typeSize: $typeSize,
        motion: $motion
      )
      .presentationDetents([.large])
    }
    .accessibilityIdentifier("catalog-detail-\(item.rawValue)")
  }
}

private struct CatalogDetailHeader: View {
  let item: CatalogItem

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      Label(item.section.rawValue, systemImage: item.section.systemImage)
        .font(.footnote.weight(.semibold))
        .foregroundStyle(.tint)

      Text(item.summary)
        .font(.body)
        .foregroundStyle(.secondary)

      Text(item.typeName)
        .font(.caption.monospaced())
        .foregroundStyle(.secondary)
        .textSelection(.enabled)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

private struct CatalogPreviewCanvas<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var inheritedColorScheme
  @Environment(\.dynamicTypeSize) private var inheritedTypeSize

  let appearance: CatalogAppearance
  let typeSize: CatalogTypeSize
  let motion: CatalogMotion
  @ViewBuilder let content: Content

  private var colorScheme: ColorScheme {
    appearance.resolve(in: inheritedColorScheme)
  }

  private var dynamicTypeSize: DynamicTypeSize {
    typeSize.resolve(in: inheritedTypeSize)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x4) {
      ViewThatFits(in: .horizontal) {
        HStack {
          Label(appearance.rawValue, systemImage: appearanceSymbol)
          Spacer()
          Label(typeSize.rawValue, systemImage: "textformat.size")
          Label(motion.rawValue, systemImage: "figure.walk.motion")
        }

        VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
          Label(appearance.rawValue, systemImage: appearanceSymbol)
          Label(typeSize.rawValue, systemImage: "textformat.size")
          Label(motion.rawValue, systemImage: "figure.walk.motion")
        }
      }
      .font(.caption)
      .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))

      Divider()

      content
    }
    .padding(AtomTokens.Space.x4)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(theme.colors.surfacePage.resolve(for: colorScheme))
    .overlay {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.extraLarge)
        .strokeBorder(theme.colors.borderSubtle.resolve(for: colorScheme))
    }
    .compositingGroup()
    .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
    .environment(\.colorScheme, colorScheme)
    .environment(\.dynamicTypeSize, dynamicTypeSize)
    .atomMotionPreference(motion.preference)
    .accessibilityElement(children: .contain)
    .accessibilityLabel("Component preview")
  }

  private var appearanceSymbol: String {
    switch appearance {
    case .system: "circle.lefthalf.filled"
    case .light: "sun.max"
    case .dark: "moon"
    }
  }
}

private struct CatalogEnvironmentSettings: View {
  @Environment(\.dismiss) private var dismiss

  @Binding var appearance: CatalogAppearance
  @Binding var typeSize: CatalogTypeSize
  @Binding var motion: CatalogMotion

  var body: some View {
    NavigationStack {
      Form {
        Section("Appearance") {
          Picker("Color scheme", selection: $appearance) {
            ForEach(CatalogAppearance.allCases) { option in
              Text(option.rawValue).tag(option)
            }
          }
          .pickerStyle(.segmented)
          .accessibilityIdentifier("catalog-appearance")
        }

        Section("Typography") {
          Picker("Dynamic Type", selection: $typeSize) {
            ForEach(CatalogTypeSize.allCases) { option in
              Text(option.rawValue).tag(option)
            }
          }
          .accessibilityIdentifier("catalog-type-size")
        }

        Section("Motion") {
          Picker("Motion", selection: $motion) {
            ForEach(CatalogMotion.allCases) { option in
              Text(option.rawValue).tag(option)
            }
          }
          .pickerStyle(.segmented)
          .accessibilityIdentifier("catalog-motion")
        }
      }
      .navigationTitle("Preview environment")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .confirmationAction) {
          Button("Done", action: dismiss.callAsFunction)
        }
      }
    }
  }
}

private struct CatalogContractCard: View {
  let contract: AtomComponentContract

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      ViewThatFits(in: .horizontal) {
        HStack {
          contractHeading
          Spacer()
          contractBadges
        }

        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          contractHeading
          contractBadges
        }
      }

      LabeledContent("Foundation", value: contract.foundationContract)
      LabeledContent("Contract axis", value: contract.foundationAxis)
      LabeledContent("React", value: contract.reactRenderer)
      LabeledContent("SwiftUI", value: contract.swiftUIRenderer)

      Divider()

      contractList("System intent", values: [contract.intent])
      contractList("Required states", values: contract.requiredStates)
      if !contract.stateTones.isEmpty {
        contractList(
          "State tones",
          values: contract.requiredStates.compactMap { state in
            contract.stateTones[state].map { "\(state): \($0)" }
          }
        )
      }
      contractList("Shared outcomes", values: contract.sharedOutcomes)
      contractList("Accessibility", values: contract.accessibilityOutcomes)

      if let motion = contract.motion {
        contractList(
          "Motion recipe",
          values: [
            motion.kind,
            motion.durationToken,
            motion.easing,
            motion.direction,
            "Reduce Motion: \(motion.reducedMotion)",
          ]
        )
      }

      contractList("React adaptations", values: contract.platformAdaptations.react)
      contractList("SwiftUI adaptations", values: contract.platformAdaptations.swiftUI)
    }
    .padding(AtomTokens.Space.x4)
    .background(.background.secondary)
    .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
    .accessibilityElement(children: .contain)
  }

  private var rendererEvidence: AtomRendererConformanceEvidence? {
    AtomRendererConformance.evidence(contractId: contract.id)
  }

  private var contractHeading: some View {
    Text("Cross-renderer contract")
      .font(.headline)
  }

  private var contractBadges: some View {
    HStack(spacing: AtomTokens.Space.x2) {
      AtomBadge(
        rendererEvidence == nil ? "declared" : "verified",
        tone: rendererEvidence == nil ? .neutral : .success
      )
      AtomBadge(contract.parity.rawValue, tone: parityTone)
    }
  }

  private func contractList(_ title: String, values: [String]) -> some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
      Text(title)
        .font(.subheadline.weight(.semibold))
      Text(values.joined(separator: " · "))
        .font(.footnote.monospaced())
        .foregroundStyle(.secondary)
        .textSelection(.enabled)
    }
  }

  private var parityTone: AtomBadgeTone {
    switch contract.parity {
    case .strict: .success
    case .recipe: .accent
    case .platformAdaptive: .neutral
    }
  }
}

private struct CatalogSourceCard: View {
  let item: CatalogItem

  var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x3) {
      HStack {
        Text("Usage")
          .font(.headline)
          .accessibilityAddTraits(.isHeader)

        Spacer()

        ShareLink(item: item.usage) {
          Label("Share code", systemImage: "square.and.arrow.up")
            .labelStyle(.iconOnly)
        }
        .accessibilityLabel("Share usage code")
      }

      ScrollView(.horizontal) {
        Text(item.usage)
          .font(.caption.monospaced())
          .foregroundStyle(.primary)
          .textSelection(.enabled)
          .padding(AtomTokens.Space.x3)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(.quaternary)
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.large))
    }
    .accessibilityIdentifier("catalog-source")
  }
}
