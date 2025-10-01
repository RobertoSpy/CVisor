"use client";
import React, { useEffect, useState } from "react";
import { MILESTONE_LABELS, STREAK_MILESTONES } from "../../lib/streak";

export default function StreakHeroCard({
  currentStreak,
  bestStreak,
  goal,
  todayVisited,
  nextMilestone,
  celebrate,
  onCloseCelebrate,
  onAchieveFlash = true,
}: {
  currentStreak: number;
  bestStreak: number;
  goal: number;
  todayVisited: boolean;
  nextMilestone?: number | null;
  celebrate?: number | null;
  onCloseCelebrate?: () => void;
  onAchieveFlash?: boolean;
}) {
  const achieved = currentStreak >= goal;
  const [boom, setBoom] = useState(false);

  useEffect(() => {
    if (achieved && onAchieveFlash) {
      setBoom(true);
      const t = setTimeout(() => setBoom(false), 1200);
      return () => clearTimeout(t);
    }
  }, [achieved, onAchieveFlash]);

  const pct = Math.min(1, currentStreak / Math.max(1, goal));
  const ring = { background: `conic-gradient(#34d399 ${pct * 360}deg, rgba(0,0,0,0.08) 0deg)` } as React.CSSProperties;
  const pctToNext = nextMilestone ? Math.round((currentStreak / nextMilestone) * 100) : 100;

  const Flame = ({ on }: { on: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" className={on ? "text-amber-500 flame" : "text-gray-300"}>
      <path fill="currentColor" d="M12 2c2 3 1 4 4 6s3 6-1 8-7 0-8-3 1-5 3-7 1-3 2-4Z" />
      <style jsx>{`
        @keyframes wobble {
          0% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
          100% { transform: rotate(-6deg); }
        }
        .flame { animation: wobble 1.8s ease-in-out infinite; }
      `}</style>
    </svg>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow bg-gradient-to-br from-white to-emerald-50">
      {STREAK_MILESTONES.includes(currentStreak as any) && (
        <div className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200">
          🏅 {MILESTONE_LABELS[currentStreak as keyof typeof MILESTONE_LABELS] || `Streak ${currentStreak}`}
        </div>
      )}

      <div className="p-5 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full" style={ring} />
          <div className="absolute inset-2 rounded-full bg-white ring-1 ring-black/5 grid place-items-center">
            <Flame on={todayVisited} />
          </div>
          {achieved && <div className="absolute -inset-1 rounded-full blur-xl bg-emerald-400/25 animate-pulse" />}
        </div>

        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-800">Streak curent</div>
          <div className="text-3xl font-semibold tracking-tight mt-0.5">{currentStreak} zile</div>
          <div className="text-xs text-gray-500 mt-1">Cel mai bun: {bestStreak}</div>

          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className={todayVisited ? "text-emerald-600" : "text-gray-500"}>
              {todayVisited ? "Azi: bifat ✅" : "Azi: încă nebifat"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Țintă: {goal} zile</span>
          </div>

          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${pctToNext}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-gray-600">
              {nextMilestone ? `Încă ${Math.max(0, nextMilestone - currentStreak)} zile până la ${nextMilestone}` : "Legendă! 🔥"}
            </div>
          </div>
        </div>
      </div>

      {celebrate !== null && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-5 shadow-xl text-center ring-1 ring-black/10">
            <div className="text-4xl mb-1">🏆</div>
            <div className="text-lg font-semibold">Streak {celebrate} zile!</div>
            <div className="text-sm text-gray-600 mt-1">
              Badge: {MILESTONE_LABELS[celebrate as keyof typeof MILESTONE_LABELS] ?? "Streaker"}
            </div>
            <button onClick={onCloseCelebrate} className="mt-3 px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-accent transition">
              Nice!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
