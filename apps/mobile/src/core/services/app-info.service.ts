import Constants from "expo-constants";
import { injectable } from "tsyringe";

@injectable()
export class AppInfoService {
  get version(): string {
    return Constants.expoConfig?.version ?? "unknown";
  }

  get buildNumber(): string {
    return Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode?.toString() ?? "unknown";
  }

  get appIdentifier(): string {
    return Constants.expoConfig?.ios?.bundleIdentifier ?? Constants.expoConfig?.android?.package ?? "unknown";
  }

  get appName(): string {
    return Constants.expoConfig?.name ?? "unknown";
  }
}
