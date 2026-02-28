"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  FaChartLine,
  FaUserFriends,
  FaStar,
  FaTrophy,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaFire,
  FaArrowRight
} from "react-icons/fa";

import {
  PremiumStatCard,
  GentleBanner,
  GoalRing,
  SparklineCard,
  ActivityHeatmap,
  OrgPostsBar,
  StreakHeroCard,
  InstallPrompt,
} from "../components/shared";

import useOrganizationData from "./hooks/useOrganizationData";
import ApiClient from "../../lib/api/client";
import {
  BADGES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "../student/lib/streak";


function DashboardHeader({ name }: { name: string }) {
  const dateStr = new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          {dateStr}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Salut, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{name || "Partener"}</span>! 👋
        </h1>
        <p className="text-lg text-gray-500 font-medium mt-2 max-w-xl">
          Iată o privire de ansamblu asupra impactului pe care îl aveți în comunitate.
        </p>
      </div>
      <Link href="/organization/map" className="group flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-900/5 ring-1 ring-black/5 hover:ring-blue-500/30 transition-all">
        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-lg">
          <FaMapMarkedAlt />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-gray-400 uppercase">Explorare</div>
          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Mapa Progres</div>
        </div>
        <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors ml-2" />
      </Link>
    </div>
  );
}

