"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useOrganizationData from "../hooks/useOrganizationData";
import { BADGES } from "../../student/lib/streak";

// Definim nodurile hărții pentru Organizații (bazate pe XP Cumulativ)
// Scara:
// LVL 1: 0-100 XP (Node visual la 25)
// LVL 2: 100-300 XP (Cost 200) -> Node la 100
// LVL 3: 300-600 XP (Cost 300) -> Node la 300
// LVL 4: 600-1000 XP (Cost 400) -> Node la 600
// LVL 5: 1000+ XP -> Node la 1000
const ORG_MAP_NODES = [
  { value: 25, type: "badge", label: "LVL 1", lvl: 1 },
  { value: 50, type: "step", label: "50 XP" },
  { value: 100, type: "badge", label: "LVL 2", lvl: 2 },
  { value: 200, type: "step", label: "200 XP" },
  { value: 300, type: "badge", label: "LVL 3", lvl: 3 },
  { value: 450, type: "step", label: "450 XP" },
  { value: 600, type: "badge", label: "LVL 4", lvl: 4 },
  { value: 800, type: "step", label: "800 XP" },
  { value: 1000, type: "badge", label: "LVL 5", lvl: 5 },
];

function getLevelBaseXP(lvl: number) {
  switch (lvl) {
    case 1: return 0;
    case 2: return 100;
    case 3: return 300; // 100 + 200
    case 4: return 600; // 300 + 300
    case 5: return 1000; // 600 + 400
    default: return 0;
  }
}

export default function MapPage() {
  const { points, badges } = useOrganizationData();

  // Calculăm poziția efectivă pe hartă
  // Poziția = Baza Nivelului Curent (XP investit deja) + Punctele Curente (XP lichid)
  const effectiveProgress = useMemo(() => {
    // 1. Găsim cel mai mare nivel deținut
    const maxLvl = Array.isArray(badges)
      ? Math.max(1, ...badges.filter(b => b.startsWith('lvl')).map(b => parseInt(b.replace('lvl', '')) || 0))
      : 1;

    // 2. Determinăm baza
    const baseValue = getLevelBaseXP(maxLvl);

    // 3. Adăugăm punctele curente
    return baseValue + points;
  }, [points, badges]);

  const MAX_VAL = ORG_MAP_NODES[ORG_MAP_NODES.length - 1].value;

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Background decoration - subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full z-10">
        <div className="flex items-center justify-between mb-12">
          <Link href="/organization" className="flex items-center gap-2 text-gray-600 hover:text-primary transition font-medium bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
            <span>←</span> Înapoi la Dashboard
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mapa Progresului</h1>
            <div className="text-sm text-gray-500 font-medium">XP Total (Estimativ): {effectiveProgress}</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center space-y-12 py-10 pb-32">
          {/* Connecting Line */}
          <div className="absolute top-10 bottom-10 w-3 bg-gray-200 -z-10 rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-600 transition-all duration-1000 ease-out"
              style={{ height: `${Math.min(100, (effectiveProgress / MAX_VAL) * 100)}%` }}
            />
          </div>

          {ORG_MAP_NODES.map((node, index) => {
            const isUnlocked = effectiveProgress >= node.value;
            // Next is the FIRST node strictly greater than effectiveProgress
            // Actually usually "Next" is the immediate target.
            // Let's keep simpler visual logic:

            const isBadge = node.type === "badge";

            return (
              <div
                key={index}
                className={`relative group flex items-center justify-center transition-all duration-500 transform 
                  ${isBadge ? "w-24 h-24 border-4" : "w-14 h-14 border-2"}
                  ${isUnlocked
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-white text-white scale-100 shadow-xl"
                    : "bg-white border-gray-300 text-gray-300 grayscale opacity-80 scale-95"
                  }
                  rounded-full
                `}
              >
                <div className="text-center relative z-10">
                  <div className={`${isBadge ? "text-xl" : "text-sm"} font-black`}>
                    {isBadge ? `LVL ${node.lvl}` : node.value}
                  </div>
                  {isBadge && <div className="text-[9px] uppercase font-bold tracking-wider opacity-80">Badge</div>}
                </div>

                {/* Label Tooltip */}
                <div className={`absolute left-full ml-6 px-4 py-2 rounded-xl shadow-md whitespace-nowrap font-bold text-sm transition-all duration-300 z-20 
                    ${isUnlocked ? "bg-white text-gray-800 translate-x-0 opacity-100" : "bg-gray-100 text-gray-400 opacity-60"}
                  `}>
                  {node.label} ({node.value} XP)
                  {isUnlocked && <span className="ml-2 text-green-500">✓</span>}

                  {/* Current Position Indicator */}
                  {!isUnlocked && effectiveProgress < node.value && (index === 0 || effectiveProgress >= ORG_MAP_NODES[index - 1].value) && (
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex items-center animate-bounce">
                      <span className="text-2xl">📍</span>
                    </div>
                  )}

                  <div className={`absolute top-1/2 -left-2 w-4 h-4 transform -translate-y-1/2 rotate-45 ${isUnlocked ? "bg-white" : "bg-gray-100"}`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend / Info */}
        <div className="text-center mt-16 p-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 relative z-30">
          <p className="text-gray-600 font-medium">
            Acumulează XP pentru a trece la nivelul următor!
            <br />
            <span className="text-xs opacity-70">(Costul crește cu fiecare nivel: 100, 200, 300 XP...)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
