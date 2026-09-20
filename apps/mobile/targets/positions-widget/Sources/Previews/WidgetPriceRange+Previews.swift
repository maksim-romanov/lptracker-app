#if DEBUG
  import Foundation

  extension WidgetPriceRange {
    static let inRangePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "1900",
        upper: "2100",
        current: "2000",
        lowerLabel: "1900",
        upperLabel: "2100",
        currentLabel: "2000"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.000476",
        upper: "0.000526",
        current: "0.0005",
        lowerLabel: "0.000476",
        upperLabel: "0.000526",
        currentLabel: "0.0005"
      )
    )

    static let outOfRangePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "60000",
        upper: "62000",
        current: "65000",
        lowerLabel: "60000",
        upperLabel: "62000",
        currentLabel: "65000"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.000016",
        upper: "0.000017",
        current: "0.000015",
        lowerLabel: "0.000016",
        upperLabel: "0.000017",
        currentLabel: "0.000015"
      )
    )

    static let edgeLeftPreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "0.82",
        upper: "0.92",
        current: "0.8205",
        lowerLabel: "0.82",
        upperLabel: "0.92",
        currentLabel: "0.8205"
      ),
      inverted: WidgetPriceBounds(
        lower: "1.0869",
        upper: "1.2195",
        current: "1.2187",
        lowerLabel: "1.09",
        upperLabel: "1.22",
        currentLabel: "1.22"
      )
    )

    static let tightStablePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "0.995",
        upper: "1.005",
        current: "1.001",
        lowerLabel: "0.995",
        upperLabel: "1",
        currentLabel: "1"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.995",
        upper: "1.005",
        current: "0.999",
        lowerLabel: "0.995",
        upperLabel: "1.01",
        currentLabel: "0.999"
      )
    )

    static let wideRangePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "1200",
        upper: "3200",
        current: "2000",
        lowerLabel: "1200",
        upperLabel: "3200",
        currentLabel: "2000"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.000313",
        upper: "0.000833",
        current: "0.0005",
        lowerLabel: "0.000313",
        upperLabel: "0.000833",
        currentLabel: "0.0005"
      )
    )

    static let veryWidePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "400",
        upper: "9000",
        current: "2000",
        lowerLabel: "400",
        upperLabel: "9000",
        currentLabel: "2000"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.000111",
        upper: "0.0025",
        current: "0.0005",
        lowerLabel: "0.000111",
        upperLabel: "0.0025",
        currentLabel: "0.0005"
      )
    )

    static let farOutAbovePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "60000",
        upper: "62000",
        current: "95000",
        lowerLabel: "60000",
        upperLabel: "62000",
        currentLabel: "95000"
      ),
      inverted: WidgetPriceBounds(
        lower: "0.000016",
        upper: "0.000017",
        current: "0.000011",
        lowerLabel: "0.000016",
        upperLabel: "0.000017",
        currentLabel: "0.000011"
      )
    )

    static let farOutBelowPreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: "0.82",
        upper: "0.92",
        current: "0.55",
        lowerLabel: "0.82",
        upperLabel: "0.92",
        currentLabel: "0.55"
      ),
      inverted: WidgetPriceBounds(
        lower: "1.0869",
        upper: "1.2195",
        current: "1.8181",
        lowerLabel: "1.09",
        upperLabel: "1.22",
        currentLabel: "1.82"
      )
    )

    static let fullRangePreview = WidgetPriceRange(
      quoted: WidgetPriceBounds(
        lower: nil,
        upper: nil,
        current: "2000",
        lowerLabel: "0",
        upperLabel: "∞",
        currentLabel: "2000"
      ),
      inverted: WidgetPriceBounds(
        lower: nil,
        upper: nil,
        current: "0.0005",
        lowerLabel: "0",
        upperLabel: "∞",
        currentLabel: "0.0005"
      )
    )
  }
#endif
