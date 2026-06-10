import SwiftUI

struct MetaTag: View {
  let text: String
  var size: TagSize = .large

  var body: some View {
    Text(text)
      .font(size.labelFont)
      .foregroundStyle(Color.textMuted)
      .lineLimit(1)
      .fixedSize(horizontal: true, vertical: false)
      .tagChrome(size: size, background: Color.textPrimary.opacity(Opacity.strokeSubtle))
  }
}
