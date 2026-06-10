import Foundation

/// A single token amount paired with its symbol — the unit displayed in
/// stat lines and rows. `value == nil` renders as an em-dash placeholder.
struct TokenAmount {
  let value: String?
  let symbol: String?
}
