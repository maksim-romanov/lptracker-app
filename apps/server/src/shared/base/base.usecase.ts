export abstract class UseCase<TResult = void, TInput = void> {
  constructor() {
    this.execute = this.execute.bind(this);
  }

  abstract execute(input: TInput): Promise<TResult>;
}
