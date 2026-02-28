"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { FaLock, FaCheck, FaStar, FaQuestion, FaFire } from "react-icons/fa";
import { MAP_NODES, BADGES } from "../lib/streak";
import ApiClient from "../../../lib/api/client";

export default function StudentMapPage() {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch points to determine progress on the map
    ApiClient.get<{ points?: number }>("/api/students/points")
      .then(d => {
        if (d.points !== undefined) setCurrentPoints(d.points);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Map points fetch err:", e);
        setLoading(false);
      });
  }, []);

  // Merge MAP_NODES with BADGES data for rich UI
  const richNodes = useMemo(() => {
    return MAP_NODES.map(node => {
      const badgeInfo = BADGES.find(b => b.points === node.points);
      return {
        ...node,
        icon: badgeInfo?.emoji,
        description: badgeInfo?.description,
        feature: badgeInfo?.feature
      };
    });
  }, []);

  const MAX_VAL = richNodes[richNodes.length - 2]?.points || 1000; // Use second to last as max (last is SOON)
  const progressPercent = Math.min(100, (currentPoints / MAX_VAL) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/student" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-blue-200 shadow-sm">
            <span>←</span> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Puncte Totale</div>
              <div className="text-lg font-black text-blue-600">{currentPoints} Puncte</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-500 grid place-items-center border-2 border-white shadow-md">
              <FaStar />
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-xl mx-auto px-4 py-20 relative z-10">

        {/* Path */}
        <div className="absolute top-20 bottom-32 left-1/2 -translate-x-1/2 w-4 bg-gray-200 rounded-full -z-10">
          <div
            className="w-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ height: `${progressPercent}%` }}
          />
        </div>

        {/* Nodes */}
        <div className="flex flex-col gap-24 relative">
          {richNodes.map((node, index) => {
            if (node.type === 'soon') return null;

            const isUnlocked = currentPoints >= node.points;
            const isNext = !isUnlocked && (index === 0 || currentPoints >= richNodes[index - 1].points);
            const isRight = index % 2 === 0;

            const sideClass = isRight ? "translate-x-12 sm:translate-x-24" : "-translate-x-12 sm:-translate-x-24";

            return (
              <div key={index} className={`flex ${isRight ? 'justify-end' : 'justify-start'} relative min-h-[120px]`}>
                <div className={`
                    bg-white relative transition-all duration-500 hover:scale-105 z-10
                    ${node.type === 'badge' ? 'p-6 rounded-[2rem] w-56' : 'p-3 rounded-2xl w-32'}
                    ${isUnlocked ? 'shadow-xl shadow-blue-500/10 border-blue-100' : 'shadow-sm grayscale border-gray-100 opacity-70'}
                    border
                    flex flex-col items-center text-center
                    ${node.type === 'badge' ? sideClass : 'mx-auto'} 
                `}>

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
                    {node.points} Puncte
                  </div>

                  {(node.feature && node.type === 'badge') && (
                    <div className="mt-2 text-[10px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                      {node.feature}
                    </div>
                  )}

                  {isNext && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl animate-bounce whitespace-nowrap border-2 border-white">
                      📍 ȚINTA TA
                    </div>
                  )}
                </div>

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
        <div className="mt-24 flex justify-center pb-20 relative">
          <div className="absolute -top-24 bottom-20 left-1/2 -translate-x-1/2 w-4 bg-gray-200 rounded-full -z-10" />

          <div className={`
             relative bg-gradient-to-b from-indigo-500 to-purple-600 p-1 rounded-full 
             grayscale opacity-50
           `}>
            <div className="bg-white rounded-full p-8 border-4 border-indigo-200">
              <div className="text-6xl text-indigo-400"><FaQuestion /></div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
              <div className="font-black text-gray-800 uppercase tracking-widest text-sm">LEGENDARY</div>
              <div className="font-bold text-indigo-400">Soon</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}