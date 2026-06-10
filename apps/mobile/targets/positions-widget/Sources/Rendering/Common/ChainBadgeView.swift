import SwiftUI

struct ChainBadgeView: View {
  let chainID: Int

  var body: some View {
    HStack(spacing: 6) {
      Circle()
        .fill(Color.chain(chainID))
        .frame(width: 6, height: 6)
    }
    .padding(.horizontal, Spacing.sm)
    .padding(.vertical, 3)
    .background(Color.chain(chainID).opacity(0.14))
    .overlay(
      Capsule().stroke(Color.chain(chainID), lineWidth: 1)
    )
    .clipShape(Capsule())
  }
}
