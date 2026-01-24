export abstract class Entity<T> {
	protected constructor(protected readonly _data: T) {}

	get data(): Readonly<T> {
		return this._data;
	}
}
