"use client";
import React from "react";

export default function GentleBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-2 bg-amber-50 text-amber-800 text-sm ring-1 ring-amber-200 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  );
}
