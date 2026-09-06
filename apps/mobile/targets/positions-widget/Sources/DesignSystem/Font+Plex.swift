import SwiftUI

/// The four IBM Plex faces bundled with the widget. Sans sets words, mono sets figures —
/// the same split the app and the web use.
///
/// The raw values are PostScript names, which IBM Plex abbreviates: `-Medm`, not `-Medium`;
/// `-SmBld`, not `-SemiBold`. `Font.custom` fails over to the system font without warning
/// when the name is wrong, so these must match what `fc-scan` reports for the bundled files.
enum PlexFace {
  case sansMedium, sansSemiBold, monoMedium, monoSemiBold

  var fontName: String {
    switch self {
    case .sansMedium: return "IBMPlexSans-Medm"
    case .sansSemiBold: return "IBMPlexSans-SmBld"
    case .monoMedium: return "IBMPlexMono-Medm"
    case .monoSemiBold: return "IBMPlexMono-SmBld"
    }
  }
}

extension Font {
  static func plex(
    _ face: PlexFace,
    size: CGFloat,
    relativeTo style: Font.TextStyle = .body
  ) -> Font {
    .custom(face.fontName, size: size, relativeTo: style)
  }
}
