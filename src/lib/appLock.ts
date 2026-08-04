import { BiometricAuth, BiometryType } from "@aparajita/capacitor-biometric-auth";
import { isNative } from "@/lib/native";

export const APP_LOCK_KEY = "grind-app-lock";

export function appLockEnabled() {
  return localStorage.getItem(APP_LOCK_KEY) === "1";
}

export function setAppLockEnabled(on: boolean) {
  localStorage.setItem(APP_LOCK_KEY, on ? "1" : "0");
}

export async function biometricsAvailable() {
  if (!isNative()) return false;
  try {
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable && info.biometryType !== BiometryType.none;
  } catch {
    return false;
  }
}

export async function biometricLabel() {
  try {
    const info = await BiometricAuth.checkBiometry();
    switch (info.biometryType) {
      case BiometryType.faceId:
        return "Face ID";
      case BiometryType.touchId:
        return "Touch ID";
      case BiometryType.faceAuthentication:
        return "Face Unlock";
      case BiometryType.fingerprintAuthentication:
        return "Fingerprint";
      default:
        return "Biometrics";
    }
  } catch {
    return "Biometrics";
  }
}

/** Resolves true when the user successfully authenticates. */
export async function authenticate(): Promise<boolean> {
  try {
    await BiometricAuth.authenticate({
      reason: "Unlock GRIND",
      cancelTitle: "Cancel",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use passcode",
      androidTitle: "Unlock GRIND",
      androidSubtitle: "Confirm it's you to continue",
availableTitle: "Unavailable",
    });
    return true;
  } catch {
    return false;
  }
}
