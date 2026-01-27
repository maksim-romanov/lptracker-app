import { type Observable, Subject } from "rxjs";

/**
 * Base Events class for domain event publishing
 *
 * @example
 * type AuthEvent =
 *   | { type: "LOGGED_IN"; userId: string }
 *   | { type: "LOGGED_OUT" };
 *
 * class AuthEvents extends Events<AuthEvent> {}
 *
 * // Publishing
 * authEvents.emit({ type: "LOGGED_IN", userId: "123" });
 *
 * // Subscribing
 * authEvents.events$.subscribe((event) => {
 *   if (event.type === "LOGGED_IN") {
 *     console.log("User logged in:", event.userId);
 *   }
 * });
 */
export abstract class Events<TEvent> {
  private readonly subject = new Subject<TEvent>();

  get events$(): Observable<TEvent> {
    return this.subject.asObservable();
  }

  emit(event: TEvent): void {
    this.subject.next(event);
  }

  dispose(): void {
    this.subject.complete();
  }
}
