/**
 * Base Entity class for domain objects with identity
 *
 * @example
 * class User extends Entity<string> {
 *   constructor(
 *     id: string,
 *     public readonly name: string,
 *     public readonly email: string
 *   ) {
 *     super(id);
 *   }
 * }
 */
export abstract class Entity<TId> {
  constructor(public readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.id === other.id;
  }
}
