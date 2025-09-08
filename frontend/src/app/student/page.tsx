"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;
const MILESTONE_LABELS: Record<number, string> = {
  3: "Novice", 7: "Focus", 14: "Momentum", 30: "On Fire", 50: "Pro", 100: "Legend",
};
const nextMilestoneFor = (n: number) => STREAK_MILESTONES.find(m => m > n) ?? null;


/** ————— mici utilitare ————— */
function classNames(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ——— helpers zero-data ——— */
function isAllZeroMap(m: Record<string, number>) {
  const vals = Object.values(m ?? {});
  return vals.length === 0 || vals.every((v) => v === 0);
}
function isAllZeroBars(arr: { label: string; value: number }[]) {
  return arr.length === 0 || arr.every((b) => !b.value);
}

/** ——— metrici din presence: streak curent, best streak, count pe 7/14 zile ——— */
/** ——— metrici din presence: streak curent, best streak, zile bifate 7/14 ——— */
/** ——— metrici: streak curent, best streak, zile bifate 7/14 ——— */
function derivePresenceMetrics(map: Record<string, number>) {
  const fmt = fmtDate; // folosim local, nu UTC
  const today = new Date(); today.setHours(0,0,0,0);
  const visited = (d: Date) => ((map[fmt(d)] ?? 0) > 0) ? 1 : 0;

  // streak curent + best (rămân la fel)
  let currentStreak = 0;
  const cur = new Date(today);
  while (visited(cur)) { currentStreak++; cur.setDate(cur.getDate() - 1); }

  const dates = Object.keys(map || {}).sort();
  let bestStreak = 0, run = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if ((map[dates[i]] ?? 0) > 0) { run++; bestStreak = Math.max(bestStreak, run); } else run = 0;
  }

  // --- NUMĂRĂM ZILELE DIN SĂPTĂMÂNA CURENTĂ (Luni–Duminică) ---
  const startOfWeek = (d: Date) => {
    const t = new Date(d);
    const dow = t.getDay();               // 0=Sun,...,6=Sat
    const delta = (dow + 6) % 7;          // 0 => Mon
    t.setDate(t.getDate() - delta);
    t.setHours(0,0,0,0);
    return t;
  };
  const weekStart = startOfWeek(today);
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    if (d > today) break;                 // numărăm până azi inclusiv
    weekCount += visited(d);
  }

  // serii 14 zile (0/1) pentru sparkline – rămân la fel
  const last14Flags: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    last14Flags.push(visited(d));
  }

  const todayVisited = visited(today) === 1;
  return { currentStreak, bestStreak, weekCount, last14Flags, todayVisited };
}


/** ————— card statistic scurt ————— */
function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-0.5 tracking-tight">{value}</div>
    </div>
  );
}

/** ——— tooltip minimal ——— */
function CursorTooltip({ show, x, y, children }: { show: boolean; x: number; y: number; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div
      className="fixed z-50 pointer-events-none select-none px-2 py-1 rounded-md text-xs bg-gray-900 text-white shadow-lg"
      style={{ top: y + 14, left: x + 14 }}
    >
      {children}
    </div>
  );
}

/** ——— badge „bec” (poți înlocui cu logo-ul vostru, cu fill="currentColor") ——— */
function StreakBadgeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className={active ? "text-emerald-600" : "text-gray-400"}>
      <path
        fill="currentColor"
        d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4.95 11.95c.57.57.95 1.3 1.07 2.1l.03.22h5.7l.03-.22c.12-.8.5-1.53 1.07-2.1A7 7 0 0 0 12 2Z"
      />
    </svg>
  );
}

/** ——— inel de progres pentru țintă săptămânală ——— */
function GoalRing({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
  const C = 2 * Math.PI * 18;
  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow flex items-center gap-4">
      <svg width="58" height="58" viewBox="0 0 44 44">
        <defs>
          <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r="18" className="fill-none stroke-gray-200" strokeWidth="6" />
        <circle
          cx="22"
          cy="22"
          r="18"
          className="fill-none"
          stroke="url(#ring)"
          strokeWidth="6"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
        <text x="22" y="25" textAnchor="middle" fontSize="11" className="fill-gray-700">
          {pct}%
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold">Țintă săptămânală</div>
        <div className="text-xs text-gray-600">
        {current}/{target} zile
        </div>

      </div>
    </div>
  );
}

