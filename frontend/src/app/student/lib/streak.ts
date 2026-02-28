"use client";
import { fmtDate } from "./utils";

export type GapInfo = { start: string; end: string; length: number } | null;

// ============================================================
// GAMIFICATION: Points-Based System
// ============================================================
// Badges and Map are based on TOTAL POINTS, not streak.
// Streak milestones give BONUS POINTS.
// ============================================================

// Badge levels — unlocked by POINTS
export const BADGES = [
  {
    code: "lvl1",
    label: "LVL 1",
    emoji: "🌱",
    points: 0,        // Start — automatic
    feature: "Început de drum",
    description: "Ai acces la funcționalitățile de bază: creare profil, vizualizare oportunități și organizații."
  },
  {
    code: "lvl2",
    label: "LVL 2",
    emoji: "🌿",
    points: 50,        // 50 points needed
    feature: "Puncte și experiență",
    description: "Te-ai obișnuit cu platforma. Acum poți acumula puncte, care vor fi utile pentru viitoare upgrade-uri și aplicații."
  },
  {
    code: "lvl3",
    label: "LVL 3",
    emoji: "🌳",
    points: 150,       // 150 points needed
    feature: "Aplicații Directe",
    description: "Ai ajuns la un nivel superior! Ai acces la o pagină nouă de aplicare și poți aplica direct la organizații din platformă."
  },
  {
    code: "lvl4",
    label: "LVL 4",
    emoji: "🍎",
    points: 400,       // 400 points needed
    feature: "Acces Premium",
    description: "Primești acces premium: vezi oportunități exclusive, primești notificări prioritare și poți conversa cu organizațiile."
  },
  {
    code: "lvl5",
    label: "LVL 5",
    emoji: "👑",
    points: 1000,      // 1000 points needed
    feature: "Acces All",
    description: "Ești veteran! Ai deblocat toate funcționalitățile platformei, inclusiv statistici avansate și mentorat personalizat."
  }
];

// Map nodes — based on POINTS
export const MAP_NODES = [
  { points: 0, type: "badge", label: "LVL 1" },
  { points: 25, type: "step", label: "25 XP" },
  { points: 50, type: "badge", label: "LVL 2" },
  { points: 100, type: "step", label: "100 XP" },
  { points: 150, type: "badge", label: "LVL 3" },
  { points: 250, type: "step", label: "250 XP" },
  { points: 400, type: "badge", label: "LVL 4" },
  { points: 700, type: "step", label: "700 XP" },
  { points: 1000, type: "badge", label: "LVL 5" },
  { points: 9999, type: "soon", label: "SOON" },
];

// Streak milestones — give BONUS points
export const STREAK_BONUSES: Record<number, number> = {
  3: 10,      // 3 days streak → +10 points
  7: 15,      // 7 days → +15 points
  14: 20,     // 14 days → +20 points
  30: 30,     // 30 days → +30 points
  60: 40,     // 60 days → +40 points
  90: 50,     // 90 days → +50 points
};

// Point sources reference (awarded by backend)
export const POINT_SOURCES = {
  SIGNUP: 10,           // La înregistrare
  DAILY_LOGIN: 5,       // La login zilnic
  PROFILE_100: 10,      // Profil 100% complet
  STREAK_MILESTONE: "varies",  // La milestone-uri streak
  OPPORTUNITY_CLICK: 2, // Click pe link oportunitate
  BADGE_UNLOCK: 5,      // La deblocarea unui badge
  OPPORTUNITY_CREATE: 5, // (Orgs) La crearea unei oportunități
};

// Legacy exports for backward-compat
export const STREAK_MILESTONES = BADGES.map(b => b.points) as number[];
export const MILESTONE_LABELS: Record<number, string> = Object.fromEntries(
  BADGES.map(b => [b.points, b.label])
);

export const nextMilestoneFor = (currentPoints: number) => {
  const nextBadge = BADGES.find(b => b.points > currentPoints);
  return nextBadge?.points ?? null;
};

