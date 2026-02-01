"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MAP_NODES } from "../lib/streak";

export default function StudentMapPage() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxBadgeStreak, setMaxBadgeStreak] = useState(0);

  useEffect(() => {
    // 1. Fetch badges to determine max unlocked streak
    fetch("/api/students/badges", {
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.badges && Array.isArray(d.badges)) {
          const maxBadge = d.badges
            .filter((b: string) => b.startsWith("streak_"))
            .map((b: string) => parseInt(b.replace("streak_", "")))
            .sort((a: number, b: number) => b - a)[0];
          if (maxBadge) setMaxBadgeStreak(maxBadge);
        }
      });

    // 2. Fetch live presence to get current streak
    fetch("/api/students/stats/presence", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        // Logică simplificată streak: ne uităm la zile consecutive mergând înapoi de la azi
        if (d.map) {
          const today = new Date().toISOString().slice(0, 10);
          let strk = 0;
          // verificăm 365 zile în urmă
          for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            if (d.map[dateStr] > 0) {
              strk++;
            } else {
              // dacă e azi și nu am intrat încă, nu rupem streak-ul dacă ieri am intrat
              if (i === 0) continue;
              break;
            }
          }
          setCurrentStreak(strk);
        }
      })
      .catch(e => console.error("Map streak fetch err:", e));
  }, []);

  // HIGHEST WATERMARK LOGIC:
  // Progresul pe hartă e dat de Maximul dintre (Streak Curent) și (Cel mai mare Badge).
  // Dacă pierzi streak-ul, rămâi la nivelul badge-ului.
  // Dacă faci un nou record, avansezi.
  const effectiveStreak = Math.max(currentStreak, maxBadgeStreak);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Background decoration - subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gray-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full z-10">
        <div className="flex items-center justify-between mb-12">
          <Link href="/student" className="flex items-center gap-2 text-gray-600 hover:text-primary transition font-medium bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
            <span>←</span> Înapoi la Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mapa Progresului</h1>
        </div>

        <div className="relative flex flex-col items-center space-y-12 py-10 pb-32">
          {/* Connecting Line */}
          <div className="absolute top-10 bottom-10 w-2 bg-gray-200 -z-10 rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-b from-green-400 to-blue-500 transition-all duration-1000"
              style={{ height: `${Math.min(100, (effectiveStreak / 150) * 100)}%` }}
            />
          </div>

          {MAP_NODES.map((node, index) => {
            const isUnlocked = effectiveStreak >= node.streak;
            const isNext = !isUnlocked && (index === 0 || effectiveStreak >= MAP_NODES[index - 1].streak);
            const isBadge = node.type === "badge";
            const isSoon = node.type === "soon";

            if (isSoon) {
              return (
                <div key={index} className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 text-gray-400 shadow-inner">
                  <span className="font-bold text-sm">SOON</span>
                </div>
              )
            }

            return (
              <div
                key={index}
                className={`relative group flex items-center justify-center transition-all duration-500 transform 
                  ${isBadge ? "w-28 h-28 border-4" : "w-16 h-16 border-2"}
                  ${isUnlocked
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-white text-white scale-100 shadow-xl"
                    : isNext
                      ? "bg-white border-blue-400 text-blue-400 animate-pulse scale-105 shadow-lg"
                      : "bg-gray-100 border-gray-200 text-gray-300 grayscale blur-[1px] opacity-70 scale-95"
                  }
                  rounded-full
                `}
              >
                <div className="text-center relative z-10">
                  <div className={`${isBadge ? "text-2xl" : "text-lg"} font-black`}>{node.streak}</div>
                  {isBadge && <div className="text-[10px] uppercase font-bold tracking-wider">Zile</div>}
                </div>

                {/* Label Tooltip/Badge */}
                <div className={`absolute left-full ml-6 px-4 py-2 rounded-xl shadow-md whitespace-nowrap font-bold text-sm transition-all duration-300 z-20 ${isUnlocked
                  ? "bg-white text-gray-800 translate-x-0 opacity-100"
                  : "bg-gray-100 text-gray-400 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}>
                  {node.label}
                  {isUnlocked && <span className="ml-2 text-green-500">✓</span>}
                  <div className={`absolute top-1/2 -left-2 w-4 h-4 transform -translate-y-1/2 rotate-45 ${isUnlocked ? "bg-white" : "bg-gray-100"}`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fog Effect Overlay */}
        <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none z-20 bg-gradient-to-t from-gray-200/90 via-gray-100/60 to-transparent backdrop-blur-[2px]"></div>

        <div className="text-center mt-16 p-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 relative z-30">
          <p className="text-gray-600 font-medium">
            Continuă să intri zilnic pentru a debloca noi nivele și a elimina "ceața" de pe hartă! 🌫️
          </p>
        </div>
      </div>
    </div>
  );
}