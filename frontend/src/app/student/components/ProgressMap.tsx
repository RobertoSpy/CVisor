import React from "react";

import {BADGES} from "../lib/streak";

type ProgressMapProps = {
  badges: string[];            // lista de coduri de badge deblocate, de la backend
  routeMode?: boolean;         // dacă vrei să faci traseu orizontal
};

export default function ProgressMap({ badges, routeMode = false }: ProgressMapProps) {
  // Poți anima badge-urile deblocate cu Tailwind animate-bounce dacă vrei
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
            return (
              <div key={b.code} className="flex flex-col items-center relative">
                <div className={
                  "h-14 w-14 flex items-center justify-center rounded-full text-3xl border-4 transition-all " +
                  (unlocked ? "border-emerald-400 bg-emerald-50 animate-bounce" : "border-gray-300 bg-gray-50")
                }>
                  {unlocked ? b.emoji : <span role="img" aria-label="lock">🔒</span>}
                </div>
                <div className={unlocked ? "font-bold mt-1" : "text-gray-400 mt-1"}>
                  {b.label}
                </div>
                <div className="text-xs text-gray-500">
                  {b.streak} zile streak
                  {b.feature && (
                    <span className="ml-2 text-indigo-500 font-medium">({b.feature})</span>
                  )}
                </div>
                {/* linie animată ca traseu */}
                {routeMode && idx < BADGES.length - 1 && (
                  <div className="absolute top-1/2 left-full w-12 h-1 bg-emerald-300" style={{ zIndex: -1 }}></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Continuă să faci streak și vei debloca mai multe badge-uri și funcții!
        </div>
      </div>
    </div>
  );
}