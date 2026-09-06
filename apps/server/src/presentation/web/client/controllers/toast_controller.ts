import { Controller } from "@hotwired/stimulus";

export default class ToastController extends Controller<HTMLElement> {
  static targets = ["message"];
  static values = { timeout: { type: Number, default: 4000 }, kind: String };

  declare readonly messageTarget: HTMLElement;
  declare readonly timeoutValue: number;
  declare readonly kindValue: string;

  private timer?: ReturnType<typeof setTimeout>;

  disconnect(): void {
    this.clearTimer();
  }

  // One `depthly:toast` event reaches every kind's toast instance (they all listen on
  // <body>) — the ones that aren't its kind hide, so an error never sits behind/beside an
  // already-showing info toast.
  show(event: CustomEvent<{ message?: string; kind?: string }>): void {
    const message = event.detail?.message;
    if (!message) return;

    if ((event.detail?.kind ?? "info") !== this.kindValue) {
      this.hide();
      return;
    }

    this.messageTarget.textContent = message;
    // Re-promotes into the top layer on each show, so a <dialog> opened since the last time
    // (application.ts's one boot-time call only covers the two uncontrolled toasts) never
    // outranks it. Already open just means a second message arrived before the first timed out.
    if (!this.element.matches(":popover-open")) this.element.showPopover();
    this.element.setAttribute("data-open", "");
    this.clearTimer();
    this.timer = setTimeout(() => this.hide(), this.timeoutValue);
  }

  hide(): void {
    this.clearTimer();
    this.element.removeAttribute("data-open");
    // Drops back out of the top layer so the next show() re-promotes above whatever <dialog> is
    // open by then, rather than wherever it ranked when first shown.
    if (this.element.matches(":popover-open")) this.element.hidePopover();
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }
}
