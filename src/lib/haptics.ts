// Haptic feedback. Uses native Taptic Engine / Android vibrator inside the
// Capacitor shell, falling back to navigator.vibrate on the web.
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNative } from "@/lib/native";

export type HapticPattern = "light" | "medium" | "success" | "warning";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 18,
  success: [10, 40, 10],
  warning: [20, 60, 20],
};

function nativeHaptic(kind: HapticPattern) {
  switch (kind) {
    case "light":
      return Haptics.impact({ style: ImpactStyle.Light });
    case "medium":
      return Haptics.impact({ style: ImpactStyle.Medium });
    case "success":
      return Haptics.notification({ type: NotificationType.Success });
    case "warning":
      return Haptics.notification({ type: NotificationType.Warning });
  }
}

export function haptic(kind: HapticPattern = "light") {
  if (isNative()) {
    nativeHaptic(kind)?.catch?.(() => { /* noop */ });
    return;
  }
  if (typeof navigator === "undefined") return;
  const v = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate;
  if (typeof v !== "function") return;
  try {
    v.call(navigator, patterns[kind]);
  } catch {
    /* noop */
  }
}
