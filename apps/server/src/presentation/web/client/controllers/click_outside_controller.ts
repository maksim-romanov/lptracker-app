import { Controller } from "@hotwired/stimulus";

export default class ClickOutsideController extends Controller<HTMLDialogElement> {
  connect(): void {
    this.element.addEventListener("click", this.onClick);
  }

  disconnect(): void {
    this.element.removeEventListener("click", this.onClick);
  }

  private onClick = (event: MouseEvent): void => {
    if (event.target === this.element) this.element.close();
  };
}
