export type Grade = "again" | "hard" | "good" | "easy";

/** Simplified SM-2: returns new ease and interval (days) for a review. */
export function reviewCard(ease: number, interval: number, grade: Grade) {
  if (grade === "again") return { ease: Math.max(1.3, ease - 0.2), interval: 0 };
  const q = grade === "hard" ? 3 : grade === "good" ? 4 : 5;
  const newEase = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  let next: number;
  if (interval === 0) next = grade === "easy" ? 3 : 1;
  else if (interval === 1) next = grade === "hard" ? 2 : grade === "easy" ? 6 : 4;
  else next = Math.round(interval * (grade === "hard" ? 1.2 : newEase) * (grade === "easy" ? 1.3 : 1));
  return { ease: Number(newEase.toFixed(2)), interval: Math.max(1, next) };
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
