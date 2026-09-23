// swift-tools-version: 6.0

// Distribution manifest for remote SwiftPM consumers, who can only resolve a
// Package.swift at the repository root. Local development uses
// packages/ui-ios/Package.swift; keep the two target lists in sync.

import PackageDescription

let package = Package(
  name: "Atom63UI",
  platforms: [
    .iOS(.v17),
    .macOS(.v14),
  ],
  products: [
    .library(name: "Atom63UI", targets: ["Atom63UI"])
  ],
  targets: [
    .target(name: "Atom63UI", path: "packages/ui-ios/Sources/Atom63UI"),
    .testTarget(
      name: "Atom63UITests",
      dependencies: ["Atom63UI"],
      path: "packages/ui-ios/Tests/Atom63UITests"
    ),
  ]
)
