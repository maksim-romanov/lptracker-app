import { Controller } from "@hotwired/stimulus";

export default class ModalController extends Controller {
  static targets = ["box"];

  declare readonly boxTarget: HTMLElement;

  private get dialog(): HTMLDialogElement {
    return this.element as HTMLDialogElement;
  }

  connect(): void {
    document.body.addEventListener("htmx:beforeRequest", this.onBeforeRequest);
    document.body.addEventListener("keydown", this.onKeydown);
  }

  disconnect(): void {
    document.body.removeEventListener("htmx:beforeRequest", this.onBeforeRequest);
    document.body.removeEventListener("keydown", this.onKeydown);
  }

  // The request fires on the card (outside the dialog), so listen on body.
  private onBeforeRequest = (event: Event): void => {
    const target = (event as CustomEvent).detail?.target as Node | undefined;
    if (target !== this.boxTarget) return;
    this.boxTarget.replaceChildren();
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
