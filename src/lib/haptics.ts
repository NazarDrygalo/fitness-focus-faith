// Tiny wrapper around navigator.vibrate. No-ops on unsupported devices
// (iOS Safari doesn't expose vibrate — calls are silently ignored there).
export type HapticPattern = "light" | "medium" | "success" | "warning";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 18,
  success: [10, 40, 10],
  warning: [20, 60, 20],
};

export function haptic(kind: HapticPattern = "light") {
  if (typeof navigator === "undefined") return;
  const v = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate;
  if (typeof v !== "function") return;
  try {
    v.call(navigator, patterns[kind]);
  } catch {
    /* noop */
  }
}
