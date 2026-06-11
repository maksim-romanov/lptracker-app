import { type Observable, Subject } from "rxjs";

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
