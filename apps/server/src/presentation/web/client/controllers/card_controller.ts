import { Controller } from "@hotwired/stimulus";

// Keyboard activation for a clickable card. htmx's own hx-trigger key filters
// compile through `new Function`, which `script-src 'self'` forbids; Stimulus
// matches keys against a lookup table, so the filter survives the CSP.
export default class CardController extends Controller<HTMLElement> {
  open(): void {
    this.element.click();
  }
}
