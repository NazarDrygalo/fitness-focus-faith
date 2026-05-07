import confetti from "canvas-confetti";

export function celebrate() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#22c55e", "#fbbf24", "#3b82f6", "#ec4899"],
  });
}

export function bigCelebrate() {
  const end = Date.now() + 800;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
