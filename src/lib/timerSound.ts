// Shared short beep for timers (rest timer, EMOM, circuits). Uses WebAudio so it
// works without bundling an audio asset. Call after a user gesture where possible.
let ctx: AudioContext | null = null;

export function beep(freq = 880, durationMs = 180, type: OscillatorType = "sine", gain = 0.08) {
  try {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Audio unavailable (e.g. silent mode restrictions) — haptics still fire.
  }
}

export function finishChime() {
  beep(880, 140);
  setTimeout(() => beep(1174, 220), 160);
}
