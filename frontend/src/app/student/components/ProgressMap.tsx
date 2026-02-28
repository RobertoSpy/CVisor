import React from "react";

import { BADGES } from "../lib/streak";

type ProgressMapProps = {
  badges: string[];
  currentPoints: number;
  routeMode?: boolean;
};

export default function ProgressMap({ badges, currentPoints, routeMode = false }: ProgressMapProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl min-w-[340px] relative">
        <button
          className="absolute top-3 right-4 text-gray-500 text-xl"
          onClick={() => window.dispatchEvent(new Event("closeMap"))}
        >×</button>
        <h2 className="text-xl font-bold mb-6 text-center">Parcursul tău</h2>
        <div className={routeMode ? "flex flex-row items-center gap-8" : "flex flex-col items-center gap-4"}>
          {BADGES.map((b, idx) => {
            const unlocked = badges.includes(b.code);
            const isCurrentTarget = currentPoints < b.points && (!idx || currentPoints >= BADGES[idx - 1].points);

            return (
              <div key={b.code} className="flex flex-col items-center relative group">
                {isCurrentTarget && (
                  <div className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded-full animate-bounce whitespace-nowrap">
                    Ești aici: {currentPoints} Puncte
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                  </div>
                )}

                <div className={
                  "h-14 w-14 flex items-center justify-center rounded-full text-3xl border-4 transition-all relative z-10 " +
                  (unlocked ? "border-emerald-400 bg-emerald-50" :
                    isCurrentTarget ? "border-amber-400 bg-amber-50 ring-4 ring-amber-100" : "border-gray-300 bg-gray-50")
                }>
                  {unlocked ? b.emoji : isCurrentTarget ? "🏃" : <span className="opacity-40">🔒</span>}
                </div>
                <div className={unlocked ? "font-bold mt-1" : "text-gray-400 mt-1"}>
                  {b.label}
                </div>
                <div className="text-xs text-gray-500">
                  {b.points} Puncte
                  {b.feature && (
                    <div className="text-indigo-500 font-medium">({b.feature})</div>
                  )}
                </div>
                {/* linie animată ca traseu */}
                {routeMode && idx < BADGES.length - 1 && (
                  <div className={`absolute top-1/2 left-full w-12 h-1 -translate-y-1/2 z-0 ${(unlocked || isCurrentTarget && currentPoints > b.points) ? "bg-emerald-300" : "bg-gray-200"}`}></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Continuă să acumulezi puncte și vei debloca mai multe badge-uri și funcții!
        </div>
      </div>
    </div>
  );
}