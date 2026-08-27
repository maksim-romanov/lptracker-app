import { Controller } from "@hotwired/stimulus";

export default class ToastController extends Controller {
  static targets = ["message"];
  static values = { timeout: { type: Number, default: 4000 } };

  declare readonly messageTarget: HTMLElement;
  declare readonly timeoutValue: number;

  private timer?: ReturnType<typeof setTimeout>;

  disconnect(): void {
    this.clearTimer();
  }

  show(event: CustomEvent<{ message?: string }>): void {
    const message = event.detail?.message;
    if (!message) return;

    this.messageTarget.textContent = message;
    this.element.setAttribute("data-open", "");
    this.clearTimer();
    this.timer = setTimeout(() => this.hide(), this.timeoutValue);
  }

  hide(): void {
    this.clearTimer();
    this.element.removeAttribute("data-open");
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }
}
