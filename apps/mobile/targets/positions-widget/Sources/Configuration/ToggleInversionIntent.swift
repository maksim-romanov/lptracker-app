import AppIntents
import WidgetKit

struct ToggleInversionIntent: AppIntent {
  static var title: LocalizedStringResource = "Reverse Pair"
  static var description = IntentDescription("Swap base and quote tokens for this position.")

  @Parameter(title: "Position ref") var ref: String

  init() {}

  init(ref: String) {
    self.ref = ref
  }

  func perform() async throws -> some IntentResult {
    InvertedStore.shared.toggle(ref: ref)
    WidgetCenter.shared.reloadTimelines(ofKind: PositionsWidget.kind)
    return .result()
  }
}
