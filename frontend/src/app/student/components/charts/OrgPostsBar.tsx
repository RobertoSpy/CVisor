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

  const barW = 26;
  const gap = 12;
  const LEFT_PAD = 12;
  const RIGHT_PAD = 12;
  const LABEL_PAD = 32;
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

          {ticks.map((t, i) => {
            const y = height - LABEL_PAD - Math.round(t * innerH);
            return <line key={i} x1={LEFT_PAD} x2={width - RIGHT_PAD} y1={y} y2={y} className="stroke-gray-200" strokeDasharray="3 6" />;
          })}

          <line
            x1={LEFT_PAD}
            x2={width - RIGHT_PAD}
            y1={height - LABEL_PAD - avgH}
            y2={height - LABEL_PAD - avgH}
            className="stroke-amber-700/40"
            strokeDasharray="4 4"
          />
          <rect x={LEFT_PAD + 4} y={height - LABEL_PAD - avgH - 16} width="56" height="18" rx="9" className="fill-white" />
          <text x={LEFT_PAD + 32} y={height - LABEL_PAD - avgH - 3} textAnchor="middle" fontSize="10" className="fill-amber-700">
            avg {avg}
          </text>

          {data.map((d, i) => {
            const h = Math.round((d.value / max) * innerH);
            const x = LEFT_PAD + i * (barW + gap);
            const y = height - LABEL_PAD - h;

            const showLabel = i % showEvery === 0 || i === data.length - 1;
            const label = String(d.label).replace("Săpt.", "S").replace(/\s+/g, " ").trim();

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
                  onMouseEnter={() => setTt({ show: true, x: tt.x, y: tt.y, text: `${d.label}: ${d.value} postări / săpt.` })}
                  onMouseLeave={() => setTt((t) => ({ ...t, show: false }))}
                />
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" className="fill-gray-700">
                  {d.value}
                </text>
                {showLabel && (
                  <text x={x + barW / 2} y={height - 10} textAnchor="middle" fontSize="10" className="fill-gray-600">
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

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
