"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import Stat from "../student/components/dashboard/Stat";
import GentleBanner from "../student/components/dashboard/GentleBanner";
import GoalRing from "../student/components/charts/GoalRing";
import SparklineCard from "../student/components/charts/SparklineCard";
import ActivityHeatmap from "../student/components/charts/ActivityHeatmap";
import OrgPostsBar from "../student/components/charts/OrgPostsBar";
import StreakHeroCard from "../student/components/streak/StreakHeroCard";

import useOrganizationData from "./hooks/useOrganizationData"; // [NEW] SWR Hook
import {
  BADGES,
  STREAK_MILESTONES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "../student/lib/streak";

export default function OrganizationHome() {
  // ========== local state ==========
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [lastFreezeUsed, setLastFreezeUsed] = useState<string | null>(null);
  const [hasLoggedPageview, setHasLoggedPageview] = useState(false);
  const [lsTick, setLsTick] = useState(0);

  // [FIX] Use SWR Hook
  const {
    points,
    badges,
    heatmapData,
    orgBars,
    createdAt,
    mutatePoints,
    mutateBadges,
    mutatePresence
  } = useOrganizationData();

  const [lastRepairUsed, setLastRepairUsed] = useState<string | null>(null);

  const filteredHeatmap = useMemo(() => {
    if (!createdAt) return heatmapData;
    const cDate = new Date(createdAt);
    cDate.setHours(0, 0, 0, 0);
    return Object.fromEntries(
      Object.entries(heatmapData).filter(
        ([day, _]) => {
          const d = new Date(day);
          d.setHours(0, 0, 0, 0);
          return d >= cDate;
        }
      )
    );
  }, [heatmapData, createdAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLastRepairUsed(localStorage.getItem(LS_KEYS.lastRepairUsed));
  }, []);

  // ========== calcule ==========
  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);

  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  // Check if current streak matches a badge milestone
  useEffect(() => {
    const badge = BADGES.find(b => b.streak === displayStreak);
    if (badge) {
      // Check if we already have it locally (optimization)
      if (badges.includes(badge.code)) return;

      // Try to unlock on backend
      fetch("/api/students/badges/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ badge_code: badge.code })
      })
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            // Success!
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#FFD700', '#FFA500'] // Gold colors
            });
            toast.success(`Felicitări! Ai deblocat badge-ul "${badge.label}" și ai primit 5 puncte! 🏅`, {
              duration: 6000,
              icon: '🏆',
            });
            // Refresh via SWR
            mutateBadges();
            mutatePoints();
          }
        })
        .catch(console.error);
    }
  }, [displayStreak, badges]);

  const handleRepair = () => {
    if (points < 20) {
      toast.error("Nu ai suficiente puncte pentru repair!");
      return;
    }

    if (!presence.gapInfo) return;

    const dateToRepair = presence.gapInfo.start;

    fetch("/api/students/points/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        points_delta: -20,
        reason: "repair",
        repaired_date: dateToRepair
      })
    })
      .then(r => r.json())
      .then(d => {
        // Refresh via SWR
        mutatePoints();
        mutatePresence();

        repairGap(presence.gapInfo, 20);
        setLsTick(t => t + 1);
        toast.success("Streak reparat cu succes! 🛠️");
      })
      .catch(() => toast.error("Eroare la reparare"));
  };

  const bestBadge = useMemo(() => {
    if (!Array.isArray(badges) || badges.length === 0) return null;
    const userBadges = BADGES.filter(b => badges.includes(b.code));
    if (userBadges.length === 0) return null;
    return userBadges.reduce((acc, b) => (b.streak > acc.streak ? b : acc), userBadges[0]);
  }, [badges]);

  return (
    <div className="space-y-8 mt-10">
      {/* statistici rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Stat title="Puncte" value={points} />
        <Stat title="Badge-uri" value={Array.isArray(badges) ? badges.length : 0} />
        <Stat
          title="Badge-ul tău actual"
          value={
            bestBadge
              ? `${bestBadge.label} ${bestBadge.emoji}`
              : "Niciun badge de streak deblocat"
          }
        />
        <Link
          href="/organization/map"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-500 text-white hover:opacity-90 px-4 py-2 rounded transition shadow-md"
        >
          🗺️ Mapa progres
        </Link>
      </div>

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
          {presence.usedAutoFreezeNow && (
            <GentleBanner>
              Bine că ai revenit! 💛 Ți-am „înghețat” streak-ul pentru o zi lipsă — se mai întâmplă.
            </GentleBanner>
          )}
          {presence.gapInfo && (
            <GentleBanner>
              Ai avut o pauză de <b>{presence.gapInfo.length}</b> zile ({presence.gapInfo.start} → {presence.gapInfo.end}).{" "}
              Poți repara streakul:
              <button
                onClick={handleRepair}
                className="ml-2 px-2 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition"
              >
                Repară pentru 20 puncte
              </button>
            </GentleBanner>
          )}
          <div className="text-[11px] text-gray-500">
            Ultimul auto-freeze: {lastFreezeUsed ?? "—"}
            <span className="text-gray-400"> • </span>
            Ultimul repair: {lastRepairUsed ?? "—"}
          </div>
        </div>
        <GoalRing current={raw.weekCount} target={WEEK_GOAL} />
        <SparklineCard values={raw.last14Flags} />
      </div>

      {/* grafice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityHeatmap data={heatmapData} />
        <OrgPostsBar data={orgBars} />
      </div>
    </div>
  );

}
