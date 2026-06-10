import SwiftUI

struct UniswapV3TailView: View {
  let payload: UniswapV3Payload
  let status: WidgetStatus

  var body: some View {
    VStack(alignment: .leading, spacing: Spacing.sm) {
      HStack(spacing: Spacing.sm) {
        TagPillView(text: "V3", tone: .neutral)
        TagPillView(text: payload.feeTierLabel, tone: .neutral)
      }
      RangeBarView(status: status)
    }
  }
}
