export interface TokenLogo {
  resolve(chainId: number, address: string): Promise<string | null>;
  resolveMany(tokens: { chainId: number; address: string }[]): Promise<Map<string, string | null>>;
}
