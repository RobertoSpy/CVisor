"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useOrganizationData from "../hooks/useOrganizationData";
import { FaLock, FaCheck, FaStar, FaMapMarkerAlt, FaQuestion } from "react-icons/fa";

// Map Configuration
const SCALE_FACTOR = 1;

const ORG_MAP_NODES = [
  { value: 25, type: "badge", label: "Începutul", lvl: 1, icon: "🌱" },
  { value: 50, type: "step", label: "Primele 50 XP" },
  { value: 100, type: "badge", label: "Nivel 2", lvl: 2, icon: "🥉" },
  { value: 200, type: "step", label: "200 XP" },
  { value: 300, type: "badge", label: "Nivel 3", lvl: 3, icon: "🥈" },
  { value: 450, type: "step", label: "450 XP" },
  { value: 600, type: "badge", label: "Nivel 4", lvl: 4, icon: "🥇" },
  { value: 800, type: "step", label: "800 XP" },
  { value: 1000, type: "badge", label: "Maestru", lvl: 5, icon: "🏆" },
];

function getLevelBaseXP(lvl: number) {
  switch (lvl) {
    case 1: return 0;
    case 2: return 100;
    case 3: return 300;
    case 4: return 600;
    case 5: return 1000;
    default: return 0;
  }
}

export default function MapPage() {
  const { points, badges } = useOrganizationData();

  const effectiveProgress = useMemo(() => {
    const maxLvl = Array.isArray(badges)
      ? Math.max(1, ...badges.filter(b => b.startsWith('lvl')).map(b => parseInt(b.replace('lvl', '')) || 0))
      : 1;
    const baseValue = getLevelBaseXP(maxLvl);
    return baseValue + points;
  }, [points, badges]);

  const MAX_VAL = ORG_MAP_NODES[ORG_MAP_NODES.length - 1].value;

  // Calculate percentage for the progress bar
  const progressPercent = Math.min(100, (effectiveProgress / MAX_VAL) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/organization" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-blue-200 shadow-sm">
            <span>←</span> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">XP Total</div>
              <div className="text-lg font-black text-blue-600">{effectiveProgress} XP</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 grid place-items-center border-2 border-white shadow-md">
              <FaStar />
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-xl mx-auto px-4 py-20 relative z-10">

        {/* Winding Path SVG Line */}
        <div className="absolute top-20 bottom-20 left-1/2 -translate-x-1/2 w-4 bg-gray-200 rounded-full -z-10">
          {/* Filled Path - Consistent Blue */}
          <div
            className="w-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ height: `${progressPercent}%` }}
          />
        </div>

        {/* Nodes */}
        <div className="flex flex-col gap-24 relative">
          {ORG_MAP_NODES.map((node, index) => {
            const isUnlocked = effectiveProgress >= node.value;
            const isNext = !isUnlocked && (index === 0 || effectiveProgress >= ORG_MAP_NODES[index - 1].value);
            const isRight = index % 2 === 0; // Zig-zag pattern

            // Calculate random offset for organic feel (simulated by margin)
            const sideClass = isRight ? "translate-x-12 sm:translate-x-24" : "-translate-x-12 sm:-translate-x-24";

            return (
              <div key={index} className={`flex ${isRight ? 'justify-end' : 'justify-start'} relative`}>
                {/* Node Card */}
                <div className={`
                    bg-white relative transition-all duration-500 hover:scale-105 z-10
                    ${node.type === 'badge' ? 'p-6 rounded-[2rem] w-48' : 'p-3 rounded-2xl w-32'}
                    ${isUnlocked ? 'shadow-xl shadow-blue-500/10 border-blue-100' : 'shadow-sm grayscale border-gray-100 opacity-70'}
                    border
                    flex flex-col items-center text-center
                    ${node.type === 'badge' ? sideClass : 'mx-auto'} 
                `}>

                  {/* Connection Line to Center */}
                  {node.type === 'badge' && (
                    <div className={`absolute top-1/2 -z-10 h-1 w-24 bg-gray-200 ${isRight ? 'right-full' : 'left-full'}`}>
                      <div className={`h-full bg-blue-500 transition-all duration-1000 ${isUnlocked ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}

                  <div className={`
                      h-16 w-16 rounded-2xl grid place-items-center text-3xl mb-2 shadow-inner
                      ${isUnlocked ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600' : 'bg-gray-100 text-gray-400'}
                    `}>
                    {node.icon || (isUnlocked ? <FaCheck className="text-xl" /> : <FaLock className="text-xl" />)}
                  </div>

                  <div className="font-bold text-gray-800 leading-tight">
                    {node.label}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-1">
                    {node.value} XP
                  </div>

                  {isNext && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl animate-bounce whitespace-nowrap border-2 border-white">
                      📍 ȚINTA
                    </div>
                  )}
                </div>

                {/* Center Dot for Steps */}
                {node.type === 'step' && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-gray-100 rounded-full z-20 shadow-sm flex items-center justify-center">
                    {isUnlocked && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* End Mystery Node */}
        <div className="mt-24 flex justify-center pb-20">
          <div className={`
             relative bg-gradient-to-b from-indigo-500 to-purple-600 p-1 rounded-full 
             grayscale opacity-50
           `}>
            <div className="bg-white rounded-full p-8 border-4 border-indigo-200">
              <div className="text-6xl text-indigo-400"><FaQuestion /></div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
              <div className="font-black text-gray-800 uppercase tracking-widest text-sm">SOON</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
