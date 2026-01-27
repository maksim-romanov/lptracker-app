import { Platform } from "react-native";

import * as Device from "expo-device";
import * as Localization from "expo-localization";
import { injectable } from "tsyringe";

@injectable()
export class DeviceInfoService {
  get platform(): "ios" | "android" | "web" {
    return Platform.OS as "ios" | "android" | "web";
  }

  get osName(): string {
    return Device.osName ?? Platform.OS;
  }

  get osVersion(): string {
    return Device.osVersion ?? "unknown";
  }

  get deviceName(): string | null {
    return Device.deviceName;
  }

  get deviceType(): Device.DeviceType {
    return Device.deviceType ?? Device.DeviceType.UNKNOWN;
  }

  get isDevice(): boolean {
    return Device.isDevice;
  }

  get timezone(): string {
    return Localization.getCalendars()[0]?.timeZone ?? "UTC";
  }

  get locale(): string {
    return Localization.getLocales()[0]?.languageTag ?? "en-US";
  }
}
