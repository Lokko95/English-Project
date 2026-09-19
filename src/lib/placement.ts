import type { GroupLevel } from "@/lib/types";

const LEVELS: GroupLevel[] = ["A1", "A2", "B1", "B2"];

export function suggestPlacementLevel(
  results: { level: GroupLevel | null; correct: boolean }[],
): GroupLevel {
  const stats = new Map<GroupLevel, { correct: number; total: number }>();
  for (const level of LEVELS) {
    stats.set(level, { correct: 0, total: 0 });
  }

  for (const result of results) {
    if (!result.level || !stats.has(result.level)) continue;
    const bucket = stats.get(result.level)!;
    bucket.total += 1;
    if (result.correct) bucket.correct += 1;
  }

  let suggested: GroupLevel = "A1";
  for (const level of LEVELS) {
    const bucket = stats.get(level)!;
    if (bucket.total === 0) continue;
    if (bucket.correct / bucket.total >= 0.5) {
      suggested = level;
    } else {
      break;
    }
  }

  return suggested;
}
