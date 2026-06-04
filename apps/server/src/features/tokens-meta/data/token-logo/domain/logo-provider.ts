export type TLogoResult = {
  url: string;
  verified: boolean;
};

export interface ILogoProvider {
  resolve(): Promise<TLogoResult | null>;
}
