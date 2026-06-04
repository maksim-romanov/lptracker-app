export interface AsyncLogoProvider {
  readonly name: string;
  resolve(chainId: number, address: string): Promise<string | null>;
}
