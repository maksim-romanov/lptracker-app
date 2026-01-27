import { Alert, Platform } from "react-native";

/**
 * Button style for confirmation dialogs
 * - default: standard button
 * - destructive: red button for dangerous actions (delete, logout)
 * - cancel: cancel style (usually on the left)
 */
export type ButtonStyle = "default" | "destructive" | "cancel";

export interface AlertOptions {
  /** Dialog title */
  title?: string;
  /** Whether dialog can be closed by tapping outside (Android) or swipe (iOS) */
  cancelable?: boolean;
  /** Callback when dialog is dismissed */
  onDismiss?: () => void;
}

export interface ConfirmOptions extends AlertOptions {
  /** Confirm button text (default: "OK") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Confirm button style */
  confirmStyle?: ButtonStyle;
}

/**
 * AlertsService for blocking dialogs
 *
 * @example
 * // Success action (non-blocking toast is better for this)
 * alert.success("Profile saved");
 *
 * // Error requiring attention
 * alert.error("Payment failed. Please try again.");
 *
 * // Confirmation for destructive action
 * const confirmed = await alert.confirm(
 *   "This action cannot be undone",
 *   { title: "Delete Account?", confirmStyle: "destructive", confirmText: "Delete" }
 * );
 */
export interface AlertsService {
  /** Show success alert - for important successful actions */
  success(message: string, options?: AlertOptions): void;

  /** Show info alert - for information requiring attention */
  info(message: string, options?: AlertOptions): void;

  /** Show error alert - for errors requiring action */
  error(message: string, options?: AlertOptions): void;

  /**
   * Show confirmation dialog
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  confirm(message: string, options?: ConfirmOptions): Promise<boolean>;
}

// Implementation

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
