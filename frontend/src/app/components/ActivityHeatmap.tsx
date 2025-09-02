"use client";
import React, { useMemo } from "react";

type Props = {
  title?: string;
  // map: "YYYY-MM-DD" -> count (ex: { "2025-08-25": 3 })
  data: Record<string, number>;
  days?: number; // câte zile în urmă (default 35, ~5 săpt.)
};

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ActivityHeatmap({ title = "Activitate în aplicație", data, days = 35 }: Props) {
  const cells = useMemo(() => {
    const arr: { date: string; value: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDate(d);
      arr.push({ date: key, value: data[key] || 0 });
    }
    return arr;
  }, [data, days]);

  // intensitate (ca la GitHub): 0 = gol, 1..4 = verde mai închis
  const level = (v: number) => {
    if (v === 0) return 0;
    if (v < 2) return 1;
    if (v < 4) return 2;
    if (v < 7) return 3;
    return 4;
  };

  // aranjăm pe săptămâni (coloane), 7 rânduri (lun-duminică)
  const weeks: { date: string; value: number }[][] = [];
  const startWeekday = new Date(cells[0].date).getDay(); // 0 duminică
  // opțional: putem „alinia” la luni, dar pentru simplitate păstrăm secvența.

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        <span className="muted">Ultimele {days} zile</span>
      </div>

      <div className="heatmap">
        {weeks.map((w, wi) => (
          <div key={wi} className="week-col">
            {w.map((c, ci) => (
              <div
                key={c.date + "-" + ci}
                className={`cell lvl-${level(c.value)}`}
                title={`${c.date}: ${c.value} vizite`}
                aria-label={`${c.date}: ${c.value} vizite`}
              />
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 6px 24px rgba(0,0,0,.06); }
        .card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .card-head h3 { margin:0; font-size:1.05rem; }
        .muted { color:#6b7280; font-size:.85rem; }
        .heatmap { display:flex; gap:4px; overflow-x:auto; padding-bottom:4px; }
        .week-col { display:flex; flex-direction:column; gap:4px; }
        .cell { width:14px; height:14px; border-radius:3px; background:#eef2ff; }
        /* paletă inspirată GitHub, dar pe schema ta (albastru-galben discret) */
        .lvl-0 { background:#eef2ff; }        /* gol */
        .lvl-1 { background:#c7e9c0; }
        .lvl-2 { background:#7fc97f; }
        .lvl-3 { background:#41ab5d; }
        .lvl-4 { background:#238443; }
        @media (max-width: 640px) {
          .cell { width:12px; height:12px; }
        }
      `}</style>
    </div>
  );
}
