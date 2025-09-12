"use client";
import { fmtDate } from "./utils";

export type GapInfo = { start: string; end: string; length: number } | null;

export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;
export const MILESTONE_LABELS: Record<number, string> = {
  3: "Novice",
  7: "Focus",
  14: "Momentum",
  30: "On Fire",
  50: "Pro",
  100: "Legend",
};
export const nextMilestoneFor = (n: number) => STREAK_MILESTONES.find((m) => m > n) ?? null;

export const LS_KEYS = {
  patchedDays: "streak:patchedDays",
  lastFreezeUsed: "streak:freeze:lastUsed",
  lastRepairUsed: "streak:repair:lastUsed",
} as const;

export function getPatchedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEYS.patchedDays) || "[]"));
  } catch {
    return new Set();
  }
}
export function savePatchedSet(s: Set<string>) {
  localStorage.setItem(LS_KEYS.patchedDays, JSON.stringify([...s]));
}
export function patchDays(daysISO: string[]) {
  const s = getPatchedSet();
  daysISO.forEach((d) => s.add(d));
  savePatchedSet(s);
}

/** RAW (fără patched) */
export function deriveRawPresence(map: Record<string, number>) {
  const today = new Date(); today.setHours(0,0,0,0);
  const visitedRaw = (d: Date) => ((map[fmtDate(d)] ?? 0) > 0) ? 1 : 0;

  const todayVisited = visitedRaw(today) === 1;

  const startOfWeek = (d: Date) => { const t = new Date(d); const dow = (t.getDay()+6)%7; t.setDate(t.getDate()-dow); t.setHours(0,0,0,0); return t; };
  const weekStart = startOfWeek(today);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(weekStart.getDate()+i);
    if (d > today) break;
    weekCount += visitedRaw(d);
  }

  const last14Flags: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    last14Flags.push(visitedRaw(d));
  }

  return { weekCount, last14Flags, todayVisited };
}

/** Derivate cu zile patchuite */
export function derivePresenceMetrics(map: Record<string, number>) {
  const today = new Date(); today.setHours(0,0,0,0);
  const patched = typeof window !== "undefined" ? getPatchedSet() : new Set<string>();

  const visited = (d: Date) => {
    const k = fmtDate(d);
    const v = (map[k] ?? 0) > 0 ? 1 : 0;
    return v === 1 || patched.has(k) ? 1 : 0;
  };

  let currentStreak = 0;
  const cur = new Date(today);
  while (visited(cur)) { currentStreak++; cur.setDate(cur.getDate()-1); }

  const dates = Object.keys(map || {}).sort();
  let bestStreak = 0, run = 0;
  for (let i = 0; i < dates.length; i++) {
    const v = (map[dates[i]] ?? 0) > 0 || patched.has(dates[i]) ? 1 : 0;
    if (v) { run++; bestStreak = Math.max(bestStreak, run); } else run = 0;
  }

  const startOfWeek = (d: Date) => { const t = new Date(d); const dow = (t.getDay()+6)%7; t.setDate(t.getDate()-dow); t.setHours(0,0,0,0); return t; };
  const weekStart = startOfWeek(today);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(weekStart.getDate()+i);
    if (d > today) break;
    weekCount += visited(d);
  }

  const last14Flags: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    last14Flags.push(visited(d));
  }

  const todayVisited = visited(today) === 1;
  return { currentStreak, bestStreak, weekCount, last14Flags, todayVisited };
}

/** Auto-freeze + detect gap (2+) + streak cu patched */
export function computeStreakAuto(map: Record<string, number>) {
  const today = new Date(); today.setHours(0,0,0,0);

  const patched = getPatchedSet();
  const visitedRaw = (d: Date) => (map[fmtDate(d)] ?? 0) > 0;
  const visited = (d: Date) => visitedRaw(d) || patched.has(fmtDate(d));

  let usedAutoFreezeNow = false;

  if (visitedRaw(today)) {
    const probe = new Date(today);
    while (visited(probe)) probe.setDate(probe.getDate() - 1);

    const hole = new Date(probe);
    const holeISO = fmtDate(hole);
    const newer = new Date(hole); newer.setDate(hole.getDate() + 1);
    const older = new Date(hole); older.setDate(hole.getDate() - 1);

    const isHole = !visited(hole) && visited(newer) && visited(older);
    if (isHole && !patched.has(holeISO)) {
      patched.add(holeISO);
      savePatchedSet(patched);
      localStorage.setItem(LS_KEYS.lastFreezeUsed, fmtDate(today));
      usedAutoFreezeNow = true;
    }
  }

  const y = new Date(today); y.setDate(y.getDate() - 1);
  let gapLen = 0;
  const gapDays: string[] = [];
  if (visitedRaw(today)) {
    const p = new Date(y);
    while (!visited(p)) {
      gapLen++; gapDays.push(fmtDate(p));
      p.setDate(p.getDate() - 1);
      if (gapLen > 90) break;
    }
  }
  gapDays.sort();
  const gapInfo: GapInfo = gapLen >= 2 ? { start: gapDays[0], end: gapDays[gapDays.length - 1], length: gapLen } : null;

  // recompute streak with patched
  let currentStreak = 0;
  const cur = new Date(today);
  while (visited(cur)) { currentStreak++; cur.setDate(cur.getDate() - 1); }

  const dates = Object.keys(map || {}).sort();
  let bestStreak = 0, run = 0;
  for (let i = 0; i < dates.length; i++) {
    const v = (map[dates[i]] ?? 0) > 0 || patched.has(dates[i]) ? 1 : 0;
    if (v) { run++; bestStreak = Math.max(bestStreak, run); } else run = 0;
  }

  const todayVisited = visited(today) === 1;
  return { currentStreak, bestStreak, todayVisited, usedAutoFreezeNow, gapInfo, patchedDays: new Set(patched) };
}

export function repairGap(gap: GapInfo, _costGems = 100) {
  if (!gap) return;
  const span: string[] = [];
  const start = new Date(gap.start + "T00:00:00"), end = new Date(gap.end + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) span.push(fmtDate(d));
  patchDays(span);
  localStorage.setItem(LS_KEYS.lastRepairUsed, fmtDate(new Date()));
}
