"use client";
import React, { useMemo, useState } from "react";
import { classNames, fmtDate } from "../../lib/utils";

export default function ActivityHeatmap({
  title = "Prezență în aplicație (ultimele 35 zile)",
  data,
  days = 35,
}: {
  title?: string;
  data: Record<string, number>;
  days?: number;
}) {
  const [selectedCell, setSelectedCell] = useState<{ date: string; value: number } | null>(null);

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
    return d.toLocaleString("ro-RO", { month: "short" });
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

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
  };

  const dayName = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("ro-RO", { weekday: "long" });
  };

  return (
    <div className="relative bg-card rounded-2xl p-4 md:p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>0</span>
          {palette.map((c, i) => (
            <span key={i} className={classNames("w-3 h-3 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]", c)} />
          ))}
          <span>max</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {w.map((c, ci) => (
              <button
                key={c.date + "-" + ci}
                type="button"
                onClick={() => setSelectedCell(selectedCell?.date === c.date ? null : c)}
                className={classNames(
                  "w-4 h-4 md:w-3.5 md:h-3.5 rounded-[4px] transition-all duration-150 hover:scale-110 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] cursor-pointer",
                  palette[level(c.value)],
                  isToday(c.date) && "ring-2 ring-blue-400",
                  selectedCell?.date === c.date && "ring-2 ring-amber-400 scale-125"
                )}
                aria-label={`${c.date}: ${c.value} vizite`}
              />
            ))}
            {firstOfMonth.has(w[0]?.date) && (
              <div className="h-4 text-[9px] text-gray-500 text-center mt-1">{monthLabelFor(w[0].date)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Selected cell info panel (mobile-friendly tap) */}
      {selectedCell && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between animate-in fade-in duration-200">
          <div>
            <div className="text-sm font-semibold text-gray-800 capitalize">{dayName(selectedCell.date)}</div>
            <div className="text-xs text-gray-500">{formatDate(selectedCell.date)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={classNames("w-4 h-4 rounded-[4px]", palette[level(selectedCell.value)])} />
            <span className="text-sm font-bold text-gray-700">
              {selectedCell.value === 0 ? "Nicio vizită" : `${selectedCell.value} ${selectedCell.value === 1 ? "vizită" : "vizite"}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
