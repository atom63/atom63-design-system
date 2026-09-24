/// Resolution over the generated token graph, ported from
/// Scripts/lib/theme-graph.mjs: follow aliases like Figma does, taking each
/// collection's mode from the selection, and read a computed variable from its
/// browser-resolved table.
extension AtomTokenGraph {
    /// Which part of the selection picks a variable's mode.
    enum Selector: Sendable {
        /// The Theme collection: skin × light/dark, as `aqua-dark`.
        case skinMode
        case mode
        case brand
        case surface
        /// A collection outside the selection, stored in the mode iOS uses.
        case fixed
    }

    enum Entry: Sendable {
        case color(AtomColorComponents)
        case alias(String)
    }

    struct Variable: Sendable {
        let selector: Selector
        let values: [String: Entry]
    }

    /// One row per combination: `brand=b3,mode=dark,surface=n2,theme=aqua r g b a`.
    struct Computed: Sendable {
        let variesOn: [String]
        let rows: String
    }

    /// The computed tables, parsed once.
    static let computedValues: [String: [String: AtomColorComponents]] = computed.mapValues { table in
        var values: [String: AtomColorComponents] = [:]
        for row in table.rows.split(separator: "\n") {
            let fields = row.split(separator: " ")
            guard fields.count == 5,
                  let red = Double(fields[1]),
                  let green = Double(fields[2]),
                  let blue = Double(fields[3]),
                  let opacity = Double(fields[4])
            else { preconditionFailure("Malformed computed row: \(row)") }
            values[String(fields[0])] = AtomColorComponents(red: red, green: green, blue: blue, opacity: opacity)
        }
        return values
    }

    static func color(
        _ token: String,
        skin: AtomSkin,
        brand: AtomBrand,
        surface: AtomSurface,
        dark: Bool
    ) -> AtomColorComponents {
        let mode = dark ? "dark" : "light"
        var current = token
        var seen: Set<String> = []
        while true {
            precondition(seen.insert(current).inserted, "Alias cycle at \(current)")
            if let table = computed[current] {
                let key = table.variesOn.map { axis in
                    "\(axis)=\(computedMode(axis, skin: skin, brand: brand, surface: surface, mode: mode))"
                }.joined(separator: ",")
                guard let value = computedValues[current]?[key] else {
                    preconditionFailure("\(current) has no computed value for \(key)")
                }
                return value
            }
            guard let variable = variables[current] else {
                preconditionFailure("\(current) is not in the token graph")
            }
            let modeKey: String = switch variable.selector {
            case .skinMode: "\(skin.rawValue)-\(mode)"
            case .mode: mode
            case .brand: brand.rawValue
            case .surface: surface.rawValue
            case .fixed: ""
            }
            switch variable.values[modeKey] {
            case let .color(components):
                return components
            case let .alias(target):
                current = target
            case nil:
                preconditionFailure("\(current) has no value for \(modeKey)")
            }
        }
    }

    static func dynamicColor(
        _ token: String,
        skin: AtomSkin,
        brand: AtomBrand,
        surface: AtomSurface
    ) -> AtomDynamicColor {
        AtomDynamicColor(
            light: color(token, skin: skin, brand: brand, surface: surface, dark: false),
            dark: color(token, skin: skin, brand: brand, surface: surface, dark: true)
        )
    }

    /// An axis's mode in a computed key; axes outside the selection use iOS's mode.
    private static func computedMode(
        _ axis: String,
        skin: AtomSkin,
        brand: AtomBrand,
        surface: AtomSurface,
        mode: String
    ) -> String {
        switch axis {
        case "theme": skin.rawValue
        case "mode": mode
        case "brand": brand.rawValue
        case "surface": surface.rawValue
        case "design-language": "ios"
        case "input": "pointer"
        case "density": "comfortable"
        case "radius": "default"
        case "type-scale": "normal"
        case "font": "sans"
        case "window-size": "md"
        default: preconditionFailure("Unknown computed axis \(axis)")
        }
    }
}
