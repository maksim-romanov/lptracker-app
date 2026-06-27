import { Controller } from "@hotwired/stimulus";

// CSP (`style-src 'self'`) blocks inline styles, so positions are set here.
export default class RangeController extends Controller {
  connect(): void {
    const el = this.element as HTMLElement;
    const apply = (prop: string, attr: string) => {
      const value = el.getAttribute(attr);
      if (value !== null) el.style.setProperty(prop, `${value}%`);
    };
    apply("--band-left", "data-band-left");
    apply("--band-width", "data-band-width");
    apply("--thumb", "data-thumb");
  }
}
