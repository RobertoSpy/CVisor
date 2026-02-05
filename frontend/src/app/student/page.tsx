"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import Link from "next/link";

import GentleBanner from "./components/dashboard/GentleBanner";
import GoalRing from "./components/charts/GoalRing";
import SparklineCard from "./components/charts/SparklineCard";
import ActivityHeatmap from "./components/charts/ActivityHeatmap";
import OrgPostsBar from "./components/charts/OrgPostsBar";
import StreakHeroCard from "./components/streak/StreakHeroCard";
import StudentStatsRow from "./components/dashboard/StudentStatsRow";
import InstallPrompt from "./components/InstallPrompt";
import TodaysOpportunities from "./components/dashboard/TodaysOpportunities";

import useStudentData from "./hooks/useStudentData";
import { DASHBOARD_STRINGS } from "./constants";
import {
  BADGES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "./lib/streak";

export default function StudentHome() {
  const {
    points,
    badges,
    heatmapData,
    orgBars,
    createdAt,
    mutatePoints,
    mutateBadges,
    mutatePresence
  } = useStudentData();

  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [lastFreezeUsed, setLastFreezeUsed] = useState<string | null>(null);
  const [lastRepairUsed, setLastRepairUsed] = useState<string | null>(null);
  const [lsTick, setLsTick] = useState(0);
  const hasLoggedPageview = useRef(false);

  // --- Filter Logic ---
  const filteredHeatmap = useMemo(() => {
    if (!createdAt) return heatmapData;
    const cDate = new Date(createdAt);
    cDate.setHours(0, 0, 0, 0);
    return Object.fromEntries(
      Object.entries(heatmapData).filter(([day, _]) => {
        const d = new Date(day);
        d.setHours(0, 0, 0, 0);
        return d >= cDate;
      })
    );
  }, [heatmapData, createdAt]);

  // --- Init ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastRepairUsed(localStorage.getItem(LS_KEYS.lastRepairUsed));
      setLastFreezeUsed(localStorage.getItem(LS_KEYS.lastFreezeUsed));
    }
  }, []);

  // --- Pageview / Daily Login ---
  useEffect(() => {
    if (hasLoggedPageview.current) return;
    hasLoggedPageview.current = true;

    fetch("/api/students/stats/pageview", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.points_awarded) {
            toast.success(DASHBOARD_STRINGS.LOGIN_POINTS_TOAST, {
              icon: "💎",
              duration: 4000
            });
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#3b82f6", "#60a5fa", "#ffffff"]
            });
          }
          if (data.unlockedBadges && data.unlockedBadges.length > 0) {
            data.unlockedBadges.forEach((b: any) => {
              toast.success(DASHBOARD_STRINGS.BADGE_UNLOCK_TOAST(b.label || b.code), {
                icon: "🏅",
                duration: 6000
              });
            });
          }
          mutatePresence();
          mutatePoints();
          mutateBadges();
        }
      })
      .catch(console.error);
  }, [mutatePoints, mutateBadges, mutatePresence]);

  // --- Computations ---
  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);

  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  // --- Best Badge ---
  const bestBadge = useMemo(() => {
    if (!Array.isArray(badges) || badges.length === 0) return null;
    const userBadges = BADGES.filter(b => badges.includes(b.code));
    if (userBadges.length === 0) return null;
    return userBadges.reduce((acc, b) => (b.streak > acc.streak ? b : acc), userBadges[0]);
  }, [badges]);

  // --- Repair Handler ---
  const handleRepair = async () => {
    if (!presence.gapInfo) return;

    const daysToRepair = presence.gapInfo.length;
    const totalCost = daysToRepair * 20;

    if (points < totalCost) {
      toast.error(`Nu ai suficiente puncte! Îți trebuie ${totalCost} XP pentru a repara ${daysToRepair} zile.`);
      return;
    }

    const toastId = toast.loading("Se repară streak-ul...");

    // Generate array of dates to repair
    const dates: string[] = [];
    const start = new Date(presence.gapInfo.start);
    const end = new Date(presence.gapInfo.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    try {
      // Repair each day
      for (const dateStr of dates) {
        await fetch("/api/students/points/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            points_delta: -20,
            reason: "repair",
            repaired_date: dateStr
          })
        }).then(r => {
          if (!r.ok) throw new Error("Failed to repair date: " + dateStr);
          return r.json();
        });
      }

      // Refresh via SWR
      mutatePoints();
      mutatePresence();

      repairGap(presence.gapInfo, 20); // Local update helper
      setLsTick(t => t + 1);
      toast.dismiss(toastId);
      toast.success("Streak reparat cu succes! 🛠️");

    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Eroare la reparare. Verifică punctele.");
    }
  };


  return (
    <div className="space-y-8 mt-10">
      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* statistici rapide */}
      <StudentStatsRow
        points={points}
        badgesCount={Array.isArray(badges) ? badges.length : 0}
        bestBadge={bestBadge}
      />

      {/* gamification row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <StreakHeroCard
            currentStreak={displayStreak}
            bestStreak={presence.bestStreak}
            goal={streakGoalForUI}
            todayVisited={raw.todayVisited}
            nextMilestone={nextMilestone}
            celebrate={celebrate}
            onCloseCelebrate={() => setCelebrate(null)}
          />

          {/* A) auto-freeze aplicat azi */}
          {presence.usedAutoFreezeNow && (
            <GentleBanner>
              {DASHBOARD_STRINGS.AUTO_FREEZE_MESSAGE}
            </GentleBanner>
          )}

          {/* B) pauză -> repair (DOAR DACĂ NU e mai mare de 1 zi / 2 zile since last login) */}
          {presence.gapInfo && presence.gapInfo.length === 1 && (
            <GentleBanner>
              {DASHBOARD_STRINGS.GAP_MESSAGE(presence.gapInfo.length)} ({presence.gapInfo.start}).{" "}
              {DASHBOARD_STRINGS.REPAIR_PROMPT}
              <button
                onClick={handleRepair}
                className="ml-2 px-2 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition"
              >
                {DASHBOARD_STRINGS.REPAIR_BUTTON}
              </button>
            </GentleBanner>
          )}

          {/* Mesaj pentru gap prea mare (nereparabil) */}
          {presence.gapInfo && presence.gapInfo.length > 1 && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm">
              Ai ratat {presence.gapInfo.length} zile. E prea târziu pentru a repara streak-ul. 😢
            </div>
          )}

          <div className="text-[11px] text-gray-500">
            {DASHBOARD_STRINGS.LAST_FREEZE_LABEL} {lastFreezeUsed ?? "—"}
            <span className="text-gray-400"> • </span>
            {DASHBOARD_STRINGS.LAST_REPAIR_LABEL} {lastRepairUsed ?? "—"}
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

      {/* oportunități de azi */}
      <TodaysOpportunities />
    </div>
  );
}