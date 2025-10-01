"use client";
import React from "react";

export default function SparklineCard({ values }: { values: number[] }) {
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
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="rgba(16,185,129,0.25)"
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
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
