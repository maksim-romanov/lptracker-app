import SwiftUI

struct PairIconsView: View {
  let pair: WidgetPair
  let iconSize: CGFloat

  var body: some View {
    let overlap = iconSize * 0.32
    ZStack {
      TokenIconView(url: pair.icon1, size: iconSize)
        .offset(x: overlap)
      TokenIconView(url: pair.icon0, size: iconSize)
        .offset(x: -overlap)
    }
    .frame(width: iconSize + overlap * 2, height: iconSize)
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