export default function OrganizationHome() {
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [lastFreezeUsed, setLastFreezeUsed] = useState<string | null>(null);
  const hasLoggedPageview = useRef(false);
  const [lsTick, setLsTick] = useState(0);

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
      Object.entries(heatmapData).filter(([day]) => {
        const d = new Date(day);
        d.setHours(0, 0, 0, 0);
        return d >= cDate;
      })
    );
  }, [heatmapData, createdAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLastRepairUsed(localStorage.getItem(LS_KEYS.lastRepairUsed));
  }, []);

  useEffect(() => {
    if (hasLoggedPageview.current) return;
    hasLoggedPageview.current = true;
    ApiClient.post<{ ok: boolean; points_awarded?: boolean }>("/api/organizations/stats/pageview", {})
      .then((data) => {
        if (data.ok) {
          mutatePresence();
          mutatePoints();
          if (data.points_awarded) {
            toast.success("Ai primit 5 puncte! 💎");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#3b82f6", "#60a5fa", "#ffffff"] });
          }
        }
      })
      .catch(console.error);
  }, [mutatePresence, mutatePoints]);

  const presence = useMemo(() => computeStreakAuto(filteredHeatmap), [filteredHeatmap, lsTick]);
  const metrics = useMemo(() => derivePresenceMetrics(filteredHeatmap), [filteredHeatmap, lsTick]);
  const raw = useMemo(() => deriveRawPresence(filteredHeatmap), [filteredHeatmap]);
  const displayStreak = presence.currentStreak;
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;

  useEffect(() => {
    if (!Array.isArray(badges)) return;
    const lvlBadges = badges.filter((b) => b.startsWith("lvl")).map((b) => parseInt(b.replace("lvl", ""), 10)).sort((a, b) => b - a);
    const currentLevel = lvlBadges.length > 0 ? lvlBadges[0] : 1;
    const upgradeCost = currentLevel * 100;

    if (points >= upgradeCost && currentLevel < 5) {
      const nextLevel = currentLevel + 1;
      const nextBadgeCode = `lvl${nextLevel}`;

      // We check if we already have it to avoid loop logic, though API is safe
      if (badges.includes(nextBadgeCode)) return;

      ApiClient.post<{ points: number }>("/api/organizations/points/add", {
        points_delta: -upgradeCost,
        reason: `upgrade_lvl${nextLevel}`
      })
        .then((d) => {
          if (d.points !== undefined) {
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ["#FFD700", "#FFA500", "#FFFFFF"] });
            toast.success(`Nivel Upgradat! Nivel ${nextLevel} atins! 🚀`, { duration: 6000, icon: "🆙" });
            mutatePoints();
            mutateBadges();
          }
        })
        .catch(console.error);
    }
  }, [points, badges, mutatePoints, mutateBadges]);

  const handleRepair = async () => {
    if (!presence.gapInfo) return;
    const daysToRepair = presence.gapInfo.length;
    const totalCost = daysToRepair * 20;

    if (points < totalCost) {
      toast.error(`Necesari ${totalCost} XP pentru a repara ${daysToRepair} zile.`);
      return;
    }

    const toastId = toast.loading("Se repară streak-ul...");
    const dates: string[] = [];
    const start = new Date(presence.gapInfo.start);
    const end = new Date(presence.gapInfo.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    try {
      for (const dateStr of dates) {
        await ApiClient.post("/api/organizations/points/add", {
          points_delta: -20,
          reason: "repair",
          repaired_date: dateStr
        });
      }
      mutatePoints();
      mutatePresence();
      repairGap(presence.gapInfo, 20);
      setLsTick(t => t + 1);
      toast.dismiss(toastId);
      toast.success("Streak reparat cu succes! 🛠️");
    } catch {
      toast.dismiss(toastId);
      toast.error("Eroare la reparare.");
    }
  };

  const level = Array.isArray(badges) ? Math.max(1, ...badges.filter(b => b.startsWith('lvl')).map(b => parseInt(b.replace('lvl', '')) || 0)) : 1;

  // Mock Org Name (Should fetch from profile context)
  const orgName = ""; // Or fetch this if needed, for now empty string triggers "Partener"

  return (
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        <InstallPrompt />

        {/* Stats Grid - 2 cols on mobile for compactness */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <PremiumStatCard
            title="Puncte"
            value={points}
            icon={<FaStar />}
            color="amber"
            subtext={`Next: ${level * 100}`}
          />

          <PremiumStatCard
            title="Nivel"
            value={`LVL ${level}`}
            icon={<FaTrophy />}
            color="indigo"
          />

          <PremiumStatCard
            title="Badge-uri"
            value={Array.isArray(badges) ? badges.length : 0}
            icon={<FaCalendarCheck />}
            color="pink"
          />

          <PremiumStatCard
            title="Voluntari"
            value="--"
            icon={<FaUserFriends />}
            color="emerald"
          />
        </div>

        {/* Map Button - Clearly visible now */}
        <Link href="/organization/map" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between group hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 grid place-items-center text-2xl">🗺️</div>
            <div>
              <div className="font-bold text-lg">Harta Progresului</div>
              <div className="text-blue-100 text-sm">Vezi nivelul tău și recompensele următoare</div>
            </div>
          </div>
          <div className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm group-hover:bg-blue-50 transition-colors">
            Deschide Harta →
          </div>
        </Link>

        {/* Gamification & Heatmap Row */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Streak Card - Light Theme */}
            <div className="bg-white rounded-[2rem] border-2 border-indigo-50 p-1 shadow-lg shadow-indigo-500/5 overflow-hidden">
              {/* Pass light theme prop or style wrapper */}
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

            {/* Notifications / Banners - Compact */}
            <div className="space-y-3">
              {presence.usedAutoFreezeNow && (
                <GentleBanner>
                  ❄️ <b>Streak Înghețat!</b> Salvat pentru azi.
                </GentleBanner>
              )}
              {presence.gapInfo && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between">
                  <div className="text-sm text-amber-800">
                    <p className="font-bold">Streak pierdut ({presence.gapInfo.length} zile)</p>
                  </div>
                  <button onClick={handleRepair} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                    Repară (20 XP)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Heatmap Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Activitate</h3>
                  <p className="text-gray-400 text-xs font-medium">Consistența în timp</p>
                </div>
                {/* Year tag removed for space */}
              </div>
              <ActivityHeatmap data={heatmapData} />
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 px-1 text-sm">Postări / Săptămână</h4>
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
      </div>
    </div>
  );
}
