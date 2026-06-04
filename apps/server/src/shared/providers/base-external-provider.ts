import CircuitBreaker from "opossum";
import { RateLimiterMemory } from "rate-limiter-flexible";

export interface ExternalProviderConfig {
  readonly name: string;
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
}

export abstract class BaseExternalProvider<TInput, TOutput> {
  abstract readonly config: ExternalProviderConfig;

  private _limiter?: RateLimiterMemory;
  private _breaker?: CircuitBreaker<[TInput], TOutput>;

  protected abstract fetch(input: TInput): Promise<TOutput>;

  async execute(input: TInput): Promise<TOutput> {
    return this.breaker.fire(input);
  }

  get isOpen(): boolean {
    return this.breaker.opened;
  }

  private get limiter(): RateLimiterMemory {
    if (!this._limiter) {
      this._limiter = new RateLimiterMemory({
        points: this.config.rateLimiter.points,
        duration: this.config.rateLimiter.duration,
        execEvenly: this.config.rateLimiter.execEvenly,
        execEvenlyMinDelayMs: this.config.rateLimiter.execEvenlyMinDelayMs,
      });
    }
    return this._limiter;
  }

  private get breaker(): CircuitBreaker<[TInput], TOutput> {
    if (!this._breaker) {
      this._breaker = new CircuitBreaker(this.gated.bind(this), {
        timeout: this.config.circuitBreaker.timeout,
        errorThresholdPercentage: this.config.circuitBreaker.errorThresholdPercentage,
        resetTimeout: this.config.circuitBreaker.resetTimeout,
        volumeThreshold: this.config.circuitBreaker.volumeThreshold,
      });
    }
    return this._breaker;
  }

  private async gated(input: TInput): Promise<TOutput> {
    await this.limiter.consume(this.config.name);
    return this.fetch(input);
  }
}
