"use client";
import React from "react";

export default function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-0.5 tracking-tight">{value}</div>
    </div>
  );
}
