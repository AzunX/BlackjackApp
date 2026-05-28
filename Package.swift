// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BlackjackEngine",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(name: "BlackjackEngine", targets: ["BlackjackEngine"]),
    ],
    targets: [
        .target(
            name: "BlackjackEngine",
            path: "BlackjackApp",
            sources: [
                "Domain/Models",
                "Domain/Strategy",
                "Domain/Engine",
                "Data",
                "Presentation/ViewModels",
            ]
        ),
        .testTarget(
            name: "BlackjackEngineTests",
            dependencies: ["BlackjackEngine"],
            path: "BlackjackAppTests"
        ),
    ]
)
