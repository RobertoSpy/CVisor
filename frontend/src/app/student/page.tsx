"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import Stat from "./components/dashboard/Stat";
import GentleBanner from "./components/dashboard/GentleBanner";
import GoalRing from "./components/charts/GoalRing";
import SparklineCard from "./components/charts/SparklineCard";
import ActivityHeatmap from "./components/charts/ActivityHeatmap";
import OrgPostsBar from "./components/charts/OrgPostsBar";
import StreakHeroCard from "./components/streak/StreakHeroCard";

import useStudentData from "./hooks/useStudentData"; // [NEW] SWR Hook
import {
  BADGES,
  STREAK_MILESTONES,
  computeStreakAuto,
  derivePresenceMetrics,
  deriveRawPresence,
  nextMilestoneFor,
  repairGap,
  LS_KEYS,
} from "./lib/streak";

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
    mutatePresence
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
  const pageviewLogged = React.useRef(false);
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
          toast.success("Ai primit 5 puncte pentru login-ul de azi! 💎", {
            duration: 5000,
            icon: '💎',
          });
          // Refresh points via SWR
          mutatePoints();
        }
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
    });
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

        repairGap(presence.gapInfo, 20); // marchează gap-ul ca patch-uit local (visual feedback)
        setLsTick(t => t + 1);
        toast.success("Streak reparat cu succes! 🛠️");
      })
      .catch(() => toast.error("Eroare la reparare"));
  };

  // Găsește badge-ul cu streak maxim pe care îl deține userul
  const bestBadge = useMemo(() => {
    if (!Array.isArray(badges) || badges.length === 0) return null;
    // Caută badge-ul cu streak maxim deținut (din BADGES, ca să iei emoji/label corect)
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
          href="/student/map"
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

function TodaysOpportunities() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opportunities?period=today", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOpps(data.slice(0, 5)); // Top 5
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Se încarcă oportunitățile de azi...</div>;

  if (opps.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Oportunități noi astăzi</h2>
        <p className="text-gray-500 text-sm">Nu au fost postate oportunități noi astăzi. Revino mâine!</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-gray-800">🔥 Oportunități postate azi</h2>
        <Link href="/student/opportunities" className="text-sm text-primary font-semibold hover:underline">
          Vezi toate
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {opps.map((opp) => (
          <Link
            key={opp.id}
            href={`/student/opportunities/${opp.id}`}
            className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
          >
            <div className="h-32 bg-gray-200 relative">
              {opp.banner_image ? (
                <img src={opp.banner_image} alt={opp.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
                {opp.type}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition">{opp.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{opp.orgName}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {(opp.skills || []).slice(0, 2).map((skill: string) => (
                  <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
                {(opp.skills || []).length > 2 && (
                  <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-full">
                    +{opp.skills.length - 2}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400">
                Deadline: {new Date(opp.deadline).toLocaleDateString("ro-RO")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}