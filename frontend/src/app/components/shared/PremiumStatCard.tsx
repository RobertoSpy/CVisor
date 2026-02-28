/**
 * PremiumStatCard — shared dashboard stat card used by both student and org dashboards.
 * Previously duplicated in student/page.tsx and organization/page.tsx.
 */
"use client";
import React from "react";

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  pink: "bg-pink-50 text-pink-600 ring-pink-100",
  purple: "bg-purple-50 text-purple-600 ring-purple-100",
  red: "bg-red-50 text-red-600 ring-red-100",
};

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

export default function PremiumStatCard({ title, value, icon, color, subtext }: PremiumStatCardProps) {
  const activeColor = COLOR_CLASSES[color] ?? COLOR_CLASSES.blue;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
          {subtext && <p className="text-[10px] md:text-xs font-medium text-gray-400 mt-2">{subtext}</p>}
        </div>
        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-2xl grid place-items-center text-lg md:text-xl shadow-inner ring-1 ${activeColor}`}>
          {icon}
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-${color}-500 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
    </div>
  );
}
