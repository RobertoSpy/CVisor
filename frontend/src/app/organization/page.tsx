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
  const hasLoggedPageview = React.useRef(false);
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

  // [FIX] Log Pageview for Streak Tracking
  useEffect(() => {
    if (hasLoggedPageview.current) return;
    hasLoggedPageview.current = true;

    fetch("/api/organizations/stats/pageview", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          // Reload metrics after login logged
          mutatePresence();
          mutatePoints();
          // Also check/unlock daily login badge if exists
        }
      })
      .catch(console.error);
  }, [mutatePresence, mutatePoints]);

  // ========== calcule ==========
  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);

  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  // [MODIFIED] Badge Logic: Level is determined by badges, Points are currency.
  // Unlock Next Level cost: 100 XP.
  useEffect(() => {
    if (!Array.isArray(badges)) return;

    // 1. Determine current level from badges
    const lvlBadges = badges
      .filter((b) => b.startsWith("lvl"))
      .map((b) => parseInt(b.replace("lvl", ""), 10))
      .sort((a, b) => b - a);

    const currentLevel = lvlBadges.length > 0 ? lvlBadges[0] : 1;

    // 2. Check if eligible for upgrade
    // Cost formula: LVL 1->2 (100pts), LVL 2->3 (200pts), LVL 3->4 (300pts)...
    // Cost = CurrentLevel * 100
    const upgradeCost = currentLevel * 100;

    if (points >= upgradeCost && currentLevel < 5) {
      const nextLevel = currentLevel + 1;
      const nextBadgeCode = `lvl${nextLevel}`;
      const badge = BADGES.find((b) => b.code === nextBadgeCode);

      if (!badge) return; // Should not happen if < 5

      // Perform transaction: Deduct Cost -> Unlock Badge
      fetch("/api/students/points/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          points_delta: -upgradeCost,
          reason: `upgrade_lvl${nextLevel}`,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Points deduction failed");
          return fetch("/api/students/badges/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ badge_code: nextBadgeCode }),
          });
        })
        .then((res) => res.json())
        .then((d) => {
          if (d.ok) {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6 },
              colors: ["#FFD700", "#FFA500", "#FFFFFF"],
            });
            toast.success(
              `Nivel Upgradat! Ai cheltuit ${upgradeCost} XP și ai atins Nivelul ${nextLevel}! 🚀`,
              {
                duration: 6000,
                icon: "🆙",
              }
            );
            mutatePoints();
            mutateBadges();
          }
        })
        .catch((err) => {
          console.error("Level up transaction failed", err);
          toast.error("Eroare la upgrade-ul nivelului.");
        });
    }
  }, [points, badges, mutatePoints, mutateBadges]);

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
          title="Nivel Curent"
          value={(() => {
            const maxLvl = Array.isArray(badges)
              ? Math.max(1, ...badges.filter(b => b.startsWith('lvl')).map(b => parseInt(b.replace('lvl', '')) || 0))
              : 1;
            return `LVL ${maxLvl}`;
          })()}
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
