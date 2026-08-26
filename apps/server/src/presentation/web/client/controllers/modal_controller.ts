import { Controller } from "@hotwired/stimulus";

export default class ModalController extends Controller {
  static targets = ["box"];

  declare readonly boxTarget: HTMLElement;

  private get dialog(): HTMLDialogElement {
    return this.element as HTMLDialogElement;
  }

  connect(): void {
    document.body.addEventListener("htmx:afterSwap", this.onAfterSwap);
    document.body.addEventListener("keydown", this.onKeydown);
  }

  disconnect(): void {
    document.body.removeEventListener("htmx:afterSwap", this.onAfterSwap);
    document.body.removeEventListener("keydown", this.onKeydown);
  }

  // htmx:afterSwap fires per inserted child, not once on the target itself, hence contains().
  private onAfterSwap = (event: Event): void => {
    if (!this.boxTarget.contains(event.target as Node)) return;
    if (!this.dialog.open) this.dialog.showModal();
  };

  // htmx's keyup[key=='…'] filter misfires on every key, so handle keys here.
  private onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const el = document.activeElement;
    if (el instanceof HTMLElement && el.classList.contains("position-card")) {
      event.preventDefault();
      el.click();
    }
  };
}