/** ——— Sparkline mic pentru ultimele 14 zile ——— */
function SparklineCard({ values }: { values: number[] }) {
  const width = 260;
  const height = 68;
  const pad = 8;
  const max = Math.max(1, ...values);
  const dx = (width - pad * 2) / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * dx;
    const y = height - pad - (v / max) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow">
      <div className="text-sm font-semibold">Activitate (14 zile)</div>
      <div className="w-full mt-2">
        <svg width={width} height={height} role="img" aria-label="Sparkline activitate">
          {/* umbră sub linie */}
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="rgba(16,185,129,0.25)"
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* linie principală */}
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="rgb(16,185,129)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-1 text-[11px] text-gray-500">max/14z: {max}</div>
    </div>
  );
}

/** ——— Streak Hero (inel conic + confetti) ——— */
function StreakHeroCard({
  currentStreak,
  bestStreak,
  goal,
  todayVisited,
  nextMilestone,
  celebrate,
  onCloseCelebrate,
  onAchieveFlash = true,
}: {
  currentStreak: number;
  bestStreak: number;
  goal: number;                // acum e următorul milestone
  todayVisited: boolean;
  nextMilestone?: number | null;
  celebrate?: number | null;
  onCloseCelebrate?: () => void;
  onAchieveFlash?: boolean;
}) {
  const achieved = currentStreak >= goal;
  const [boom, setBoom] = useState(false);

  useEffect(() => {
    if (achieved && onAchieveFlash) {
      setBoom(true);
      const t = setTimeout(() => setBoom(false), 1200);
      return () => clearTimeout(t);
    }
  }, [achieved, onAchieveFlash]);

  const pct = Math.min(1, currentStreak / Math.max(1, goal));
  const ring = { background: `conic-gradient(#34d399 ${pct * 360}deg, rgba(0,0,0,0.08) 0deg)` } as React.CSSProperties;

  const pctToNext = nextMilestone ? Math.round((currentStreak / nextMilestone) * 100) : 100;

  const Flame = ({ on }: { on: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" className={on ? "text-amber-500 flame" : "text-gray-300"}>
      <path fill="currentColor" d="M12 2c2 3 1 4 4 6s3 6-1 8-7 0-8-3 1-5 3-7 1-3 2-4Z"/>
      <style jsx>{`
        @keyframes wobble { 0%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} 100%{transform:rotate(-6deg)} }
        .flame { animation: wobble 1.8s ease-in-out infinite; }
      `}</style>
    </svg>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow bg-gradient-to-br from-white to-emerald-50">
      {/* mic ribbon dacă suntem chiar pe un milestone */}
      {STREAK_MILESTONES.includes(currentStreak as any) && (
        <div className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200">
          🏅 {MILESTONE_LABELS[currentStreak as keyof typeof MILESTONE_LABELS] || `Streak ${currentStreak}`}
        </div>
      )}

      <div className="p-5 flex items-center gap-5">
        {/* inel conic */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full" style={ring} />
          <div className="absolute inset-2 rounded-full bg-white ring-1 ring-black/5 grid place-items-center">
            <Flame on={todayVisited} />
          </div>
          {achieved && <div className="absolute -inset-1 rounded-full blur-xl bg-emerald-400/25 animate-pulse" />}
        </div>

        {/* text */}
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-800">Streak curent</div>
          <div className="text-3xl font-semibold tracking-tight mt-0.5">{currentStreak} zile</div>
          <div className="text-xs text-gray-500 mt-1">Cel mai bun: {bestStreak}</div>

          {/* status azi + țintă dinamică */}
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className={todayVisited ? "text-emerald-600" : "text-gray-500"}>
              {todayVisited ? "Azi: bifat ✅" : "Azi: încă nebifat"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Țintă: {goal} zile</span>
          </div>

          {/* progres spre următorul milestone */}
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500"
                style={{ width: `${pctToNext}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-gray-600">
              {nextMilestone
                ? `Încă ${Math.max(0, nextMilestone - currentStreak)} zile până la ${nextMilestone}`
                : "Legendă! 🔥"}
            </div>
          </div>
        </div>
      </div>

      {/* modal de celebrare (o singură dată per milestone) */}
      {celebrate !== null && (
  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
    <div className="bg-white rounded-2xl p-5 shadow-xl text-center ring-1 ring-black/10">
      <div className="text-4xl mb-1">🏆</div>
      <div className="text-lg font-semibold">Streak {celebrate} zile!</div>
      <div className="text-sm text-gray-600 mt-1">
        Badge: {MILESTONE_LABELS[celebrate as keyof typeof MILESTONE_LABELS] ?? "Streaker"}
      </div>
      <button
        onClick={onCloseCelebrate}
        className="mt-3 px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-accent transition"
      >
        Nice!
      </button>
    </div>
  </div>
)}

    </div>
  );
}



/** ————— HEATMAP: prezență în aplicație (stil GitHub) ————— */
function ActivityHeatmap({
  title = "Prezență în aplicație (ultimele 35 zile)",
  data,
  days = 35,
}: {
  title?: string;
  data: Record<string, number>;
  days?: number;
}) {
  const [tt, setTt] = useState<{ show: boolean; x: number; y: number; text: string }>({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  const cells = useMemo(() => {
    const arr: { date: string; value: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = fmtDate(d);
      arr.push({ date: key, value: data[key] || 0 });
    }
    return arr;
  }, [data, days]);

  const level = (v: number) => {
    if (v === 0) return 0;
    if (v < 2) return 1;
    if (v < 4) return 2;
    if (v < 7) return 3;
    return 4;
  };

  // împărțim în coloane (săptămâni) cu câte 7 rânduri
  const weeks: { date: string; value: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // label de lună sub prima coloană dintr-o lună
  const monthLabelFor = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleString(undefined, { month: "short" });
  };
  const firstOfMonth = new Set(
    cells
      .filter((_, idx) => {
        const d = new Date(cells[idx].date + "T00:00:00");
        return d.getDate() === 1;
      })
      .map((c) => c.date)
  );

  const palette = ["bg-indigo-50", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600", "bg-emerald-700"];
  const isToday = (s: string) => s === fmtDate(new Date());

  return (
    <div
      className="relative bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
      onMouseMove={(e) => setTt((t) => ({ ...t, x: e.clientX, y: e.clientY }))}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {/* legendă */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>0</span>
          {palette.map((c, i) => (
            <span key={i} className={classNames("w-3.5 h-3.5 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]", c)} />
          ))}
          <span>max</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((c, ci) => (
              <div
                key={c.date + "-" + ci}
                onMouseEnter={() => setTt({ show: true, x: tt.x, y: tt.y, text: `${c.date}: ${c.value} vizite` })}
                onMouseLeave={() => setTt((t) => ({ ...t, show: false }))}
                className={classNames(
                  "w-3.5 h-3.5 rounded-[4px] transition-transform duration-150 hover:scale-[1.08] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]",
                  palette[level(c.value)],
                  isToday(c.date) && "ring-2 ring-white"
                )}
              />
            ))}
            {/* label de lună sub coloană dacă prima zi din lună e în coloană */}
            {firstOfMonth.has(w[0]?.date) && (
              <div className="h-4 text-[10px] text-gray-500 text-center mt-1">{monthLabelFor(w[0].date)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state overlay */}
      {isAllZeroMap(data) && (
        <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-base font-semibold">Încă nu avem activitate</div>
            <div className="text-sm text-gray-600 mt-1">Revino mâine sau completează-ți profilul.</div>
            <a href="/student/cv" className="inline-flex mt-3 px-3 py-1.5 rounded-lg bg-secondary text-white">
              Completează CV
            </a>
          </div>
        </div>
      )}

      <CursorTooltip show={tt.show} x={tt.x} y={tt.y}>
        {tt.text}
      </CursorTooltip>
    </div>
  );
}

/** ————— BAR CHART: postări organizații / săptămână ————— */
function OrgPostsBar({
  title = "Postări organizații / săptămână",
  data,
  height = 200,
}: {
  title?: string;
  data: { label: string; value: number }[];
  height?: number;
}) {
  const [tt, setTt] = useState<{ show: boolean; x: number; y: number; text: string }>({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  // ——— helpers etichete ———
  const compactWeekLabel = (s: string) =>
    String(s).replace("Săpt.", "S").replace(/\s+/g, " ").trim(); // „Săpt. -3” -> „S-3”, „Săpt. curentă” -> „S curentă”

  // rărim etichetele ca să nu se suprapună (vizăm ~6 etichete vizibile)
  const showEvery = useMemo(() => {
    if (data.length <= 6) return 1;
    return Math.ceil(data.length / 6);
  }, [data.length]);

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);
  const avg = useMemo(() => {
    if (!data.length) return 0;
    const v = data.reduce((s, d) => s + d.value, 0) / data.length;
    return Math.round(v * 10) / 10;
  }, [data]);

  // ——— layout ———
  const barW = 26;
  const gap = 12;
  const LEFT_PAD = 12;
  const RIGHT_PAD = 12;
  const LABEL_PAD = 32; // spațiu pentru etichete jos (orizontal)
  const TOP_PAD = 18;
  const innerH = height - (LABEL_PAD + TOP_PAD);
  const width = LEFT_PAD + RIGHT_PAD + data.length * barW + (data.length - 1) * gap;

  const avgH = Math.round((avg / max) * innerH);
  const ticks = [0.25, 0.5, 0.75];

  return (
    <div
      className="relative bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
      onMouseMove={(e) => setTt((t) => ({ ...t, x: e.clientX, y: e.clientY }))}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs text-gray-500">ultimele {data.length} săpt.</span>
      </div>

      <div className="w-full overflow-x-auto" style={{ height }}>
        <svg width={width} height={height} role="img" aria-label="Postări organizații">
          <defs>
            <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {ticks.map((t, i) => {
            const y = height - LABEL_PAD - Math.round(t * innerH);
            return (
              <line
                key={i}
                x1={LEFT_PAD}
                x2={width - RIGHT_PAD}
                y1={y}
                y2={y}
                className="stroke-gray-200"
                strokeDasharray="3 6"
              />
            );
          })}

          {/* linia de medie + chip */}
                <line
        x1={LEFT_PAD}
        x2={width - RIGHT_PAD}
        y1={height - LABEL_PAD - avgH}
        y2={height - LABEL_PAD - avgH}
        className="stroke-amber-700/40"
        strokeDasharray="4 4"
      />

                <rect
        x={LEFT_PAD + 4}
        y={height - LABEL_PAD - avgH - 16}
        width="56"
        height="18"
        rx="9"
        className="fill-white"
      />
                <text
        x={LEFT_PAD + 32}
        y={height - LABEL_PAD - avgH - 3}
        textAnchor="middle"
        fontSize="10"
        className="fill-amber-700"
      >
        avg {avg}
      </text>

          {/* bare + etichete */}
          {data.map((d, i) => {
            const h = Math.round((d.value / max) * innerH);
            const x = LEFT_PAD + i * (barW + gap);
            const y = height - LABEL_PAD - h;

            // eticheta afisată doar la fiecare 'showEvery'
            const showLabel = i % showEvery === 0 || i === data.length - 1; // afișăm ultima mereu
            const label = compactWeekLabel(d.label);

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="7"
                  className="drop-shadow-sm"
                  fill="url(#barGrad)"
                  onMouseEnter={() =>
                    setTt({
                      show: true,
                      x: tt.x,
                      y: tt.y,
                      text: `${d.label}: ${d.value} postări / săpt.`,
                    })
                  }
                  onMouseLeave={() => setTt((t) => ({ ...t, show: false }))}
                />

                {/* valoarea deasupra barei */}
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" className="fill-gray-700">
                  {d.value}
                </text>

                {/* etichetă orizontală, doar la interval fix */}
                {showLabel && (
                  <text
                    x={x + barW / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-gray-600"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Empty state overlay */}
      {isAllZeroBars(data) && (
        <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
          <div className="text-center">
            <div className="text-base font-semibold">Încă nu sunt postări</div>
            <div className="text-sm text-gray-600 mt-1">Urmărește organizații ca să vezi noutăți.</div>
            <a href="/student/opportunities" className="inline-flex mt-3 px-3 py-1.5 rounded-lg bg-secondary text-white">
              Vezi organizații
            </a>
          </div>
        </div>
      )}

      <CursorTooltip show={tt.show} x={tt.x} y={tt.y}>
        {tt.text}
      </CursorTooltip>
    </div>
  );
}




function formatWeekLabel(raw: string) {
  const s = String(raw).trim();

  // Cazul tău actual (“azi”, “-1”, “-2” …)
  if (s === "azi") return "Săpt. curentă";
  if (/^-\d+$/.test(s)) return `Săpt. ${s}`;

  // Dacă în viitor backend-ul trimite o dată (YYYY-MM-DD) = orice zi din săptămână
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + "T00:00:00");
    // calculează luni–duminică pentru acea săptămână
    const dow = (d.getDay() + 6) % 7; // 0 = luni
    const start = new Date(d); start.setDate(d.getDate() - dow);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const fmt = (x: Date) => x.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    return `${fmt(start)}–${fmt(end)}`;
  }

  // fallback
  return s;
}
function compactWeekLabel(s: string) {
  // "Săpt. -7" -> "S-7", "Săpt. curentă" -> "S curentă"
  return s.replace("Săpt.", "S").replace(/\s+/g, " ");
}



/** ————— pagina dashboard student ————— */
export default function StudentHome() {
  const API = "http://localhost:5000";
  const STUDENT_ANALYTICS = `${API}/api/analytics/student`;
  const ORG_ANALYTICS = `${API}/api/analytics/orgs`;

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [orgBars, setOrgBars] = useState<{ label: string; value: number }[]>([]);

  // anti-dublare pageview în dev (StrictMode)
  const sentRef = useRef(false);
useEffect(() => {
  let ignore = false;
  const token = localStorage.getItem("token") || "";
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  (async () => {
    try {
      // 0) marchează vizita întâi, ca "azi" să apară imediat în presence
      //await fetch(`${STUDENT_ANALYTICS}/pageview`, {
       /// method: "POST",
       /// credentials: "include",
        ///headers: h,
      ///}).catch(() => {});

      // 1) apoi citește presence (alimentează Heatmap + Streak + Sparkline + GoalRing)
      const pres = await fetch(`${STUDENT_ANALYTICS}/presence?days=35`, {
        credentials: "include",
        headers: { Authorization: h.Authorization },
      });
      if (pres.ok) {
        const payload = await pres.json();
        if (!ignore) setHeatmapData(payload || {});
      } else {
        throw new Error("presence failed");
      }

      // 2) barchart organizații
      const org = await fetch(`${ORG_ANALYTICS}/posts?weeks=8`, {
        credentials: "include",
        headers: { Authorization: h.Authorization },
      });
      if (org.ok) {
  const payload: { label: string; value: number }[] = await org.json();
  if (!ignore) setOrgBars((payload || []).map(d => ({ ...d, label: formatWeekLabel(String(d.label)) })));
}else {
        throw new Error("org posts failed");
      }
    } catch {
      // —— fallback-uri UI (mock) ——
      // presence mock
      const mock: Record<string, number> = {};
      const today = new Date();
      for (let i = 0; i < 35; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        mock[fmtDate(d)] = Math.random() < 0.35 ? 0 : Math.floor(Math.random() * 4);
      }
      if (!ignore) setHeatmapData(mock);

      // org bars mock
      const labels = ["-7", "-6", "-5", "-4", "-3", "-2", "-1", "azi"];
if (!ignore) setOrgBars(labels.map(l => ({
  label: formatWeekLabel(l),
  value: Math.floor(Math.random() * 8)
})));
    }
  })();

  // opțional: auto-refresh la fiecare 60s dacă stai pe dashboard
  const t = setInterval(async () => {
    try {
      const res = await fetch(`${STUDENT_ANALYTICS}/presence?days=35`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const payload = await res.json();
        if (!ignore) setHeatmapData(payload || {});
      }
    } catch {}
  }, 60000);

  return () => {
    ignore = true;
    clearInterval(t);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [STUDENT_ANALYTICS, ORG_ANALYTICS]);


  const { currentStreak, bestStreak, weekCount, last14Flags, todayVisited } = useMemo(
  () => derivePresenceMetrics(heatmapData),
  [heatmapData]
);
  const nextMilestone = useMemo(() => nextMilestoneFor(currentStreak), [currentStreak]);
const streakGoalForUI = nextMilestone ?? 3; // ținta din card = următorul milestone

// modal/celebrare o singură dată per milestone
const [celebrate, setCelebrate] = useState<number | null>(null);
useEffect(() => {
  if (STREAK_MILESTONES.includes(currentStreak as any)) {
    const key = `streak:celebrated:${currentStreak}`;
    if (!localStorage.getItem(key)) {
      setCelebrate(currentStreak);
      localStorage.setItem(key, "1");
    }
  }
}, [currentStreak]);

  const STREAK_GOAL = 3; // ex: 3 zile la rând
  const WEEK_GOAL = 5; // ex: 5 vizite / săptămână

  return (
    <div className="space-y-8 mt-10">
      {/* statistici rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Stat title="Puncte" value={120} />
        <Stat title="Badge-uri" value={3} />
        <Stat title="Aplicații" value={2} />
        <Stat title="Recomandate" value={5} />
      </div>

      {/* gamification row: streak + goal + sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <StreakHeroCard
  currentStreak={currentStreak}
  bestStreak={bestStreak}
  goal={streakGoalForUI}           // ← țintă dinamică
  todayVisited={todayVisited}
  nextMilestone={nextMilestone}
  celebrate={celebrate}
  onCloseCelebrate={() => setCelebrate(null)}
/>


<GoalRing current={weekCount} target={WEEK_GOAL} />   {/* ← va fi 1/5 */}
<SparklineCard values={last14Flags} />

      </div>

      {/* 2 grafice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityHeatmap data={heatmapData} />
        <OrgPostsBar data={orgBars} />
      </div>

      {/* recomandate */}
      <section className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Oportunități recomandate</h2>
        <p className="text-sm text-gray-600 mb-4">Vezi lista completă și aplică rapid.</p>

        <Link
          href="/student/opportunities"
          className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow"
        >
          Vezi oportunități <span>→</span>
        </Link>
      </section>
    </div>
  );
}
