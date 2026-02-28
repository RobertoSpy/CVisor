"use client";
import React, { useMemo, useState } from "react";
import CursorTooltip from "../dashboard/CursorTooltip";
import { isAllZeroBars } from "../../lib/utils";

export default function OrgPostsBar({
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

  const safeData = Array.isArray(data) ? data : [];

  const showEvery = useMemo(() => {
    if (safeData.length <= 6) return 1;
    return Math.ceil(safeData.length / 6);
  }, [safeData.length]);


  const avg = useMemo(() => {
    if (!safeData.length) return 0;
    const v = safeData.reduce((s, d) => s + d.value, 0) / safeData.length;
    return Math.round(v * 10) / 10;
  }, [safeData]);

  const barW = 26;
  const gap = 12;
  const LEFT_PAD = 12;
  const RIGHT_PAD = 12;
  const LABEL_PAD = 32;
  const TOP_PAD = 30; // Increased padding to prevent overlap
  const innerH = height - (LABEL_PAD + TOP_PAD);
  const width = LEFT_PAD + RIGHT_PAD + safeData.length * barW + (safeData.length - 1) * gap;

  // Ensure max has a floor of 5 to prevent single events appearing huge
  const dataMax = Math.max(0, ...safeData.map((d) => d.value));
  const max = Math.max(5, dataMax);

  const avgH = Math.round((avg / max) * innerH);
  const ticks = [0.25, 0.5, 0.75];

  return (
    <div
      className="relative bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
      onMouseMove={(e) => setTt((t) => ({ ...t, x: e.clientX, y: e.clientY }))}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs text-gray-500">ultimele {safeData.length} săpt.</span>
      </div>

      <div className="w-full h-full flex items-end justify-between gap-2 overflow-hidden" style={{ height: innerH }}>
        {safeData.slice(-7).map((d, i) => {
          // Use logarithmic scaling for large values to prevent bars from dominating
          const scaledValue = dataMax > 20 ? Math.log2(d.value + 1) : d.value;
          const scaledMax = dataMax > 20 ? Math.log2(max + 1) : max;
          const h = Math.round((scaledValue / scaledMax) * innerH);
          const isZero = d.value === 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative min-w-0">
              <div
                className="w-full max-w-[30px] rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all relative"
                style={{ height: `${Math.max(Math.min(h, innerH), 4)}px`, opacity: isZero ? 0.2 : 1 }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {d.value} postări
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 font-medium truncate max-w-full">{String(d.label).split(' ')[0]}</span>
            </div>
          );
        })}
      </div>

      {isAllZeroBars(safeData) && (
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
