import { Alert, Platform } from "react-native";

export type ButtonStyle = "default" | "destructive" | "cancel";

export interface AlertOptions {
  title?: string;
  cancelable?: boolean;
  onDismiss?: () => void;
}

export interface ConfirmOptions extends AlertOptions {
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: ButtonStyle;
}

export interface AlertsService {
  success(message: string, options?: AlertOptions): void;
  info(message: string, options?: AlertOptions): void;
  error(message: string, options?: AlertOptions): void;
  confirm(message: string, options?: ConfirmOptions): Promise<boolean>;
}

function showAlert(message: string, options?: AlertOptions, defaultTitle?: string): void {
  Alert.alert(options?.title ?? defaultTitle ?? "", message, [{ text: "OK", onPress: options?.onDismiss }], {
    cancelable: options?.cancelable ?? true,
    onDismiss: options?.onDismiss,
  });
}

export const ReactNativeAlerts: AlertsService = {
  success(message: string, options?: AlertOptions): void {
    showAlert(message, options, "Success");
  },

  info(message: string, options?: AlertOptions): void {
    showAlert(message, options, "Info");
  },

  error(message: string, options?: AlertOptions): void {
    showAlert(message, options, "Error");
  },

  confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmText = options?.confirmText ?? "OK";
      const cancelText = options?.cancelText ?? "Cancel";

      const buttons: Array<{
        text: string;
        onPress?: () => void;
        style?: "default" | "cancel" | "destructive";
      }> = [
        {
          text: cancelText,
          style: "cancel",
          onPress: () => {
            options?.onDismiss?.();
            resolve(false);
          },
        },
        {
          text: confirmText,
          style: Platform.OS === "ios" ? (options?.confirmStyle ?? "default") : "default",
          onPress: () => {
            options?.onDismiss?.();
            resolve(true);
          },
        },
      ];

      Alert.alert(options?.title ?? "", message, buttons, {
        cancelable: options?.cancelable ?? true,
        onDismiss: () => {
          options?.onDismiss?.();
          resolve(false);
        },
      });
    });
  },
};
