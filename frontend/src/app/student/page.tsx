"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import Stat from "./components/dashboard/Stat";
import GentleBanner from "./components/dashboard/GentleBanner";
import GoalRing from "./components/charts/GoalRing";
import SparklineCard from "./components/charts/SparklineCard";
import ActivityHeatmap from "./components/charts/ActivityHeatmap";
import OrgPostsBar from "./components/charts/OrgPostsBar";
import StreakHeroCard from "./components/streak/StreakHeroCard";

import useStudentAnalytics from "./hooks/useStudentAnalytics";
import {
  STREAK_MILESTONES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "./lib/streak";

export default function StudentHome() {
  // ===== fetch analytics =====
  const { heatmapData, orgBars } = useStudentAnalytics("http://localhost:5000");

  // ===== local state =====
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [lastFreezeUsed, setLastFreezeUsed] = useState<string | null>(null);
  const [lsTick, setLsTick] = useState(0); // forțează re-calc după patch/repair

  // ===== calcule =====
  const presence = useMemo(() => computeStreakAuto(heatmapData), [heatmapData, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(heatmapData), [heatmapData, lsTick]);
  const raw = useMemo(() => deriveRawPresence(heatmapData), [heatmapData]);

  const displayStreak = presence.currentStreak; // include auto-patch
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  // milestone modal (o singură dată per valoare)
  useEffect(() => {
    if (STREAK_MILESTONES.includes(displayStreak as any)) {
      const key = `streak:celebrated:${displayStreak}`;
      if (!localStorage.getItem(key)) {
        setCelebrate(displayStreak);
        localStorage.setItem(key, "1");
      }
    }
  }, [displayStreak]);

  // citește & actualizează info freeze/repair
  useEffect(() => {
    if (typeof window === "undefined") return;
    setLastFreezeUsed(localStorage.getItem(LS_KEYS.lastFreezeUsed));
  }, []);
  useEffect(() => {
    if (presence.usedAutoFreezeNow && typeof window !== "undefined") {
      setLastFreezeUsed(localStorage.getItem(LS_KEYS.lastFreezeUsed));
      setLsTick((t) => t + 1);
    }
  }, [presence.usedAutoFreezeNow]);

  return (
    <div className="space-y-8 mt-10">
      {/* statistici rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Stat title="Puncte" value={120} />
        <Stat title="Badge-uri" value={3} />
        <Stat title="Aplicații" value={2} />
        <Stat title="Recomandate" value={5} />
      </div>

      {/* gamification row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <StreakHeroCard
            currentStreak={displayStreak}
            bestStreak={presence.bestStreak}
            goal={streakGoalForUI}
            todayVisited={raw.todayVisited}       // REAL pentru ziua curentă
            nextMilestone={nextMilestone}
            celebrate={celebrate}
            onCloseCelebrate={() => setCelebrate(null)}
          />

          {/* A) auto-freeze aplicat azi */}
          {presence.usedAutoFreezeNow && (
            <GentleBanner>
              Bine că ai revenit! 💛 Ți-am „înghețat” streak-ul pentru o zi lipsă — se mai întâmplă.
            </GentleBanner>
          )}

          {/* B) pauză 2+ zile -> repair */}
          {presence.gapInfo && (
            <GentleBanner>
              Ai avut o pauză de <b>{presence.gapInfo.length}</b> zile ({presence.gapInfo.start} → {presence.gapInfo.end}).{" "}
              Poți repara streakul:
              <button
                onClick={() => {
                  repairGap(presence.gapInfo, 100);
                  setLsTick((t) => t + 1);
                }}
                className="ml-2 px-2 py-1 rounded-md bg-amber-600 text-white"
              >
                Repară pentru 100 💎
              </button>
            </GentleBanner>
          )}

          <div className="text-[11px] text-gray-500">
            Ultimul auto-freeze: {lastFreezeUsed ?? "—"}
            <span className="text-gray-400"> • </span>
            Ultimul repair: {typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.lastRepairUsed) ?? "—" : "—"}
          </div>
        </div>

        {/* Ținta săptămânală și activitatea pe 14 zile — bazate pe RAW */}
        <GoalRing current={raw.weekCount} target={WEEK_GOAL} />
        <SparklineCard values={raw.last14Flags} />
      </div>

      {/* grafice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityHeatmap data={heatmapData} />
        <OrgPostsBar data={orgBars} />
      </div>

      {/* recomandate */}
      <section className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Oportunități recomandate</h2>
        <p className="text-sm text-gray-600 mb-4">Vezi lista completă și aplică rapid.</p>
        <Link
          href="/student/opportunities"
          className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow"
        >
          Vezi oportunități <span>→</span>
        </Link>
      </section>
    </div>
  );
}
