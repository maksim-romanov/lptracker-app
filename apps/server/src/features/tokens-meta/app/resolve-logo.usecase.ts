import { err, ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import type { TokenLogo } from "../data/token-logo/domain/token-logo";
import { TOKEN_LOGO_SERVICE } from "../di/tokens";

@injectable()
export class ResolveLogoUseCase {
  constructor(@inject(TOKEN_LOGO_SERVICE) private readonly tokenLogoService: TokenLogo) {}

  async execute(chainId: number, address: string) {
    const url = await this.tokenLogoService.resolve(chainId, address);
    if (!url) return err(null);
    return ok(url);
  }
}
