import { UseCase } from "core/domain/base/usecase";
import * as WebBrowser from "expo-web-browser";
import { inject, injectable } from "tsyringe";

import type { LinkingService } from "../data/linking.service";
import { LINKING_SERVICE } from "../di/tokens";
import { ExternalLinkEntity } from "../domain/entities/external-link.entity";
import { LinkingError, LinkingErrorCode } from "../domain/errors/linking.error";

type TInput = { url: string };

@injectable()
export class OpenExternalLinkUseCase extends UseCase<void, TInput> {
  constructor(@inject(LINKING_SERVICE) private readonly linkingService: LinkingService) {
    super();
  }

  async execute(input: TInput): Promise<void> {
    const link = new ExternalLinkEntity(input.url);

    if (!link.isValid) throw new LinkingError(LinkingErrorCode.INVALID_URL, "Invalid URL", { url: input.url });

    const canOpen = await this.linkingService.canOpenURL(link);
    if (!canOpen) {
      this.alert.error("Cannot open URL");
      throw new LinkingError(LinkingErrorCode.CAN_NOT_OPEN_URL, "Cannot open URL", { url: input.url });
    }

    if (link.isHttp) {
      await WebBrowser.openBrowserAsync(link.url);
    } else {
      await this.linkingService.openURL(link);
    }
  }
}
