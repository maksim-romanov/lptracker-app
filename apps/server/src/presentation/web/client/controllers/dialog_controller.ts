import { Controller } from "@hotwired/stimulus";

// Backdrop dismissal lives in the markup as `click->dialog#close:self`, which
// Stimulus resolves to `element === event.target` — no listener bookkeeping here.
export default class DialogController extends Controller<HTMLDialogElement> {
  open(): void {
    if (!this.element.open) this.element.showModal();
  }

  close(): void {
    this.element.close();
  }
}
