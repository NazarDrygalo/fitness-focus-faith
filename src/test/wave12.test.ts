import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { computeReadingStreak } from "@/lib/bibleStreak";
import { reviewCard, addDays } from "@/lib/srs";

describe("reading streak", () => {
  it("counts consecutive days ending today", () => {
    expect(computeReadingStreak(["2026-10-10", "2026-10-11", "2026-10-12"], "2026-10-12")).toBe(3);
  });
  it("keeps streak alive if only yesterday read", () => {
    expect(computeReadingStreak(["2026-10-10", "2026-10-11"], "2026-10-12")).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(computeReadingStreak(["2026-10-09", "2026-10-12"], "2026-10-12")).toBe(1);
  });
});

describe("spaced repetition", () => {
  it("again resets interval to 0", () => {
    expect(reviewCard(2.5, 10, "again").interval).toBe(0);
  });
  it("first good review is due in 1 day", () => {
    expect(reviewCard(2.5, 0, "good").interval).toBe(1);
  });
  it("intervals grow on good", () => {
    expect(reviewCard(2.5, 4, "good").interval).toBe(10);
  });
  it("addDays crosses months", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
});
