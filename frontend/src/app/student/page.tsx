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
const { heatmapData, orgBars, createdAt } = useStudentAnalytics(hasLoggedPageview);
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


  const displayStreak = presence.currentStreak; // include auto-patch
  const nextMilestone = useMemo(() => nextMilestoneFor(displayStreak), [displayStreak]);
  const streakGoalForUI = nextMilestone ?? 3;
  const WEEK_GOAL = 5;


useEffect(() => {
  fetch("/api/students/stats/pageview", {
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



  // === REQUEST pentru puncte bonus la milestone ===
  useEffect(() => {
    if (celebrate !== null) {
      // Puncte de login se acordă oricum la primul pageview al zilei.
      // Aici trimitem badge_code DOAR când sărbătorim un milestone!
      fetch("/api/students/stats/pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({ badge_code: `streak_${celebrate}` }) // sau codul real al badge-ului
      });
    }
  }, [celebrate]);

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

  // ====== POINTS AND BADGES ======
// ====== POINTS AND BADGES ======
const [points, setPoints] = useState(0);
const [badges, setBadges] = useState<string[]>([]);

useEffect(() => {
  
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("/api/students/points", {
    credentials: 'include',
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  })
    .then(r => r.json())
    .then(d => setPoints(d.points));

  fetch("/api/students/badges", {
    credentials: 'include',
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  })
    .then(r => r.json())
    .then(d => setBadges(Array.isArray(d.badges) ? d.badges : []))
    .catch(() => setBadges([]));
}, []);
  // ====== BADGE AUTO-UNLOCK LOGIC ======
  useEffect(() => {
    BADGES.forEach(badge => {
      if (
        displayStreak >= badge.streak &&
        !badges.includes(badge.code)
      ) {
        fetch("/api/students/badges/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          credentials: "include",
          body: JSON.stringify({ badge_code: badge.code })
        }).then(() => {
          // Refetch badges list to refresh UI
          fetch("/api/students/badges", { 
            credentials: 'include', 
            headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  }
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
  fetch("/api/students/points/add", {
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
    setPoints(d.points); // actualizează punctele local
    repairGap(presence.gapInfo, 20); // marchează gap-ul ca patch-uit
    setLsTick(t => t + 1);
  });
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