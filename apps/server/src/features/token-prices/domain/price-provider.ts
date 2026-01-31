import type { TokenPrice, TokenPriceQuery } from "./types";

export interface PriceProviderConfig {
  readonly timeout: number;
  readonly rateLimiter: {
    points: number;
    duration: number;
    execEvenly: boolean;
    execEvenlyMinDelayMs: number;
  };
  readonly circuitBreaker: {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
    volumeThreshold: number;
  };
  readonly chainNames: Record<number, string>;
}

export interface PriceProvider {
  readonly name: string;
  readonly config: PriceProviderConfig;
  getPrices(queries: TokenPriceQuery[]): Promise<Map<string, TokenPrice>>;
}
