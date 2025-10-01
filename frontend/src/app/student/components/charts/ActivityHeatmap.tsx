"use client";
import React, { useMemo, useState } from "react";
import { classNames, fmtDate, isAllZeroMap } from "../../lib/utils";
import CursorTooltip from "../dashboard/CursorTooltip";

export default function ActivityHeatmap({
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

  const weeks: { date: string; value: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

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
            {firstOfMonth.has(w[0]?.date) && (
              <div className="h-4 text-[10px] text-gray-500 text-center mt-1">{monthLabelFor(w[0].date)}</div>
            )}
          </div>
        ))}
      </div>

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
