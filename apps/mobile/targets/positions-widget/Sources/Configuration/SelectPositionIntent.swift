import AppIntents
import WidgetKit

struct SelectPositionIntent: AppIntent, WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Select Position"
  static var description = IntentDescription("Pick one of your followed LP positions.")

  @Parameter(title: "Position") var position: PositionEntity?

  init() {}

  init(position: PositionEntity?) {
    self.position = position
  }

  func perform() async throws -> some IntentResult {
    .result()
  }
}
