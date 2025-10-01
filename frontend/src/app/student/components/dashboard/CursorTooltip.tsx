"use client";
import React from "react";

export default function CursorTooltip({
  show,
  x,
  y,
  children,
}: {
  show: boolean;
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div
      className="fixed z-50 pointer-events-none select-none px-2 py-1 rounded-md text-xs bg-gray-900 text-white shadow-lg"
      style={{ top: y + 14, left: x + 14 }}
    >
      {children}
    </div>
  );
}
