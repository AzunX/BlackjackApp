// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BlackjackApp",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(name: "BlackjackApp", targets: ["BlackjackApp"]),
    ],
    targets: [
        .target(
            name: "BlackjackApp",
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
            name: "BlackjackAppTests",
            dependencies: ["BlackjackApp"],
            path: "BlackjackAppTests"
        ),
    ]
)
