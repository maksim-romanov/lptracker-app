/**
 * Store interface for state management with hydration support
 *
 * @example
 * class AuthStore implements Store {
 *   async hydrate(): Promise<void> {
 *     const token = await secureStorage.get("auth_token");
 *     if (token) {
 *       this.setToken(token);
 *     }
 *   }
 * }
 */
export interface Store {
  /** Hydrate store from persistent storage */
  hydrate(): Promise<void>;
}
