"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import Stat from "../student/components/dashboard/Stat";
import GentleBanner from "../student/components/dashboard/GentleBanner";
import GoalRing from "../student/components/charts/GoalRing";
import SparklineCard from "../student/components/charts/SparklineCard";
import ActivityHeatmap from "../student/components/charts/ActivityHeatmap";
import OrgPostsBar from "../student/components/charts/OrgPostsBar";
import StreakHeroCard from "../student/components/streak/StreakHeroCard";

import useOrganizationAnalytics from "./hooks/useOrganizationAnalytics";
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

  const { heatmapData, orgBars, createdAt } = useOrganizationAnalytics(hasLoggedPageview);
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

  // ========== calcule ==========
  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);

  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  useEffect(() => {
    fetch("/api/organizations/stats/pageview", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    })
      .then(() => setHasLoggedPageview(true))
      .catch(() => setHasLoggedPageview(true));
  }, []);

  useEffect(() => {
    if (STREAK_MILESTONES.includes(displayStreak as any)) {
      const key = `org_streak:celebrated:${displayStreak}`;
      if (!localStorage.getItem(key)) {
        setCelebrate(displayStreak);
        localStorage.setItem(key, "1");
      }
    }
  }, [displayStreak]);

  useEffect(() => {
    if (celebrate !== null) {
      fetch("/api/organizations/stats/pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({ badge_code: `streak_${celebrate}` })
      });
    }
  }, [celebrate]);

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

  // ====== POINTS AND BADGES ======
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/organizations/points", {
      credentials: 'include',
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(r => r.json())
      .then(d => setPoints(d.points));

    fetch("/api/organizations/badges", {
      credentials: 'include',
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(r => r.json())
      .then(d => setBadges(Array.isArray(d.badges) ? d.badges : []))
      .catch(() => setBadges([]));
  }, []);

  useEffect(() => {
    BADGES.forEach(badge => {
      if (
        displayStreak >= badge.streak &&
        !badges.includes(badge.code)
      ) {
        fetch("/api/organizations/badges/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          credentials: "include",
          body: JSON.stringify({ badge_code: badge.code })
        }).then(() => {
          fetch("/api/organizations/badges", { 
            credentials: 'include', 
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
           })
            .then(r => r.json())
            .then(d => setBadges(d.badges));
        });
      }
    });
  }, [displayStreak, badges]);

  const handleRepair = () => {
    if (points < 20) {
      alert("Nu ai suficiente puncte pentru repair!");
      return;
    }
    fetch("/api/organizations/points/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        points_delta: -20,
        reason: "repair"
      })
    })
    .then(r => r.json())
    .then(d => {
      setPoints(d.points);
      repairGap(presence.gapInfo, 20);
      setLsTick(t => t + 1);
    });
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
          className="inline-flex items-center gap-2 bg-emerald-200 hover:bg-emerald-400 px-4 py-2 rounded transition"
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
                className="ml-2 px-2 py-1 rounded-md bg-amber-600 text-white"
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

      {/* recomandate */}
      <section className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Oportunități recomandate voluntarilor</h2>
        <p className="text-sm text-gray-600 mb-4">Vezi lista completă și atrage voluntari potriviți.</p>
        <Link
          href="/organization/opportunities"
          className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow"
        >
          Vezi oportunități <span>→</span>
        </Link>
      </section>
    </div>
  );
}