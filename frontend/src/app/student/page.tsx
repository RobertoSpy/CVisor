"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import Link from "next/link";
import { FaStar, FaTrophy, FaCalendarCheck, FaMapMarkedAlt, FaFire, FaArrowRight, FaMedal } from "react-icons/fa";

import GentleBanner from "./components/dashboard/GentleBanner";
import GoalRing from "./components/charts/GoalRing";
import SparklineCard from "./components/charts/SparklineCard";
import ActivityHeatmap from "./components/charts/ActivityHeatmap";
import OrgPostsBar from "./components/charts/OrgPostsBar";
import StreakHeroCard from "./components/streak/StreakHeroCard";
import StudentStatsRow from "./components/dashboard/StudentStatsRow";
import InstallPrompt from "./components/InstallPrompt";
import TodaysOpportunities from "./components/dashboard/TodaysOpportunities";
import PremiumStatCard from "../components/shared/PremiumStatCard";
import ApiClient from "../../lib/api/client";

import useStudentData from "./hooks/useStudentData";
import { DASHBOARD_STRINGS } from "./constants";
import {
  BADGES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
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

  // --- Pageview / Daily Login ---
  useEffect(() => {
    if (hasLoggedPageview.current) return;
    hasLoggedPageview.current = true;

    ApiClient.post<{ ok: boolean; points_awarded: boolean; unlockedBadges?: { label?: string; code: string }[] }>(
      "/api/students/stats/pageview",
      {}
    )
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
            data.unlockedBadges.forEach((b) => {
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
    return userBadges.reduce((acc, b) => (b.points > acc.points ? b : acc), userBadges[0]);
  }, [badges]);

  // --- Repair Handler ---
  const handleRepair = async () => {
    if (!presence.gapInfo) return;

    const daysToRepair = presence.gapInfo.length;
    const totalCost = daysToRepair * 20;

    if (points < totalCost) {
      toast.error(`Nu ai suficiente puncte! Îți trebuie ${totalCost} puncte pentru a repara ${daysToRepair} zile.`);
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
      // Repair each day sequentially via ApiClient
      for (const dateStr of dates) {
        await ApiClient.post<{ points: number }>("/api/students/points/add", {
          points_delta: -20,
          reason: "repair",
          repaired_date: dateStr,
        });
      }

      // Wait briefly for DB to commit, then force SWR to refetch from server
      await new Promise(r => setTimeout(r, 500));
      await mutatePresence(undefined, { revalidate: true });
      await mutatePoints(undefined, { revalidate: true });

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
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        <InstallPrompt />

        {/* Stats Grid - 2 cols on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <PremiumStatCard
            title="Puncte"
            value={points}
            icon={<FaStar />}
            color="amber"
            subtext="Total acumulat"
          />
          <PremiumStatCard
            title="Badge-uri"
            value={badges ? badges.length : 0}
            icon={<FaTrophy />}
            color="indigo"
            subtext="Colecționate"
          />
          <PremiumStatCard
            title="Cel mai bun"
            value={bestBadge ? bestBadge.emoji : "—"}
            icon={<FaMedal />}
            color="purple"
            subtext={bestBadge ? bestBadge.label : "Niciun badge"}
          />
          <PremiumStatCard
            title="Streak Maxim"
            value={presence.bestStreak}
            icon={<FaFire />}
            color="red"
            subtext="Record personal"
          />
        </div>

        {/* Map Button */}
        <Link href="/student/map" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between group hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 grid place-items-center text-2xl">🗺️</div>
            <div>
              <div className="font-bold text-lg">Harta Progresului</div>
              <div className="text-blue-100 text-sm">Continuă aventura ta de voluntariat</div>
            </div>
          </div>
          <div className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm group-hover:bg-blue-50 transition-colors">
            Deschide Harta →
          </div>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Streak & Notifications */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Streak Card - Light Theme */}
            <div className="bg-white rounded-[2rem] border-2 border-indigo-50 p-1 shadow-lg shadow-indigo-500/5 overflow-hidden">
              <div className="p-4 md:p-6">
                <StreakHeroCard
                  currentStreak={displayStreak}
                  bestStreak={presence.bestStreak}
                  goal={streakGoalForUI}
                  todayVisited={raw.todayVisited}
                  nextMilestone={nextMilestone}
                  celebrate={celebrate}
                  onCloseCelebrate={() => setCelebrate(null)}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              {presence.usedAutoFreezeNow && (
                <GentleBanner>
                  ❄️ <b>Streak Înghețat!</b> Salvat pentru azi.
                </GentleBanner>
              )}
              {presence.gapInfo && (
                <GentleBanner>
                  ⚠️ Ai ratat {presence.gapInfo.length === 1 ? "o zi" : `${presence.gapInfo.length} zile`} ({presence.gapInfo.start}{presence.gapInfo.length > 1 ? ` → ${presence.gapInfo.end}` : ""}).
                  <button onClick={handleRepair} className="ml-2 bg-amber-600 text-white px-2 py-1 rounded text-xs hover:bg-amber-700">
                    Repară pentru {presence.gapInfo.length * 20} puncte
                  </button>
                </GentleBanner>
              )}
            </div>
          </div>

          {/* Right Column: Heatmap & Charts */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Heatmap */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Activitate</h3>
                  <p className="text-gray-400 text-xs font-medium">Heatmap Zilnic</p>
                </div>
              </div>
              <ActivityHeatmap data={heatmapData} />
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 px-1 text-sm">Postări Organizații</h4>
                <OrgPostsBar data={orgBars} />
              </div>
              <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-md flex flex-col justify-center">
                <h4 className="font-bold text-gray-800 mb-4 px-1 text-sm">Obiectiv Săptămânal</h4>
                <div className="flex-1 grid place-items-center py-2">
                  <GoalRing current={raw.weekCount} target={WEEK_GOAL} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Todays Opportunities */}
        <TodaysOpportunities />
      </div>
    </div>
  );
}