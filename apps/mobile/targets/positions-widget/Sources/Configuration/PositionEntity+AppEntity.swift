import AppIntents

extension PositionEntity: AppEntity {
  static var typeDisplayRepresentation: TypeDisplayRepresentation {
    TypeDisplayRepresentation(name: "Position")
  }

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(displayPair)", subtitle: "\(protocolLabel)")
  }

  static var defaultQuery = PositionQuery()
}
