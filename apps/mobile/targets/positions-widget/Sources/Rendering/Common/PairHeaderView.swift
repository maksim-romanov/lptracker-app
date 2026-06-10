import SwiftUI

struct PairHeaderView: View {
  let pair: WidgetPair
  let protocolLabel: String
  let brandColor: String

  var body: some View {
    HStack(spacing: Spacing.sm) {
      pairIcons
      VStack(alignment: .leading, spacing: 2) {
        Text("\(pair.sym0)/\(pair.sym1)")
          .font(TypeScale.headline)
          .foregroundStyle(Color.textPrimary)
        Text(protocolLabel)
          .font(TypeScale.label)
          .foregroundStyle(Color(hex: brandColor))
      }
    }
  }

  @ViewBuilder
  private var pairIcons: some View {
    ZStack {
      AsyncImage(url: URL(string: pair.icon1)) { image in
        image.resizable().scaledToFit()
      } placeholder: {
        Circle().fill(Color.bgVariant)
      }
      .frame(width: 28, height: 28)
      .clipShape(Circle())
      .overlay(Circle().stroke(Color.bgPrimary, lineWidth: 1.5))
      .offset(x: 10)

      AsyncImage(url: URL(string: pair.icon0)) { image in
        image.resizable().scaledToFit()
      } placeholder: {
        Circle().fill(Color.bgVariant)
      }
      .frame(width: 28, height: 28)
      .clipShape(Circle())
      .overlay(Circle().stroke(Color.bgPrimary, lineWidth: 1.5))
      .offset(x: -10)
    }
    .frame(width: 46, height: 28)
  }
}
