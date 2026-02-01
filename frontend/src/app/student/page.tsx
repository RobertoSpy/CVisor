"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import GentleBanner from "./components/dashboard/GentleBanner";
import GoalRing from "./components/charts/GoalRing";
import SparklineCard from "./components/charts/SparklineCard";
import ActivityHeatmap from "./components/charts/ActivityHeatmap";
import OrgPostsBar from "./components/charts/OrgPostsBar";
import StreakHeroCard from "./components/streak/StreakHeroCard";
import StudentStatsRow from "./components/dashboard/StudentStatsRow";
import TodaysOpportunities from "./components/dashboard/TodaysOpportunities";

import useStudentData from "./hooks/useStudentData";
import {
  BADGES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "./lib/streak";
import { DASHBOARD_STRINGS } from "./constants";

export default function StudentHome() {

  // ===== local state ====
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [lastFreezeUsed, setLastFreezeUsed] = useState<string | null>(null);
  const [hasLoggedPageview, setHasLoggedPageview] = useState(false);
  const [lsTick, setLsTick] = useState(0); // forțează re-calc după patch/repair

  // [FIX] Use SWR Hook instead of manual fetch
  const {
    points,
    badges,
    heatmapData,
    orgBars,
    createdAt,
    mutatePoints,
    mutateBadges,
    mutatePresence,
    isLoading
  } = useStudentData();

  const [lastRepairUsed, setLastRepairUsed] = useState<string | null>(null);

  const filteredHeatmap = useMemo(() => {
    if (!createdAt) return heatmapData;
    const cDate = new Date(createdAt);
    return Object.fromEntries(
      Object.entries(heatmapData).filter(
        ([day, _]) => new Date(day) >= cDate
      )
    );
  }, [heatmapData, createdAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLastRepairUsed(localStorage.getItem(LS_KEYS.lastRepairUsed));
  }, []);

  // ===== calcule =====
  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);

  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  useEffect(() => {
    if (presence.usedAutoFreezeNow && typeof window !== "undefined") {
      setLastFreezeUsed(localStorage.getItem(LS_KEYS.lastFreezeUsed));
      setLsTick((t) => t + 1);
    }
  }, [presence.usedAutoFreezeNow]);

  // [NEW] Daily Points & Pageview
  const pageviewLogged = useRef(false);
  useEffect(() => {
    if (pageviewLogged.current) return;
    pageviewLogged.current = true;

    fetch("/api/students/stats/pageview", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(r => r.json())
      .then(d => {
        setHasLoggedPageview(true);
        if (d.points_awarded) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          toast.success(DASHBOARD_STRINGS.LOGIN_POINTS_TOAST, {
            duration: 5000,
            icon: '💎',
          });
          // Refresh points via SWR
          mutatePoints();
          mutateBadges(); // Potențial badge nou
        }
        // Always refresh presence to ensure streak updates immediately after login logging
        mutatePresence();
      })
      .catch((e) => {
        console.error(e);
        setHasLoggedPageview(true);
      });
  }, []);

  // === REQUEST pentru puncte bonus la milestone ===
  useEffect(() => {
    if (celebrate !== null) {
      // Puncte de login se acordă oricum la primul pageview al zilei.
      // Aici trimitem badge_code DOAR când sărbătorim un milestone!
      fetch("/api/students/stats/pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ badge_code: `streak_${celebrate}` })
      });
    }
  }, [celebrate]);

  // ====== BADGE AUTO-UNLOCK LOGIC ======
  useEffect(() => {
    if (displayStreak === 0) return;

    BADGES.forEach(badge => {
      if (
        displayStreak >= badge.streak &&
        !badges.includes(badge.code)
      ) {
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
              toast.success(DASHBOARD_STRINGS.BADGE_UNLOCK_TOAST(badge.label), {
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
    });
  }, [displayStreak, badges]);

  const handleRepair = () => {
    if (points < 20) {
      toast.error(DASHBOARD_STRINGS.REPAIR_ERROR_POINTS);
      return;
    }

    if (!presence.gapInfo) return;
    const dateToRepair = presence.gapInfo.start;

    fetch("/api/students/points/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

        repairGap(presence.gapInfo!, 20); // marchează gap-ul ca patch-uit local
        setLsTick(t => t + 1);
        toast.success(DASHBOARD_STRINGS.REPAIR_SUCCESS);
      })
      .catch(() => toast.error(DASHBOARD_STRINGS.REPAIR_ERROR_GENERIC));
  };

  // Găsește badge-ul cu streak maxim pe care îl deține userul
  const bestBadge = useMemo(() => {
    // Dacă nu are niciun badge unlocked, default la LVL 1 (Badge 0)
    // Sau putem verifica dacă badges.includes('lvl1') etc.
    // Dar logic, toată lumea începe la LVL 1.
    if (!Array.isArray(badges)) return BADGES[0];

    const userBadges = BADGES.filter(b => badges.includes(b.code));
    if (userBadges.length === 0) return BADGES[0]; // Fallback to LVL 1

    return userBadges.reduce((acc, b) => (b.streak > acc.streak ? b : acc), userBadges[0]);
  }, [badges]);


  return (
    <div className="space-y-8 mt-10">
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