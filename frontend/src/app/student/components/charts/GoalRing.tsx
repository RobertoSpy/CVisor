"use client";
import React from "react";

export default function GoalRing({ current, target }: { current: number; target: number }) {
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
