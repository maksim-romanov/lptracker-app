import { err, ok, type Result } from "neverthrow";
import { config } from "shared/config";
import { singleton } from "tsyringe";

import { StablesError } from "../domain/errors/stables.error";

export interface TStableEntry {
  chainId: number;
  address: string;
  symbol: string;
}

type TStablesResponse = {
  stables: TStableEntry[];
};

const isStablesResponse = (value: unknown): value is TStablesResponse => {
  if (!value || typeof value !== "object") return false;
  const stables = (value as { stables?: unknown }).stables;
  if (!Array.isArray(stables)) return false;
  return stables.every(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      typeof (entry as TStableEntry).chainId === "number" &&
      typeof (entry as TStableEntry).address === "string" &&
      typeof (entry as TStableEntry).symbol === "string",
  );
};

@singleton()
export class StablesTokensDataClient {
  private readonly baseUrl = config.api.tokensData.baseUrl;
  private readonly timeout = 5000;

  async getStables(): Promise<Result<TStableEntry[], StablesError>> {
    let res: Response;
    try {
      res = await this.doFetch(`${this.baseUrl}/v1/stables`, {
        method: "GET",
        signal: AbortSignal.timeout(this.timeout),
      });
    } catch (error) {
      return err(StablesError.UPSTREAM_UNREACHABLE({ error }));
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return err(StablesError.UPSTREAM_ERROR({ context: { status: res.status, body } }));
    }

    let payload: unknown;
    try {
      payload = await res.json();
    } catch (error) {
      return err(StablesError.INVALID_RESPONSE({ error }));
    }

    if (!isStablesResponse(payload)) {
      return err(StablesError.INVALID_RESPONSE({ message: "Response missing valid `stables` array" }));
    }

    return ok(payload.stables);
  }

  protected async doFetch(url: string, init?: RequestInit): Promise<Response> {
    return fetch(url, init);
  }
}
