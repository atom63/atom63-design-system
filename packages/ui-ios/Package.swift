// swift-tools-version: 6.0

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
    .target(name: "Atom63UI"),
    .testTarget(name: "Atom63UITests", dependencies: ["Atom63UI"]),
  ]
)
