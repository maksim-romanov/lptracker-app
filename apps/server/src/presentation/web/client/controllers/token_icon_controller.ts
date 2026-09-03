import { Controller } from "@hotwired/stimulus";

// Reveals the monogram disc when a token's logo does not load. The `error` event is also
// checked on connect: images start loading while the document parses, so on a cold board most
// of the failures have already fired by the time Stimulus starts and no listener would hear
// them. `complete` with a zero intrinsic width is how a finished-but-failed image reads.
export default class TokenIconController extends Controller<HTMLElement> {
  static targets = ["image", "fallback"];

  declare readonly imageTarget: HTMLImageElement;
  declare readonly fallbackTarget: HTMLElement;

  connect(): void {
    if (this.imageTarget.complete && this.imageTarget.naturalWidth === 0) this.failed();
  }

  failed(): void {
    this.imageTarget.remove();
    this.fallbackTarget.hidden = false;
  }
}
