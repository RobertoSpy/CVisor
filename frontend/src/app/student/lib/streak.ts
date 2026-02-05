"use client";
import { fmtDate } from "./utils";

export type GapInfo = { start: string; end: string; length: number } | null;

// Sursa unică pentru badges și milestone-uri
export const BADGES = [
  {
    code: "lvl1",
    label: "LVL 1",
    emoji: "🌱",
    streak: 0,
    feature: "Început de drum",
    description: "Ai acces la funcționalitățile de bază: creare profil, vizualizare oportunități și organizații."
  },
  {
    code: "lvl2",
    label: "LVL 2",
    emoji: "🌿",
    streak: 7,
    feature: "Puncte și experiență",
    description: "Te-ai obișnuit cu platforma. Acum poți acumula puncte, care vor fi utile pentru viitoare upgrade-uri și aplicații."
  },
  {
    code: "lvl3",
    label: "LVL 3",
    emoji: "🌳",
    streak: 30,
    feature: "Aplicații Directe",
    description: "Ai ajuns la un nivel superior! Ai acces la o pagină nouă de aplicare și poți aplica direct la organizații din platformă."
  },
  {
    code: "lvl4",
    label: "LVL 4",
    emoji: "🍎",
    streak: 90,
    feature: "Acces Premium",
    description: "Primești acces premium: vezi oportunități exclusive, primești notificări prioritare și poți conversa cu organizațiile."
  },
  {
    code: "lvl5",
    label: "LVL 5",
    emoji: "👑",
    streak: 150,
    feature: "Acces All",
    description: "Ești veteran! Ai deblocat toate funcționalitățile platformei, inclusiv statistici avansate și mentorat personalizat."
  }
];

export const MAP_NODES = [
  { streak: 0, type: "badge", label: "LVL 1" },
  { streak: 3, type: "step", label: "3 Zile" },
  { streak: 7, type: "badge", label: "LVL 2" },
  { streak: 14, type: "step", label: "14 Zile" },
  { streak: 30, type: "badge", label: "LVL 3" },
  { streak: 60, type: "step", label: "60 Zile" },
  { streak: 90, type: "badge", label: "LVL 4" },
  { streak: 120, type: "step", label: "120 Zile" },
  { streak: 150, type: "badge", label: "LVL 5" },
  { streak: 999, type: "soon", label: "SOON" },
];

export const STREAK_MILESTONES = BADGES.map(b => b.streak) as number[];
export const MILESTONE_LABELS: Record<number, string> = Object.fromEntries(
  BADGES.map(b => [b.streak, b.label])
);

export const nextMilestoneFor = (n: number) => STREAK_MILESTONES.find((m) => m > n) ?? null;

export const LS_KEYS = {
  patchedDays: "streak:patchedDays",
  lastFreezeUsed: "streak:freeze:lastUsed",
  lastRepairUsed: "streak:repair:lastUsed",
} as const;

export function getPatchedSet(): Set<string> {
  // [FIX] Nu mai folosim LocalStorage pentru patchedDays, 
  // deoarece backend-ul returnează deja zilele reparate în `map`,
  // iar LS cauza probleme la schimbarea conturilor (sticky streak).
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

    /* DISABLING AUTO-FREEZE to allow manual purchase only
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
    */
  }

  // --- MODIFICARE GAP ---
  // Găsește prima zi cu activitate
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
    // Allow gapLen >= 1 to be repairable, BUT ONLY if gap is small (<= 2 days)
    // Business Rule: If gap > 2 days, streak is lost forever.
    gapInfo = (gapLen >= 1 && gapLen <= 2) ? { start: gapDays[0], end: gapDays[gapDays.length - 1], length: gapLen } : null;
  }
  // --- END MODIFICARE GAP ---

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
  localStorage.setItem(LS_KEYS.lastRepairUsed, fmtDate(new Date()));
}