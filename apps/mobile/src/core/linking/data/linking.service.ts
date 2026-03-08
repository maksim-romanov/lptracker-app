import * as Linking from "expo-linking";
import { injectable } from "tsyringe";

import { Service } from "core/domain/base/service";

import type { ExternalLinkEntity } from "../domain/entities/external-link.entity";
import { LinkingError, LinkingErrorCode } from "../domain/errors/linking.error";

@injectable()
export class LinkingService extends Service {
  async canOpenURL(link: ExternalLinkEntity): Promise<boolean> {
    if (!link.isValid) return false;

    try {
      return await Linking.canOpenURL(link.url);
    } catch {
      return false;
    }
  }

  async openURL(link: ExternalLinkEntity): Promise<void> {
    if (!link.isValid) {
      throw new LinkingError(LinkingErrorCode.INVALID_URL, "Invalid URL", { url: link.url });
    }

    try {
      await Linking.openURL(link.url);
    } catch (error) {
      throw new LinkingError(LinkingErrorCode.CAN_NOT_OPEN_URL, "Cannot open URL", {
        url: link.url,
        cause: error,
      });
    }
  }
}
