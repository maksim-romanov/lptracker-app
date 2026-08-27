import { Controller } from "@hotwired/stimulus";

// Shared base so no controller fails silently: every user-visible failure goes
// through notify(), every unexpected one through handleError(), which also feeds
// Stimulus' own error pipeline (application.handleError) for reporting.
export default class ApplicationController extends Controller {
  protected notify(message: string): void {
    this.dispatch("toast", { prefix: "depthly", target: document.documentElement, detail: { message } });
  }

  protected handleError(error: unknown, message: string): void {
    this.notify(message);
    const cause = error instanceof Error ? error : new Error(String(error));
    this.application.handleError(cause, message, { identifier: this.identifier });
  }
}
