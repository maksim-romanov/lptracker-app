import SwiftUI

struct PairHeaderView: View {
  let pair: WidgetPair
  let protocolLabel: String
  let brandColor: String
  let iconSize: CGFloat
  let showProtocol: Bool

  init(
    pair: WidgetPair,
    protocolLabel: String,
    brandColor: String,
    iconSize: CGFloat = 24,
    showProtocol: Bool = true
  ) {
    self.pair = pair
    self.protocolLabel = protocolLabel
    self.brandColor = brandColor
    self.iconSize = iconSize
    self.showProtocol = showProtocol
  }

  var body: some View {
    HStack(spacing: Spacing.sm) {
      pairIcons
      VStack(alignment: .leading, spacing: 1) {
        Text("\(pair.sym0) / \(pair.sym1)")
          .font(.satoshi(.bold, size: iconSize >= 28 ? 17 : 15))
          .foregroundStyle(Color.textPrimary)
          .lineLimit(1)
          .minimumScaleFactor(0.7)
        if showProtocol {
          Text(protocolLabel)
            .font(.satoshi(.medium, size: 11))
            .foregroundStyle(Color(hex: brandColor))
            .lineLimit(1)
        }
      }
    }
  }

  @ViewBuilder
  private var pairIcons: some View {
    let offset = iconSize * 0.32
    ZStack {
      TokenIconView(url: pair.icon1, size: iconSize)
        .offset(x: offset)

      TokenIconView(url: pair.icon0, size: iconSize)
        .offset(x: -offset)
    }
    .frame(width: iconSize + offset * 2, height: iconSize)
  }
}

struct TokenIconView: View {
  let url: String
  let size: CGFloat

  var body: some View {
    AsyncImage(url: URL(string: url)) { image in
      image.resizable().scaledToFit()
    } placeholder: {
      Circle().fill(Color.bgVariant)
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
    .overlay(Circle().stroke(Color.bgPrimary, lineWidth: 1.5))
  }
}