// ============================================================
// Presence / Streak Calculation (unchanged logic)
// ============================================================

export const LS_KEYS = {
  patchedDays: "streak:patchedDays",
  lastFreezeUsed: "streak:freeze:lastUsed",
  lastRepairUsed: "streak:repair:lastUsed",
} as const;

export function getPatchedSet(): Set<string> {
  return new Set();
}
export function savePatchedSet(s: Set<string>) {
  // no-op
}
export function patchDays(daysISO: string[]) {
  // no-op
}

/** RAW (fără patched) */
export function deriveRawPresence(map: Record<string, number>) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const visitedRaw = (d: Date) => ((map[fmtDate(d)] ?? 0) > 0) ? 1 : 0;

  const todayVisited = visitedRaw(today) === 1;

  const startOfWeek = (d: Date) => { const t = new Date(d); const dow = (t.getDay() + 6) % 7; t.setDate(t.getDate() - dow); t.setHours(0, 0, 0, 0); return t; };
  const weekStart = startOfWeek(today);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
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
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const patched = typeof window !== "undefined" ? getPatchedSet() : new Set<string>();

  const visited = (d: Date) => {
    const k = fmtDate(d);
    const v = (map[k] ?? 0) > 0 ? 1 : 0;
    return v === 1 || patched.has(k) ? 1 : 0;
  };

  let currentStreak = 0;
  const cur = new Date(today);
  while (visited(cur)) { currentStreak++; cur.setDate(cur.getDate() - 1); }

  const dates = Object.keys(map || {}).sort();
  let bestStreak = 0, run = 0;
  for (let i = 0; i < dates.length; i++) {
    const v = (map[dates[i]] ?? 0) > 0 || patched.has(dates[i]) ? 1 : 0;
    if (v) { run++; bestStreak = Math.max(bestStreak, run); } else run = 0;
  }

  const startOfWeek = (d: Date) => { const t = new Date(d); const dow = (t.getDay() + 6) % 7; t.setDate(t.getDate() - dow); t.setHours(0, 0, 0, 0); return t; };
  const weekStart = startOfWeek(today);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
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
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const patched = getPatchedSet();
  const visitedRaw = (d: Date) => (map[fmtDate(d)] ?? 0) > 0;
  const visited = (d: Date) => visitedRaw(d) || patched.has(fmtDate(d));

  let usedAutoFreezeNow = false;

  if (visitedRaw(today)) {
    const probe = new Date(today);
    while (visited(probe)) probe.setDate(probe.getDate() - 1);
  }

  // --- GAP Detection ---
  const allDays = Object.keys(map || {}).sort();
  let firstActiveDay = null;
  for (const day of allDays) {
    if ((map[day] ?? 0) > 0 || patched.has(day)) {
      firstActiveDay = day;
      break;
    }
  }

  const y = new Date(today); y.setDate(y.getDate() - 1);
  let gapLen = 0;
  const gapDays: string[] = [];
  let gapInfo = null;

  if (visitedRaw(today) && firstActiveDay) {
    const p = new Date(y);
    while (!visited(p) && fmtDate(p) >= firstActiveDay) {
      gapLen++; gapDays.push(fmtDate(p));
      p.setDate(p.getDate() - 1);
      if (gapLen > 90) break;
    }
    gapDays.sort();
    gapInfo = (gapLen >= 1 && gapLen <= 2) ? { start: gapDays[0], end: gapDays[gapDays.length - 1], length: gapLen } : null;
  }

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

  const todayVisited = visited(today);
  return { currentStreak, bestStreak, todayVisited, usedAutoFreezeNow, gapInfo, patchedDays: new Set(patched) };
}

export function repairGap(gap: GapInfo, _costGems = 100) {
  if (!gap) return;
  const span: string[] = [];
  const start = new Date(gap.start + "T00:00:00"), end = new Date(gap.end + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) span.push(fmtDate(d));
  patchDays(span);
}