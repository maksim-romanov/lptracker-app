export interface LogoProvider {
  resolve(): Promise<string | null>;
}
