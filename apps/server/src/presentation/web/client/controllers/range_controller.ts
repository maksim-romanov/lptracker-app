import { Controller } from "@hotwired/stimulus";

// CSP (`style-src 'self'`) blocks inline styles, so positions are set here.
export default class RangeController extends Controller<HTMLElement> {
  static values = { bandLeft: Number, bandWidth: Number, thumb: Number };

  declare readonly bandLeftValue: number;
  declare readonly bandWidthValue: number;
  declare readonly thumbValue: number;

  bandLeftValueChanged(value: number): void {
    this.element.style.setProperty("--band-left", `${value}%`);
  }

  bandWidthValueChanged(value: number): void {
    this.element.style.setProperty("--band-width", `${value}%`);
  }

  thumbValueChanged(value: number): void {
    this.element.style.setProperty("--thumb", `${value}%`);
  }
}
