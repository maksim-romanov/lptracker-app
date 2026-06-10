import SwiftUI

struct ChainTag: View {
  let chainID: Int
  var size: TagSize = .large

  var body: some View {
    HStack(spacing: size.internalSpacing) {
      Circle()
        .fill(Color.chain(chainID))
        .frame(width: size.dotSize, height: size.dotSize)
      Text(ChainCatalog.shortName(for: chainID))
        .font(size.labelFont)
        .foregroundStyle(Color.textMuted)
        .lineLimit(1)
        .fixedSize(horizontal: true, vertical: false)
    }
    .tagChrome(size: size, background: Color.textPrimary.opacity(Opacity.strokeSubtle))
  }
}
