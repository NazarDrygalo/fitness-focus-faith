/** Small in-memory ring buffer of recent runtime errors, attached to feedback reports. */
type Entry = { at: string; message: string; source?: string };

const MAX = 10;
const buffer: Entry[] = [];

export function recordError(message: string, source?: string) {
  buffer.push({ at: new Date().toISOString(), message: String(message).slice(0, 500), source });
  if (buffer.length > MAX) buffer.shift();
}

export function getRecentErrors(): Entry[] {
  return [...buffer];
}

let installed = false;

export function installErrorLog() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => recordError(e.message, e.filename));
  window.addEventListener("unhandledrejection", (e) =>
    recordError((e as PromiseRejectionEvent).reason?.message ?? String((e as PromiseRejectionEvent).reason), "promise"),
  );
}
